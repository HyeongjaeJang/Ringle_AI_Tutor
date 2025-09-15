import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const r = await fetch(`${BASE}/membership_plans`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
