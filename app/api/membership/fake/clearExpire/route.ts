import { getBoostPackKey, getMembershipStatusKey } from "@/constants/membership";
import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

/**
 * 仅测试接口使用，实际业务中都在服务端组件里直接调用redis
 */
export async function POST(req: NextRequest) {
  try {
    // 判断referer
    const headers = req.headers
    const referer: string | null = headers.get('referer')
    if (!referer || !referer.includes(process.env.NEXTAUTH_URL as string)) {
      const errorText = 'Sorry, the demo is available at https://nextjs.weijunext.com/fake-membership'
      return NextResponse.json({ error: errorText }, { status: 401 });
    }
    // 判断token是否存在
    const token = headers.get('token')
    if (!token) {
      const errorText = 'Token is expired. Please login again.'
      return NextResponse.json({ error: errorText }, { status: 401 });
    }

    const { sub, type } = await req.json();
    // 模拟会员过期
    if (type === 'membership') {
      const key = await getMembershipStatusKey({ sub })
      const res = await redis.del(key)
      return NextResponse.json({ success: res === 1 })
    }
    // 模拟加油包过期
    const key = await getBoostPackKey({ sub })
    const res = await redis.del(key)
    return NextResponse.json({ success: res === 1 })
  } catch (e) {
    return NextResponse.json({ error: "failed to clear expire" }, { status: 500 });
  }
}