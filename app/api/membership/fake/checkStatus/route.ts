// @/app/api/membership/fake/checkStatus/route.ts
import { checkStatus } from "@/lib/actions/membership.action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sub } = await req.json();
    const res = await checkStatus({ sub })
    return NextResponse.json(res)
  } catch (e) {
    return NextResponse.json({ error: "failed to upgrade" }, { status: 500 });
  }
}