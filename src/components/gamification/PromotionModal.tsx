"use client";

import { useEffect, useState } from "react";
import { getTierColor, type TierConfig } from "@/utils/tierSystem";
import { FaKeyboard } from "react-icons/fa6";
import { IoBulb, IoGift, IoAddCircle } from "react-icons/io5";
import { HiCheckBadge } from "react-icons/hi2";
import { X } from "lucide-react";

interface PromotionModalProps {
  isOpen: boolean;
  fromTier: TierConfig;
  toTier: TierConfig;
  onClose: () => void;
  onComplete?: () => void;
  onContinue?: () => void; // 계속하기 (새 테스트 시작)
  onViewStats?: () => void; // 자세히보기 (통계 페이지로)
}

export function PromotionModal({
  isOpen,
  fromTier,
  toTier,
  onClose,
  onComplete,
  onContinue,
  onViewStats,
}: PromotionModalProps) {
  const [animationStep, setAnimationStep] = useState<
    "entering" | "celebrating" | "revealing" | "complete"
  >("entering");

  useEffect(() => {
    if (isOpen) {
      const sequence = async () => {
        // 1. 입장 애니메이션
        setAnimationStep("entering");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 2. 축하 애니메이션
        setAnimationStep("celebrating");
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 3. 새 티어 공개
        setAnimationStep("revealing");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 4. 완료
        setAnimationStep("complete");

        // 5초 후 자동 닫기 (선택사항)
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 5000);
      };

      sequence();
    }
  }, [isOpen, onComplete]);

  // 키보드 단축키 핸들러
  useEffect(() => {
    if (!isOpen || animationStep !== "complete") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case "Enter":
          event.preventDefault();
          if (event.shiftKey) {
            // Shift + Enter: 계속 연습
            if (onContinue) {
              onContinue();
            } else {
              onClose();
            }
          } else {
            // Enter: 자세히보기
            if (onViewStats) {
              onViewStats();
            } else {
              onClose();
            }
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, animationStep, onClose, onContinue, onViewStats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-background bg-opacity-90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 메인 모달 - 테마 시스템 적용 */}
      <div
        className={`relative rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-500 ${
          animationStep === "entering"
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100"
        }`}
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* 닫기 버튼 - 디자인 시스템 일관성 */}
        <button
          onClick={() => {
            if (onViewStats) {
              onViewStats();
            } else {
              onClose();
            }
          }}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border-primary)",
            color: "var(--color-text-secondary)",
          }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* 플로팅 배경 효과 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {/* 그라데이션 배경 */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${toTier.color}60, transparent 60%), 
                         radial-gradient(circle at 70% 80%, ${fromTier.color}40, transparent 60%),
                         radial-gradient(circle at 50% 50%, ${toTier.gradient[0]}30, transparent 70%)`,
            }}
          />

          {/* 플로팅 명암 효과 */}
          <div
            className="absolute inset-0 opacity-3"
            style={{
              background: `linear-gradient(135deg, 
                         rgba(255,255,255,0.05) 0%, 
                         transparent 25%, 
                         rgba(0,0,0,0.03) 50%, 
                         transparent 75%, 
                         rgba(255,255,255,0.02) 100%)`,
            }}
          />
        </div>

        <div className="text-center">
          {/* 1단계: 기존 티어 */}
          {animationStep === "entering" && (
            <div
              className={`transform transition-all duration-500 ${
                animationStep !== "entering"
                  ? "scale-0 opacity-0"
                  : "scale-100 opacity-100"
              }`}
            >
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-4xl font-bold border-4 mb-4 shadow-lg"
                style={{
                  background: getTierColor(fromTier, "gradient"),
                  borderColor: fromTier.color,
                  color: fromTier.color,
                }}
              >
                {fromTier.icon}
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: fromTier.color }}
              >
                {fromTier.name}
              </h3>
            </div>
          )}

          {/* 2단계: 축하 메시지 */}
          {animationStep === "celebrating" && (
            <div className="animate-pulse">
              <HiCheckBadge
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: "var(--color-interactive-primary)" }}
              />
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--color-interactive-primary)" }}
              >
                축하합니다!
              </h2>
              <p style={{ color: "var(--color-text-secondary)" }}>
                티어 승급 조건을 만족했습니다!
              </p>
            </div>
          )}

          {/* 3단계: 새 티어 공개 */}
          {(animationStep === "revealing" || animationStep === "complete") && (
            <div
              className={`transform transition-all duration-700 ${
                animationStep === "revealing" ? "animate-bounce" : ""
              }`}
            >
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-5xl font-bold border-4 mb-6 shadow-xl animate-tier-glow"
                style={{
                  background: getTierColor(toTier, "gradient"),
                  borderColor: toTier.color,
                  boxShadow: `0 0 25px ${toTier.color}60, 0 0 50px ${toTier.color}30`,
                  color: toTier.color,
                }}
              >
                {toTier.icon}
              </div>

              <div className="mb-6">
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: toTier.color }}
                >
                  {toTier.name} 승급!
                </h2>
                <p
                  className="text-lg mb-2 font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {toTier.rewards.title}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {toTier.description}
                </p>
              </div>

              {/* 보상 정보 */}
              {animationStep === "complete" && (
                <div
                  className="rounded-lg p-4 mb-6 border"
                  style={{
                    backgroundColor: "var(--color-elevated)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <IoGift
                      className="w-5 h-5"
                      style={{ color: "var(--color-interactive-muted)" }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      승급 보상
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IoAddCircle
                          className="w-4 h-4"
                          style={{
                            color: "var(--color-interactive-primary)",
                          }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          새로운 타이틀
                        </span>
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {toTier.rewards.title}
                      </span>
                    </div>

                    {toTier.rewards.badge && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HiCheckBadge
                            className="w-4 h-4"
                            style={{
                              color: "var(--color-interactive-primary)",
                            }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            배지
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            새 배지 획득
                          </span>
                        </div>
                      </div>
                    )}

                    {toTier.rewards.theme && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IoAddCircle
                            className="w-4 h-4"
                            style={{
                              color: "var(--color-interactive-primary)",
                            }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            전용 테마
                          </span>
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          잠금 해제
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 액션 버튼 - 프로젝트 디자인 시스템 적용 */}
              {animationStep === "complete" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (onContinue) {
                        onContinue();
                      } else {
                        onClose();
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--color-interactive-primary)",
                      border: "2px solid var(--color-interactive-primary)",
                    }}
                  >
                    <FaKeyboard className="w-4 h-4" />
                    계속 연습
                  </button>
                  <button
                    onClick={() => {
                      if (onViewStats) {
                        onViewStats();
                      } else {
                        onClose();
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: "var(--color-interactive-primary)",
                      color: "white",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <IoBulb className="w-4 h-4" />
                    자세히 보기
                  </button>
                </div>
              )}

              {/* 키보드 단축키 안내 - 컴팩트 버전 */}
              {animationStep === "complete" && (
                <div
                  className="border-t text-center"
                  style={{
                    marginTop: "var(--spacing-3)",
                    paddingTop: "var(--spacing-3)",
                    borderColor: "var(--color-border-light)",
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ gap: "var(--spacing-2)" }}
                  >
                    <div
                      className="flex items-center"
                      style={{ gap: "var(--spacing-1)" }}
                    >
                      <div
                        className="rounded border"
                        style={{
                          padding: "var(--spacing-1) var(--spacing-2)",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "600",
                          backgroundColor: "var(--color-shortcut-key-bg)",
                          color: "var(--color-shortcut-key-text)",
                          borderColor: "var(--color-shortcut-key-border)",
                        }}
                      >
                        Shift+Enter
                      </div>
                      <span
                        style={{
                          color: "var(--color-shortcut-label-text)",
                          fontSize: "var(--font-size-xs)",
                        }}
                      >
                        계속 연습
                      </span>
                    </div>

                    <div
                      style={{
                        color: "var(--color-shortcut-separator)",
                        fontSize: "var(--font-size-xs)",
                      }}
                    >
                      •
                    </div>

                    <div
                      className="flex items-center"
                      style={{ gap: "var(--spacing-1)" }}
                    >
                      <div
                        className="rounded border"
                        style={{
                          padding: "var(--spacing-1) var(--spacing-2)",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "600",
                          backgroundColor: "var(--color-shortcut-key-bg)",
                          color: "var(--color-shortcut-key-text)",
                          borderColor: "var(--color-shortcut-key-border)",
                        }}
                      >
                        Enter
                      </div>
                      <span
                        style={{
                          color: "var(--color-shortcut-label-text)",
                          fontSize: "var(--font-size-xs)",
                        }}
                      >
                        자세히 보기
                      </span>
                    </div>

                    <div
                      style={{
                        color: "var(--color-shortcut-separator)",
                        fontSize: "var(--font-size-xs)",
                      }}
                    >
                      •
                    </div>

                    <div
                      className="flex items-center"
                      style={{ gap: "var(--spacing-1)" }}
                    >
                      <div
                        className="rounded border"
                        style={{
                          padding: "var(--spacing-1) var(--spacing-2)",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "600",
                          backgroundColor: "var(--color-shortcut-key-bg)",
                          color: "var(--color-shortcut-key-text)",
                          borderColor: "var(--color-shortcut-key-border)",
                        }}
                      >
                        Esc
                      </div>
                      <span
                        style={{
                          color: "var(--color-shortcut-label-text)",
                          fontSize: "var(--font-size-xs)",
                        }}
                      >
                        창 닫기
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes tier-glow {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 25px currentColor60, 0 0 50px currentColor30;
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 35px currentColor80, 0 0 70px currentColor40;
          }
        }

        .animate-tier-glow {
          animation: tier-glow 3s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}
