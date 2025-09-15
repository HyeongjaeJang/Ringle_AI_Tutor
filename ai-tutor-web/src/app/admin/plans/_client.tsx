"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/utils/errors";
import { Plan } from "@/types";

export default function PlansClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    duration_days: 30,
    price_cents: 9900,
    features: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await api.get("/api/admin/membership_plans");
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

  const create = async () => {
    try {
      setErr(null);
      const features = form.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post("/api/admin/membership_plans", {
        name: form.name,
        duration_days: Number(form.duration_days),
        price_cents: Number(form.price_cents),
        features,
      });
      setForm({ name: "", duration_days: 30, price_cents: 9900, features: "" });
      await load();
    } catch (e: unknown) {
      const error = getErrorMessage(e);
      setErr(error);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("정말 삭제할까요?")) return;
    try {
      await api.delete(`/api/admin/membership_plans/${id}`);
      await load();
    } catch (e: unknown) {
      const error = getErrorMessage(e);
      setErr(error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Create new plan</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="rounded border p-2"
            placeholder="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="rounded border p-2"
            placeholder="duration_days"
            type="number"
            value={form.duration_days}
            onChange={(e) =>
              setForm({ ...form, duration_days: +e.target.value })
            }
          />
          <input
            className="rounded border p-2"
            placeholder="price_cents"
            type="number"
            value={form.price_cents}
            onChange={(e) => setForm({ ...form, price_cents: +e.target.value })}
          />
          <input
            className="rounded border p-2 md:col-span-4"
            placeholder="features (comma separated)"
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
          />
        </div>
        <button
          onClick={create}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Plans</h2>
        {loading ? (
          <div>Loading…</div>
        ) : err ? (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : plans.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {plans.map((p) => (
              <li key={p.id} className="rounded-lg border p-4">
                <div className="font-semibold">{p.name}</div>
                <div className="text-slate-600 text-sm">
                  {p.duration_days} days · {p.price_cents.toLocaleString()}원
                </div>
                <div className="text-slate-600 text-sm">
                  {p.features?.join(", ")}
                </div>
                <button
                  onClick={() => remove(p.id)}
                  className="mt-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-600">플랜이 없습니다.</div>
        )}
      </div>
    </section>
  );
}
