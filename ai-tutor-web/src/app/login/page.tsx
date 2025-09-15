"use client";
import { useAuth } from "@/store/auth";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Form = { email: string; password: string };

const isErrorWithMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
};

const getErrorMessage = (error: unknown): string => {
  if (isErrorWithMessage(error)) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "알 수 없는 오류가 발생했습니다.";
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    defaultValues: { email: "", password: "" },
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const setUser = useAuth((s) => s.setUser);
  const user = useAuth((s) => s.user);
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    if (user) {
      const next = search.get("next") || "/dashboard";
      router.replace(next);
    }
  }, [user, router, search]);

  const onSubmit = async (data: Form) => {
    try {
      setLoading(true);
      setServerErr(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        let errMsg = "로그인 실패";
        try {
          const e = await res.json();
          errMsg = e?.error || e?.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const { user: u } = await res.json();
      setUser(u);

      const next = search.get("next") || "/dashboard";
      router.replace(next);
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setServerErr(errorMessage || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] grid place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="mt-1 text-sm text-slate-600">
            멤버십/쿠폰 조회, 대화 기능을 사용하려면 로그인이 필요합니다.
          </p>
        </header>

        {serverErr && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {serverErr}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              aria-invalid={!!errors.email || undefined}
              {...register("email", {
                required: "이메일을 입력하세요.",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "이메일 형식이 아닙니다.",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              비밀번호
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={!!errors.password || undefined}
                {...register("password", {
                  required: "비밀번호를 입력하세요.",
                  minLength: { value: 6, message: "6자 이상 입력하세요." },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="shrink-0 rounded-lg border px-3 text-sm hover:bg-slate-50"
                aria-pressed={showPw}
                aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPw ? "숨김" : "보기"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            aria-busy={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-700 hover:underline"
          >
            회원가입
          </Link>
        </div>
      </div>
    </main>
  );
}
