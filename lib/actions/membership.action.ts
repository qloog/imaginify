import { 
  BOOST_PACK_EXPIRE, 
  BOOST_PACK_USES, 
  MEMBERSHIP_EXPIRE, 
  MEMBERSHIP_ROLE_VALUE, 
  ROLES, 
  ROLES_LIMIT, 
  getBoostPackKey, 
  getMembershipStatusKey, 
  getUserDateUsageKey
} from '@/constants/membership'
import { DateRemaining, Role, UserSub, IncrAfterChat } from '@/types/user'
import redis from '../redis'
import { getUserSubscriptionStatus } from '../lemonsqueezy/subscription'

/**
 * 设计：升级成会员
 * 如果已是会员（expire存在且大于当前时间），expire + 31天；
 * 如果不是会员，设置expire为 0 + 31天；
 * 每次购买都清空当日已用次数
 */
export const upgrade = async ({ sub }: UserSub) => {
  // 检查用户角色
  const userRoleKey = await getMembershipStatusKey({ sub })
  const userRole: Role = await redis.get(userRoleKey) || 1

  // 普通用户，直接设置role和过期时间
  if (userRole === 1) {
    const res = await redis.set(userRoleKey, MEMBERSHIP_ROLE_VALUE, { ex: MEMBERSHIP_EXPIRE })
    if (res === 'OK') {
      // 清空今天已用次数
      clearTodayUsage({ sub })
      return { sub, oldRole: ROLES[userRole], newRole: ROLES[MEMBERSHIP_ROLE_VALUE], expire: MEMBERSHIP_EXPIRE, upgrade: 'success' }
    }
    return { sub, oldRole: ROLES[userRole], upgrade: 'fail' }
  }

  // 会员用户，查询过期时间，计算新的过期时间，更新过期时间
  const TTL = await redis.ttl(userRoleKey)
  const newTTL = TTL + MEMBERSHIP_EXPIRE
  const res = await redis.expire(userRoleKey, newTTL)
  if (res === 1) {
    // redis操作成功，清空今天已用次数
    clearTodayUsage({ sub })
    return { sub, oldRole: ROLES[MEMBERSHIP_ROLE_VALUE], newRole: ROLES[MEMBERSHIP_ROLE_VALUE], expire: newTTL, upgrade: 'success' }
  }
  return { sub, oldRole: ROLES[MEMBERSHIP_ROLE_VALUE], newRole: ROLES[MEMBERSHIP_ROLE_VALUE], expire: TTL, upgrade: 'fail' }
}

// 升级后清空当日已用次数
export const clearTodayUsage = async ({ sub }: UserSub) => {
  const userDateUsageKey = await getUserDateUsageKey({ sub })
  await redis.set(userDateUsageKey, 0)
}

/**
 * 设计：购买加油包
 * 如果已有加油包（expire存在且大于当前时间），expire + 7天，oldBalance + BOOST_PACK_USES；
 * 如果没有加油包，设置expire为 0 + 7天，0 + BOOST_PACK_USES；
 */
export const boostPack = async ({ sub }: UserSub) => {
  const userBoostPackKey = await getBoostPackKey({ sub })
  const userBoostPack = await redis.get(userBoostPackKey) || 0

	// 加油包余额不存在，当作新购用户
  if (userBoostPack === 0) {
    const res = await redis.set(userBoostPackKey, BOOST_PACK_USES, { ex: BOOST_PACK_EXPIRE })
    if (res === 'OK') {
      return { sub, boostPackUses: BOOST_PACK_USES, expire: BOOST_PACK_EXPIRE, boostPack: 'success' }
    }
    return { sub, boostPackUses: 0, expire: 0, boostPack: 'fail' }
  }

  // 已是加油包用户，查询过期时间，计算新的过期时间，更新过期时间
  const oldBalance: number = await redis.get(userBoostPackKey) || 0
  const TTL = await redis.ttl(userBoostPackKey)
  const newTTL = TTL + BOOST_PACK_EXPIRE
  const newBalance = oldBalance + BOOST_PACK_USES
  const res = await redis.setex(userBoostPackKey, newTTL, newBalance)
  return res === 'OK' ?
    { sub, oldBalance, newBalance, expire: newTTL, boostPack: 'success' } :
    { sub, oldBalance, newBalance: oldBalance, expire: TTL, boostPack: 'fail' }
}

