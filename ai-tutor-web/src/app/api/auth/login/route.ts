import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const data = await r.json();
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  const { token, user } = data.data;

  const c = await cookies();
  c.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
  });

  return NextResponse.json({ user }, { status: 200 });
}
