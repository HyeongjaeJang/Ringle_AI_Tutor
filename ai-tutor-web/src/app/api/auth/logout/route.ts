import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const c = await cookies();

  c.set({ name: "token", value: "", path: "/", maxAge: 0 });
  c.set({
    name: "token",
    value: "",
    path: "/",
    maxAge: 0,
    domain: "localhost",
  });

  return NextResponse.json({ ok: true });
}