// 【获取】用户日使用次数
export const getUserDateUsage = async ({ sub }: UserSub) => {
  const keyDate = await getUserDateUsageKey({ sub });
  // 使用次数
  const userTodayUsage: number = (await redis.get(keyDate)) || 0;
  return {
    userTodayUsage
  }
}
// 计算当日可用次数：查询当日已用次数，计算剩余次数，再加上加油包剩余次数
export const getUserDateRemaining = async ({ sub }: UserSub) => {
  const { userTodayUsage } = await getUserDateUsage({ sub })
  const userRoleKey = await getMembershipStatusKey({ sub })
  const redisRole: Role = await redis.get(userRoleKey) || 1
  const userDateDefaultLimit: number = ROLES_LIMIT[redisRole]

  const userTodayRemaining = userDateDefaultLimit - userTodayUsage <= 0 ? 0 : userDateDefaultLimit - userTodayUsage
  const boostPackKey = await getBoostPackKey({ sub })
  const boostPackRemaining: number = await redis.get(boostPackKey) || 0
  // 查询次数是在请求openai前，自增次数是在请求后，这里把查询到的redis剩余次数返回，并传给自增方法，减少redis请求次数
  return {
    redisRole,
    userTodayRemaining,
    boostPackRemaining,
    userDateRemaining: userTodayRemaining + boostPackRemaining
  }
}
// 计算当日剩余次数、会员到期时间、加油包剩余次数、加油包到期时间
export const checkStatus = async ({ sub }: UserSub) => {
   // 获取用户订阅信息（角色、会员到期时间戳）
   const subscriptionRes = await getUserSubscriptionStatus({
    userId,
  })
  // 根据角色计算当日剩余次数
  const remainingInfo: DateRemaining = await getUserDateRemaining({ userId, role: subscriptionRes.role }) // 用户角色、当日剩余次数、加油包剩余次数
  
	// 如果是会员，计算会员到期时间
  let membershipExpire = 0
  if (userDateRemaining.redisRole === MEMBERSHIP_ROLE_VALUE) {
    const userRoleKey = await getMembershipStatusKey({ sub })
    membershipExpire = await redis.ttl(userRoleKey)
  }
  // 如果加油包次数大于0，计算加油包到期时间
  let boostPackExpire = 0
  if (userDateRemaining.boostPackRemaining > 0) {
    const boostPackKey = await getBoostPackKey({ sub })
    boostPackExpire = await redis.ttl(boostPackKey)
  }

  return {
    role: userDateRemaining.redisRole,
    todayRemaining: userDateRemaining.userTodayRemaining,
    membershipExpire: membershipExpire,
    boostPackRemaining: userDateRemaining.boostPackRemaining,
    boostPackExpire: boostPackExpire,
  }
}

export const incrAfterUse = async ({ sub, remainingInfo }: IncrAfterChat) => {
  // 如果【默认使用次数 - 日使用次数】> 0，则自增一个日使用次数；
  if (remainingInfo.userTodayRemaining > 0) {
    await incrUserDate({ sub })
    return
  }
  // 如果没有默认次数，有加油包，判断加油包次数
  if (remainingInfo.boostPackRemaining > 0) {
    const boostPackKey = await getBoostPackKey({ sub })
    await redis.decr(boostPackKey)
    return
  }
  // 如果没有默认次数，也没有加油包，则不处理，只需要记录日志
  console.log('0 uses remaining today.');
}

// 【自增】用户使用次数，这个方法用于内部调用
export const incrUserDate = async ({ sub }: UserSub) => {
  const keyDate = await getUserDateUsageKey({ sub });
  await redis.incr(keyDate);
}
