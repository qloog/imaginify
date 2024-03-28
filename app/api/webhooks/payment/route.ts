import dayjs from "dayjs";
import { headers } from "next/headers";
import { Buffer } from "buffer";
import crypto from "crypto";
import rawBody from "raw-body";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { client } from "@/lib/lemonsqueezy/lemons";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { boostPack } from "@/lib/actions/membership.action";
import { clearTodayUsage } from "@/lib/actions/membership.action";

export async function POST(request: Request) {
  console.log('webhook');
  const body = await rawBody(Readable.from(Buffer.from(await request.text())));
  const headersList = headers();
  const payload = JSON.parse(body.toString());

  const sigString = headersList.get("x-signature");
  if (!sigString) {
    console.error(`Signature header not found`);
    return NextResponse.json({ message: "Signature header not found" }, { status: 401 });
  }
  const secret = process.env.LEMONS_SQUEEZY_SIGNATURE_SECRET as string;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");
  const signature = Buffer.from(
    Array.isArray(sigString) ? sigString.join("") : sigString || "",
    "utf8"
  );
  // 校验签名
  if (!crypto.timingSafeEqual(digest, signature)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
  }

  const userId = payload.meta.custom_data && payload.meta.custom_data.userId || '';
  // 检查custom里的参数
	if (!userId) return NextResponse.json({ message: "No userId provided" }, { status: 403 });

	// 正式处理
  const first_order_item = payload.data.attributes.first_order_item || null
  // 加油包
  if (first_order_item && parseInt(first_order_item.variant_id) === parseInt(process.env.LEMON_SQUEEZY_MEMBERSHIP_SINGLE_TIME_VARIANT_ID as string)) {
    return await singlePay(first_order_item, payload, userId)
  }
  // 月度订阅
  if (!first_order_item && parseInt(payload.data.attributes.variant_id) === parseInt(process.env.LEMON_SQUEEZY_MEMBERSHIP_MONTHLY_VARIANT_ID as string)) {
    return await subscription(payload, userId)
  }
}

const getSinglePayOrderKey = ({ identifier }: { identifier: string }) => {
  return `single_${identifier}`
}

const singlePay = async (first_order_item, payload, userId) => {
  try {
		// 判断product是否正确
    if (
      parseInt(first_order_item.product_id) !==
      parseInt(process.env.LEMON_SQUEEZY_PRODUCT_ID as string)
    ) {
      return NextResponse.json({ message: "Invalid product" }, { status: 403 });
    }
		// 判断用户是否存在
	  const user = await prisma.user.findUnique({
	    where: { userId: userId.toString() },
	    select: { userId: true, email: true, username: true },
	  });
	  if (!user) return NextResponse.json({ message: "Your account was not found" }, { status: 401 });

    switch (payload.meta.event_name) {
      case "order_created": {
        const subscription = await client.retrieveOrder({ id: payload.data.id });
        // Lemon Squeezy 可能推送多次，这里需要判断order是否已存在，相同order仅处理首次收到的推送
				 // 检查redis里有没有存这个order_id，如果没有，则调用boostPack和redis保存，如果有，则不处理，直接返回200
        const key = await getSinglePayOrderKey({ identifier: payload.data.attributes.identifier })
        const orderRedisRes = await redis.get(key)
				 // 如果redis里没有这个key，则说明是首次推送
        if (!orderRedisRes) {
          await redis.setex(key, ONE_DAY, first_order_item.created_at) // key有效期1天
          await boostPack({ userId }) // 调用上一篇文章设计的 boostPack 方法
          return NextResponse.json({ status: 200 });
        }
        return NextResponse.json({ status: 200 }); // 返回200，Lemon Squeezy才会认为你已经把业务闭环
      }

      default: {
        return NextResponse.json({ massage: 'event_name not support' }, { status: 400 });
      }
    }
  } catch (e) {
    return NextResponse.json({ message: 'single pay something wrong' }, { status: 500 });
  }
}

const subscription = async (payload, userId) => {
  try {
    const attributes = payload.data.attributes
		// 判断product是否正确
    if (
      parseInt(attributes.product_id) !==
      parseInt(process.env.LEMON_SQUEEZY_PRODUCT_ID as string)
    ) {
      return NextResponse.json({ message: "Invalid product" }, { status: 403 });
    }

    switch (payload.meta.event_name) {
      case "subscription_created": {
        const subscription = await client.retrieveSubscription({ id: payload.data.id });
        // 订阅
        await prisma.user.update({
          where: { userId },
          data: {
            subscriptionId: `${subscription.data.id}`,
            customerId: `${payload.data.attributes.customer_id}`,
            variantId: subscription.data.attributes.variant_id,
            currentPeriodEnd: dayjs(subscription.data.attributes.renews_at).unix(),
          },
        });
        // 清空今天已用次数
        clearTodayUsage({ userId })
        return NextResponse.json({ status: 200 });
      }

      case "subscription_updated": {
        const subscription = await client.retrieveSubscription({ id: payload.data.id });
        // 更新 订阅
        const user = await prisma.user.findUnique({
          where: { userId, subscriptionId: `${subscription.data.id}` },
          select: { subscriptionId: true },
        });
				 if (!user || !user.subscriptionId) return NextResponse.json({ massage: 'userId or subscriptionId not found' }, { status: 400 });;

        await prisma.user.update({
          where: { userId, subscriptionId: user.subscriptionId },
          data: {
            variantId: subscription.data.attributes.variant_id,
            currentPeriodEnd: dayjs(subscription.data.attributes.renews_at).unix(),
          },
        });
        // 清空今天已用次数
        clearTodayUsage({ userId })
        return NextResponse.json({ status: 200 });
      }

      default: {
        return NextResponse.json({ massage: 'event_name not support' }, { status: 400 });
      }
    }
  } catch (e) {
    console.log('subscription deal', e);
    return NextResponse.json({ message: 'subscription something wrong' }, { status: 500 });
  }
}