"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function OTPInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  autoFocus = true,
  className = "",
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    const newOtp = [...otp];

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Call onChange callback
    const otpString = newOtp.join("");
    onChange?.(otpString);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all digits are filled
    if (otpString.length === length) {
      onComplete?.(otpString);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();

      const newOtp = [...otp];

      if (newOtp[index]) {
        // Clear current input
        newOtp[index] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
      } else if (index > 0) {
        // Move to previous input and clear it
        setActiveIndex(index - 1);
        newOtp[index - 1] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handleBlur = (index: number) => {
    if (activeIndex === index) setActiveIndex(-1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "");

    if (pastedData.length === length) {
      const newOtp = pastedData.split("").slice(0, length);
      setOtp(newOtp);
      onChange?.(newOtp.join(""));
      onComplete?.(newOtp.join(""));
      setActiveIndex(length - 1);
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <motion.div
      className={`flex flex-wrap justify-center gap-4 mx-auto ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      role="group"
      aria-label="OTP input"
    >
      {otp.map((digit, index) => {
        const allFilled = otp.every(Boolean);
        const isLast = index === length - 1;
        const isActive = activeIndex === index && activeIndex !== -1;
        return (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onBlur={() => handleBlur(index)}
            onPaste={handlePaste}
            disabled={disabled}
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{
              scale: isActive ? 1.13 : 1,
              opacity: 1,
              y: 0,
              boxShadow:
                allFilled && isLast
                  ? "0 0 0 4px #4ade80aa, 0 2px 16px 0 #22c55e33"
                  : isActive
                  ? "0 0 0 4px #38bdf8aa, 0 2px 16px 0 #14b8a633"
                  : digit
                  ? "0 0 0 2px #4ade80aa"
                  : "0 1px 6px 0 #0001",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className={`
              w-12 h-12 text-center text-2xl font-bold border-2 rounded-2xl
              sm:w-16 sm:h-16 sm:text-lg
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              transition-all duration-200 shadow-lg
              backdrop-blur-md
              ${
                disabled
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : allFilled && isLast
                  ? "border-green-400 bg-gradient-to-br from-green-50 to-green-100 text-green-700"
                  : digit
                  ? "border-green-400 bg-gradient-to-br from-green-50 to-green-100 text-green-700"
                  : isActive
                  ? "border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700"
                  : "border-gray-300 bg-white/80 hover:border-teal-400"
              }
              ${isActive ? "glass" : ""}
            `}
            style={{ touchAction: "manipulation", minWidth: "2.5rem" }}
            aria-label={`Digit ${index + 1}`}
            autoComplete="one-time-code"
          />
        );
      })}
    </motion.div>
  );
}
