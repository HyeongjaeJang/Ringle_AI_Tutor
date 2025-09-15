import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_client";

export default async function DashboardPage() {
  const token = (await cookies()).get("token")?.value;
  if (!token) redirect("/login?next=/dashboard");

  return (
    <div className="m-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <DashboardClient />
    </div>
  );
}
