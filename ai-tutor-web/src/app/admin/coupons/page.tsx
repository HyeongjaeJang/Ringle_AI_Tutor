import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CouponsClient from "./_client";

export default async function CouponsPage() {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login?next=/admin/coupons");
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Coupons</h1>
      <CouponsClient />
    </main>
  );
}
