import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const token = (await cookies()).get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.text();
  const r = await fetch(`${BASE}/admin/membership_plans/${params.id}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const token = (await cookies()).get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const r = await fetch(`${BASE}/admin/membership_plans/${params.id}`, {
    method: "DELETE",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
