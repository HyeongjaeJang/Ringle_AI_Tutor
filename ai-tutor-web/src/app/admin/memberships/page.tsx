import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GrantMembershipClient from "./_client";

export default async function AdminMembershipsPage() {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login?next=/admin/memberships");

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">유저에게 멤버십 지급</h1>
      <GrantMembershipClient />
    </main>
  );
}
