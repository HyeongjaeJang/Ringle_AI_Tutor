// app/admin/membership-plans/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PlansClient from "./_client";

export default async function Plans() {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login?next=/admin/membership-plans");
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Membership Plans</h1>
      <PlansClient />
    </main>
  );
}
