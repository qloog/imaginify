
export interface UserSub {
  sub: string;
}

// User role
export type Role = 1 | 2; // 1 普通用户; 2 会员

export interface DateRemaining {
  redisRole: number; // 用户角色
  userTodayRemaining: number; // 今天剩余次数
  boostPackRemaining: number; // 加油包剩余次数
  userDateRemaining: number;  // 上面二者总的剩余次数
}

export interface IncrAfterChat {
  sub: string;
  remainingInfo: DateRemaining;
}