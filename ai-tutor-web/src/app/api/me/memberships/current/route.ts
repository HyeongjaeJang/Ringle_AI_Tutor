import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const r = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/me/memberships/current`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
