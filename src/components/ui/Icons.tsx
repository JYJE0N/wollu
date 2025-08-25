// 최적화된 아이콘 컴포넌트 - 트리 셰이킹 및 번들 크기 최적화
// 각 아이콘을 개별 컴포넌트로 래핑하여 필요한 것만 로딩

import { lazy } from "react";

// React Icons 동적 임포트 (라이브러리별 분할)
export const IoPlay = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoPlay }))
);

export const IoPauseSharp = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoPauseSharp }))
);

export const IoStop = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoStop }))
);

export const IoReloadCircle = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoReloadCircle }))
);

export const IoStatsChart = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoStatsChart }))
);

export const IoSettingsSharp = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoSettingsSharp }))
);

export const IoSparkles = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoSparkles }))
);

export const IoTrophy = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoTrophy }))
);

export const IoTime = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoTime }))
);

export const IoBulb = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoBulb }))
);

export const IoGift = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoGift }))
);

export const IoAddCircle = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoAddCircle }))
);

export const IoTrendingUp = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoTrendingUp }))
);

export const IoCheckbox = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoCheckbox }))
);

export const IoTimer = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoTimer }))
);

export const IoRocket = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoRocket }))
);

export const IoThumbsUpSharp = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoThumbsUpSharp }))
);

export const IoPersonSharp = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoPersonSharp }))
);

export const IoLogoGithub = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoLogoGithub }))
);

export const IoCalendarOutline = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoCalendarOutline }))
);

export const IoColorPalette = lazy(() => 
  import("react-icons/io5").then(module => ({ default: module.IoColorPalette }))
);

// FA6 아이콘들
export const FaKeyboard = lazy(() => 
  import("react-icons/fa6").then(module => ({ default: module.FaKeyboard }))
);

export const FaChartColumn = lazy(() => 
  import("react-icons/fa6").then(module => ({ default: module.FaChartColumn }))
);

// Hi2 아이콘들  
export const HiCheckBadge = lazy(() => 
  import("react-icons/hi2").then(module => ({ default: module.HiCheckBadge }))
);

// AI 아이콘들
export const AiFillThunderbolt = lazy(() => 
  import("react-icons/ai").then(module => ({ default: module.AiFillThunderbolt }))
);

// Ri 아이콘들
export const RiGlobalLine = lazy(() => 
  import("react-icons/ri").then(module => ({ default: module.RiGlobalLine }))
);

// Tb 아이콘들
export const TbSettings = lazy(() => 
  import("react-icons/tb").then(module => ({ default: module.TbSettings }))
);

// Lu 아이콘들
export const LuAlarmClockCheck = lazy(() => 
  import("react-icons/lu").then(module => ({ default: module.LuAlarmClockCheck }))
);

export const LuCircleArrowRight = lazy(() => 
  import("react-icons/lu").then(module => ({ default: module.LuCircleArrowRight }))
);