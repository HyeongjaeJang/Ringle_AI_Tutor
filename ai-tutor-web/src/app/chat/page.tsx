"use client";
import api from "@/lib/api";
import MicRecorder from "@/components/MicRecorder";
import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/utils/errors";
import { coach, getScenarioIntro } from "./actions";

type Turn = { role: "ai" | "user"; text: string; audioUrl?: string };

const PRESETS = [
  {
    id: "business_new_contact",
    label: "Business: first meeting at a conference",
  },
  { id: "coffee_smalltalk", label: "Casual: coffee chat with a classmate" },
  { id: "customer_support", label: "Work: helping a customer politely" },
];

export default function ChatPage() {
  return <ChatScreen />;
}

function ChatScreen() {
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  const [preset, setPreset] = useState<string>("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const startingRef = useRef(false);
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});

  const startSession = async () => {
    if (!preset || isStarting || startingRef.current) return;
    setError(null);
    setIsStarting(true);
    startingRef.current = true;

    try {
      const create = await api.post("/api/conversation_sessions", {
        scenario: preset,
      });
      const data = create.data?.data || create.data;
      if (!data?.allowed) throw new Error(create.data?.error || "not allowed");

      setSessionId(data.id);

      const intro = await getScenarioIntro(preset);
      setTurns([
        { role: "ai", text: intro.text || "Let's start our role-play!" },
      ]);
      setSessionStarted(true);
    } catch (e) {
      setError(getErrorMessage(e) || "세션 시작 실패");
    } finally {
      setIsStarting(false);
      startingRef.current = false;
    }
  };

  const endSession = async (summary?: string) => {
    if (!sessionId) return;
    try {
      await api.post(`/api/conversation_sessions/${sessionId}/end_session`, {
        summary,
      });
    } catch {}
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!sessionStarted || !sessionId) return;
      try {
        const body = JSON.stringify({ summary: "unload" });
        const url = `/api/conversation_sessions/${sessionId}/end_session`;
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon?.(url, blob);
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
          credentials: "include",
        });
      } catch {}
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionStarted, sessionId]);

  const resetSession = async () => {
    await endSession();
    turns.forEach((t) => t.audioUrl && URL.revokeObjectURL(t.audioUrl));
    setTurns([]);
    setSessionStarted(false);
    setSessionId(null);
    setInput("");
    setError(null);
    setIsProcessingVoice(false);
  };

  const synthesize = async (text: string): Promise<string | null> => {
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "alloy" }),
      });
      if (!r.ok) return null;
      const blob = await r.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  };

  const sendToAI = async (
    userText: string,
    opts?: { userAudioUrl?: string; isVoice?: boolean },
  ) => {
    if (!sessionStarted) return;
    if (opts?.isVoice) setIsProcessingVoice(true);

    const baseHistory: Turn[] = [...turns, { role: "user", text: userText }];

    setTurns((t) => [
      ...t,
      { role: "user", text: userText, audioUrl: opts?.userAudioUrl },
      { role: "ai", text: "" },
    ]);

    try {
      const { text } = await coach(baseHistory);

      const aiAudioUrl = await synthesize(text || "");

      setTurns((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "ai") {
          copy[copy.length - 1] = {
            ...last,
            text: text || "",
            audioUrl: aiAudioUrl || undefined,
          };
        }
        return copy;
      });
    } catch (e) {
      setError(getErrorMessage(e) || "AI 요청 실패");
    } finally {
      if (opts?.isVoice) setIsProcessingVoice(false);
    }
  };

  const onAnswerDone = async () => {
    if (!sessionStarted || isProcessingVoice) return;
    const userText = input.trim();
    if (!userText) return;
    setInput("");
    await sendToAI(userText);
  };

  const handleMicResult = async ({
    text,
    audioUrl,
  }: {
    text: string;
    audioUrl: string;
  }) => {
    if (!sessionStarted || isProcessingVoice) return;
    if (!text) return;
    await sendToAI(text, { isVoice: true, userAudioUrl: audioUrl });
  };

  const togglePlay = (idx: number) => {
    const target = audioRefs.current[idx];
    if (!target) return;
    Object.values(audioRefs.current).forEach((a) => {
      if (a && a !== target) a.pause();
    });
    if (target.paused) target.play();
    else target.pause();
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">AI Tutor</h1>
        {sessionStarted && (
          <button
            className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
            onClick={resetSession}
          >
            New Session
          </button>
        )}
      </div>

      {!sessionStarted ? (
        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-8 text-center">
            <h2 className="mb-4 text-lg font-semibold">
              Choose a scenario to start practicing
            </h2>
            <div className="space-y-3">
              <select
                className="w-full max-w-md rounded border px-3 py-2"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                <option value="">-- Select a scenario --</option>
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div>
                <button
                  className={`rounded px-6 py-2 font-medium text-white ${
                    preset && !isStarting
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "cursor-not-allowed bg-gray-400"
                  }`}
                  onClick={startSession}
                  disabled={!preset || isStarting}
                >
                  {isStarting ? "Starting..." : "Start Practice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between rounded border bg-blue-50 p-3">
            <span className="text-sm font-medium">
              Current scenario: {PRESETS.find((p) => p.id === preset)?.label}
            </span>
            {isProcessingVoice && (
              <span className="text-xs text-blue-600">Processing voice...</span>
            )}
          </div>

          <div className="h-[300px] space-y-2 overflow-auto rounded border p-4">
            {turns.map((t, i) => {
              if (
                t.role === "ai" &&
                t.text.includes("(") &&
                t.text.includes(")")
              ) {
                const m = t.text.match(/\((.*?)\)/);
                if (m) {
                  const correction = m[0];
                  const conversation = t.text.replace(m[0], "").trim();
                  return (
                    <div key={i} className="text-blue-700">
                      <b>{t.role.toUpperCase()}:</b>
                      <div className="mt-1 border-l-4 border-yellow-400 bg-yellow-50 p-2 text-sm">
                        {correction}
                      </div>
                      {conversation && (
                        <>
                          <div className="mt-2 text-xs text-gray-500">
                            다음 대화입니다:
                          </div>
                          <div className="mt-1">{conversation}</div>
                        </>
                      )}
                      {t.audioUrl && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <button
                            className="rounded border px-2 py-1 hover:bg-gray-50"
                            onClick={() => togglePlay(i)}
                          >
                            ▶︎ / ⏸
                          </button>
                          <audio
                            ref={(el) => {
                              audioRefs.current[i] = el;
                            }}
                            src={t.audioUrl}
                            preload="auto"
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              }

              return (
                <div
                  key={i}
                  className={
                    t.role === "ai" ? "text-blue-700" : "text-gray-900"
                  }
                >
                  <b>{t.role.toUpperCase()}:</b> {t.text}
                  {t.audioUrl && (
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <button
                        className="rounded border px-2 py-1 hover:bg-gray-50"
                        onClick={() => togglePlay(i)}
                      >
                        ▶︎ / ⏸
                      </button>
                      <audio
                        ref={(el) => {
                          audioRefs.current[i] = el;
                        }}
                        src={t.audioUrl}
                        preload="auto"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <MicRecorder
            onResult={handleMicResult}
            disabled={!sessionStarted || isProcessingVoice}
          />

          <div className="flex gap-2">
            <input
              className="flex-1 rounded border p-2"
              placeholder={
                isProcessingVoice
                  ? "음성 처리 중..."
                  : "메시지 입력 혹은 마이크로 말하기"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAnswerDone()}
              disabled={isProcessingVoice}
            />
            <button
              className={`rounded px-4 text-white ${
                isProcessingVoice
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-black hover:bg-gray-800"
              }`}
              onClick={onAnswerDone}
              disabled={isProcessingVoice}
            >
              Send
            </button>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </>
      )}
    </main>
  );
}
