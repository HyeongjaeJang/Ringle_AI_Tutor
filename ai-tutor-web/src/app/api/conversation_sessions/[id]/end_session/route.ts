import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const token = (await cookies()).get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.text();
  const r = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/conversation_sessions/${params.id}/end_session`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
      cache: "no-store",
    },
  );

  const txt = await r.text();
  return new NextResponse(txt, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
