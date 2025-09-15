"use client";
import Link from "next/link";
import { useAuth } from "@/store/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-[80vh] bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ringle AI Tutor (Demo)
        </h1>
        <p className="mt-3 text-slate-600">
          멤버십을 보유한 사용자는 AI와 대화/학습/분석 기능을 사용할 수 있어요.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 transition"
            >
              대시보드로 이동
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 transition"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border px-5 py-2.5 font-medium hover:bg-slate-50 transition"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Feature title="학습" desc="자료를 따라 단계별 학습" />
          <Feature title="대화" desc="AI와 실시간 영어 대화" />
          <Feature title="분석" desc="대화 기록 기반 레벨 분석" />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border p-5 bg-white shadow-sm">
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
