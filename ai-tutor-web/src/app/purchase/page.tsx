import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PurchaseClient from "./_client";

export default async function PurchasePage() {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login?next=/purchase");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">멤버십 구매</h1>
      <PurchaseClient />
    </main>
  );
}
