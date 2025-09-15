"use client";
import { useEffect, useRef, useState } from "react";

type STTResult = { text: string; audioUrl: string; blob: Blob };
type Props = {
  onResult: (res: STTResult) => void;
  className?: string;
  disabled?: boolean;
};

export default function MicRecorder({
  onResult,
  className,
  disabled = false,
}: Props) {
  const [recording, setRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  const draw = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = "rgb(240, 240, 240)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = recording ? "rgb(59, 130, 246)" : "rgb(156, 163, 175)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();

    rafRef.current = requestAnimationFrame(draw);
  };

  const start = async () => {
    if (disabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(analyser);

      draw();

      const mime =
        typeof MediaRecorder.isTypeSupported === "function" &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : undefined;

      const recorder = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : {},
      );
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          const fd = new FormData();
          fd.append("audio", blob, "speech.webm");
          const res = await fetch("/api/stt", { method: "POST", body: fd });
          const json = await res.json();
          onResult({ text: json?.text || "", audioUrl: url, blob });
        } catch (e) {
          console.error("STT error:", e);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          audioCtxRef.current?.close().catch(() => {});
          audioCtxRef.current = null;
          analyserRef.current = null;
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !recording) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = disabled ? "rgb(250, 250, 250)" : "rgb(240, 240, 240)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = disabled ? "rgb(209, 213, 219)" : "rgb(156, 163, 175)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  }, [recording, disabled]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {!recording ? (
          <button
            className={`rounded border px-3 py-2 ${
              disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
            onClick={start}
            disabled={disabled}
          >
            🎙️ Start Recording
          </button>
        ) : (
          <button
            className="rounded border px-3 py-2 bg-red-600 text-white hover:bg-red-700"
            onClick={stop}
          >
            ⏹ Stop & Transcribe
          </button>
        )}
        <span className="text-sm text-gray-500">
          {disabled
            ? "Select a scenario first to start recording"
            : "녹음 중에 파형이 표시됩니다"}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={120}
        className={`mt-2 w-full rounded border ${disabled ? "opacity-50" : ""}`}
      />
    </div>
  );
}
