"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getErrorMessage } from "@/utils/errors";
import { Plan } from "@/types";

export default function PurchaseClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onBuy = async (plan: Plan) => {
    try {
      setErr(null);
      setLoadingId(plan.id);
      const res = await api.post("/api/payments/mock_charge", {
        plan_id: plan.id,
      });
      if (!res?.data?.success && !res?.data?.data) {
        throw new Error(res?.data?.error || "결제 실패");
      }
      router.replace("/dashboard?purchased=1");
      router.refresh();
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e);
      setErr(errorMessage || "결제 처리 실패");
    } finally {
      setLoadingId(null);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await api.get("/api/me/membership_plans");
      setPlans(res.data.data || []);
    } catch (e: unknown) {
      const error = getErrorMessage(e);
      setErr(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="grid gap-6 md:grid-cols-3">
      {loading ? (
        <div>Loading...</div>
      ) : (
        plans.map((p) => (
          <div
            key={p.id}
            className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-blue-600">{p.name}</h2>
            <div className="mt-1 text-slate-600">
              {p.price_cents.toLocaleString()}원 / {p.duration_days}일
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {p.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <div className="flex items-end h-full">
              <button
                onClick={() => onBuy(p)}
                disabled={loadingId === p.id}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loadingId === p.id ? "결제 중..." : "구매"}
              </button>
            </div>
          </div>
        ))
      )}

      {err && (
        <div className="md:col-span-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}
    </section>
  );
}
