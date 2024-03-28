// app/api/payment/subscribe/route.ts

import { axios } from "@/lib/axios";
import prisma from "@/lib/prisma";
import type { CreateCheckoutResult } from "lemonsqueezy.ts/dist/types";
import { NextResponse } from "next/server";

const VARIANT_IDS_BY_TYPE = {
  'subscription': process.env.LEMON_SQUEEZY_MEMBERSHIP_MONTHLY_VARIANT_ID || '', // checkouts 请求传参要用string，但是webhook收到的variant_id是number
  'single': process.env.LEMON_SQUEEZY_MEMBERSHIP_SINGLE_TIME_VARIANT_ID || '',
}

/**
 * 使用异步方式处理POST请求，用于生成用户的购买链接。
 * 
 * @param request - 包含用户请求信息的对象，需要解析出userId和type。
 * @returns 返回一个响应对象，其中包含购买链接或者错误信息。
 */
export async function POST(request: Request) {
  try {
    // 解析请求体中的用户ID和升级类型
    const { userId, type } = await request.json() as { userId: string, type: UpgradeType };

    // 检查用户ID是否存在
    if (!userId) {
      return NextResponse.json({ message: "Your account was not found" }, { status: 401 });
    }

    // 根据升级类型获取对应的variantID
    const variantId = VARIANT_IDS_BY_TYPE[type]
    // 检查类型和variantID是否存在
    if (!type || !variantId) {
      return NextResponse.json({ message: "The variant was not found" }, { status: 401 });
    }

    // 通过Prisma客户端查询用户信息
    const user = await prisma.user.findUnique({
      where: { userId: userId.toString() },
      select: { userId: true, email: true, username: true },
    });
    // 检查用户是否存在
    if (!user) return NextResponse.json({ message: "Your account was not found" }, { status: 401 });
    
    // 调用外部API生成购买链接
    const checkout = (await axios.post(
      `${process.env.LEMON_SQUEEZY_HOST}/checkouts`,
      {
        data: {
          type: "checkouts",
          attributes: { checkout_data: { custom: { email: user.email, userId: user.userId, username: user.username, type } } },
          relationships: {
            store: { data: { type: "stores", id: process.env.LEMON_SQUEEZY_STORE_ID } },
            variant: { data: { type: "variants", id: variantId.toString() } },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      }
    )) as CreateCheckoutResult;

    // 返回购买链接
    return NextResponse.json({ checkoutURL: checkout.data.attributes.url }, { status: 200 });
  } catch (err: any) {
    // 处理请求过程中的异常，并返回错误信息
    return NextResponse.json({ message: err.message || err }, { status: 500 });
  }
}