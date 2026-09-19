import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SixDigitOtpProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}

export function SixDigitOtp({ value, onChange, onComplete, disabled }: SixDigitOtpProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleChange = (index: number, val: string) => {
    // Take last char typed
    const char = val.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    const newCode = nextDigits.join("");
    onChange(newCode);

    // Auto-advance
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newCode.length === 6 && !newCode.includes("")) {
      onComplete?.(newCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!pasted) return;

    const cleaned = pasted.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);
    onChange(cleaned);

    // Focus last filled box or next box
    const focusIndex = Math.min(cleaned.length, 5);
    inputsRef.current[focusIndex]?.focus();

    if (cleaned.length === 6) {
      onComplete?.(cleaned);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}

          type="text"
          inputMode="text"
          maxLength={1}
          value={digits[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "size-11 sm:size-12 rounded-xl border border-input bg-background text-center font-mono text-lg font-bold text-foreground transition-all outline-none",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
}
