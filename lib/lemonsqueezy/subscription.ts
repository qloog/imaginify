/**
 * lib/lemonsqueezy/subscription.ts
 * 从数据库里读取用户角色和会员过期时间
 */
import prisma from "@/lib/prisma";
import { SubScriptionInfo } from "@/types/subscribe";
import { PrismaUser } from "@/types/user";

export async function getUserSubscriptionStatus({ userId, defaultUser }: { userId: string; defaultUser?: PrismaUser }) {
  let user = null
  if (defaultUser) {
    user = defaultUser
  } else {
    user = await prisma.user.findUnique({
      where: { userId },
      select: {
        subscriptionId: true,
        currentPeriodEnd: true,
        customerId: true,
        variantId: true,
      },
    });
  }

  if (!user) throw new Error("User not found");

  const membershipExpire = (user.currentPeriodEnd || 1) * 1000 // 13位时间戳或非会员
  const isMembership =
    user.variantId &&
    membershipExpire > Date.now().valueOf();

  return {
    subscriptionId: user.subscriptionId,
    membershipExpire: isMembership ? membershipExpire : 1,
    customerId: user.customerId,
    variantId: user.variantId,
    role: isMembership ? 2 : 1, // 会员 : 普通用户
  } as SubScriptionInfo;
}