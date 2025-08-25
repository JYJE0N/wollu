"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/ui/Layout";
import { TypingEngine } from "@/components/core/TypingEngine";
import { ClientOnly } from "@/components/ClientOnly";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useSettingsStore, initializeTheme } from "@/stores/settingsStore";
import { useTypingStore } from "@/stores/typingStore";
import { getLanguagePack } from "@/modules/languages";
import { TextGenerator } from "@/utils/textGenerator";

// URL 파라미터 처리를 위한 별도 컴포넌트
function UrlParamHandler() {
  const searchParams = useSearchParams();
  const {
    setLanguage,
    setTextType,
    setTestMode,
    setTestTarget,
    setSentenceLength,
    setSentenceStyle,
  } = useSettingsStore();

  useEffect(() => {
    // AI 추천에서 온 설정 파라미터들 처리
    const language = searchParams.get("language");
    const textType = searchParams.get("textType");
    const testMode = searchParams.get("testMode");
    const testTarget = searchParams.get("testTarget");
    const sentenceLength = searchParams.get("sentenceLength");
    const sentenceStyle = searchParams.get("sentenceStyle");
    const focusCharacters = searchParams.get("focusCharacters");

    let hasAiRecommendation = false;

    // AI 추천 설정 적용
    if (language && (language === "korean" || language === "english")) {
      setLanguage(language);
      hasAiRecommendation = true;
    }
    if (textType && (textType === "words" || textType === "sentences")) {
      setTextType(textType as "words" | "sentences");
      hasAiRecommendation = true;
    }
    if (testMode && (testMode === "words" || testMode === "sentences")) {
      setTestMode(testMode as "words" | "sentences");
      hasAiRecommendation = true;
    }
    if (testTarget && !isNaN(parseInt(testTarget))) {
      setTestTarget(parseInt(testTarget));
      hasAiRecommendation = true;
    }
    if (
      sentenceLength &&
      ["short", "medium", "long"].includes(sentenceLength)
    ) {
      setSentenceLength(sentenceLength as "short" | "medium" | "long");
      hasAiRecommendation = true;
    }
    if (
      sentenceStyle &&
      ["plain", "punctuation", "numbers", "mixed"].includes(sentenceStyle)
    ) {
      setSentenceStyle(
        sentenceStyle as "plain" | "punctuation" | "numbers" | "mixed"
      );
      hasAiRecommendation = true;
    }

    // TODO: focusCharacters 처리 (특정 문자 집중 연습)
    if (focusCharacters) {
      console.log("🎯 집중 연습 문자:", focusCharacters.split(","));
    }

    // AI 추천 설정이 적용된 경우 새 테스트 시작
    if (hasAiRecommendation) {
      console.log("🤖 AI 추천 설정 적용됨, 새 테스트 시작");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("typing:restart-test"));
      }, 200);

      // URL에서 파라미터 제거
      window.history.replaceState({}, "", "/");
    }

    // 기존 restart 파라미터 처리
    const restart = searchParams.get("restart");
    if (restart === "true") {
      console.log("🔄 URL 파라미터로 새 테스트 시작 요청됨");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("typing:restart-test"));
      }, 100);

      window.history.replaceState({}, "", "/");
    }
  }, [
    searchParams,
    setLanguage,
    setTextType,
    setTestMode,
    setTestTarget,
    setSentenceLength,
    setSentenceStyle,
  ]);

  return null;
}

export default function Home() {
  const { language, testTarget, testMode, sentenceLength, sentenceStyle } =
    useSettingsStore();
  const { setTargetText, resetTest } = useTypingStore();

  // 🔧 모바일 친화적 테마 및 개발자 도구 초기화
  useEffect(() => {
    // DOM 로드 완료 확인 후 테마 적용
    const initTheme = () => {
      try {
        initializeTheme();

        // 모바일에서 CSS 변수 강제 적용
        if (
          typeof window !== "undefined" &&
          /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        ) {
          // CSS 변수가 제대로 로드되었는지 확인 후 재적용
          setTimeout(() => {
            const root = document.documentElement;
            const testColor =
              getComputedStyle(root).getPropertyValue("--text-primary");
            if (!testColor || testColor.trim() === "") {
              // CSS 변수가 없으면 강제로 설정
              root.style.setProperty("--text-primary", "#c8b5db");
              root.style.setProperty("--typing-current", "#c8b5db");
              root.style.setProperty("--color-typing-cursor", "#c8b5db");
              console.log("🔧 모바일 CSS 변수 강제 적용");
            }
          }, 100);
        }
      } catch (error) {
        console.warn("테마 초기화 실패, 기본값 사용:", error);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initTheme);
    } else {
      initTheme();
    }

    // 개발자 도구는 개발 환경에서만 로딩
    if (process.env.NODE_ENV === "development") {
      import("@/utils/devTools").then((module) => {
        module.initDevTools();
      });
    }

    return () => {
      document.removeEventListener("DOMContentLoaded", initTheme);
    };
  }, []);

  // 모바일 스크롤 제어를 위한 body 클래스 추가/제거
  useEffect(() => {
    document.body.classList.add("typing-page");
    return () => {
      document.body.classList.remove("typing-page");
    };
  }, []);

  // 초기 텍스트만 생성 (설정 변경 시 자동 재시작 방지)
  useEffect(() => {
    const languagePack = getLanguagePack(language);
    if (!languagePack) return;

    const textGenerator = new TextGenerator(languagePack);

    // 새로운 텍스트 생성 로직 사용
    const newText = textGenerator.generateNewText({
      mode: testMode,
      count: testTarget,
      sentenceLength,
      sentenceStyle,
    });

    setTargetText(newText);
    // resetTest() 제거 - 모바일 자동 시작 방지
  }, [
    language,
    testTarget,
    testMode,
    sentenceLength,
    sentenceStyle,
    setTargetText,
  ]);

  // 수동 재시작 이벤트 처리만
  useEffect(() => {
    const handleRestart = () => {
      console.log("🔄 수동 재시작 이벤트 처리");
      resetTest();
    };

    window.addEventListener("typing:restart-test", handleRestart);

    return () => {
      window.removeEventListener("typing:restart-test", handleRestart);
    };
  }, [resetTest]);

  return (
    <>
      <ThemeInitializer />
      <Suspense fallback={null}>
        <UrlParamHandler />
      </Suspense>
      <Layout>
        {/* 메인 컨테이너 */}
        <div className="md:p-8">
          <div className="w-full max-w-6xl mx-auto">
            {/* 언어 선택 토글 - 독립된 영역 */}
            <div className="flex justify-center mb-3 md:mb-8 mobile-language-toggle">
              <LanguageToggle />
            </div>

            {/* 섹션 1: 메인 타이핑 영역 */}
            <section className="w-full">
              <ClientOnly
                fallback={
                  <div className="animate-pulse">
                    <div
                      className="h-20 rounded-lg mb-6"
                      style={{ backgroundColor: "var(--color-surface)" }}
                    ></div>
                    <div
                      className="h-40 rounded-lg"
                      style={{ backgroundColor: "var(--color-surface)" }}
                    ></div>
                  </div>
                }
              >
                <TypingEngine className="w-full" />
              </ClientOnly>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}
