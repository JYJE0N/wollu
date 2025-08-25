// OG 이미지 생성 스크립트
// Node.js 환경에서 실행하여 실제 PNG 파일을 생성합니다.

const fs = require('fs');
const path = require('path');

// HTML to Image 변환을 위한 간단한 HTML 템플릿
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, sans-serif;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .bg-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%);
        }
        
        .main-content {
            display: flex;
            align-items: center;
            gap: 40px;
            z-index: 10;
            margin-bottom: 30px;
        }
        
        .icon-container {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .keyboard-icon {
            font-size: 120px;
            filter: drop-shadow(0 4px 20px rgba(0,0,0,0.3));
        }
        
        .text-content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        
        .title {
            font-size: 80px;
            font-weight: 800;
            margin: 0 0 20px 0;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
            background: linear-gradient(45deg, #ffffff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 36px;
            font-weight: 500;
            margin: 0;
            opacity: 0.9;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .features {
            display: flex;
            gap: 60px;
            z-index: 10;
            opacity: 0.8;
        }
        
        .feature {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 24px;
            font-weight: 600;
        }
        
        .feature-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        
        .dot-green { background: #4ade80; }
        .dot-orange { background: #f59e0b; }
        .dot-pink { background: #ec4899; }
        
        .domain {
            position: absolute;
            bottom: 40px;
            right: 40px;
            font-size: 28px;
            font-weight: 700;
            opacity: 0.6;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .decoration-1 {
            position: absolute;
            top: -100px;
            left: -100px;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
        }
        
        .decoration-2 {
            position: absolute;
            bottom: -150px;
            right: -150px;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.03);
        }
    </style>
</head>
<body>
    <div class="bg-pattern"></div>
    
    <div class="main-content">
        <div class="icon-container">
            <!-- 키보드 아이콘 SVG -->
            <svg class="keyboard-icon" viewBox="0 0 576 512" fill="currentColor">
                <path d="M64 112c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16h448c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zM0 128C0 92.7 28.7 64 64 64h448c35.3 0 64 28.7 64 64v256c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zm176 64h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-16 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16zm16 48h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H176c-8.8 0-16-7.2-16-16s7.2-16 16-16zM96 192h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H96c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 80h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H96c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 48h256c8.8 0 16 7.2 16 16s-7.2 16-16 16H96c-8.8 0-16-7.2-16-16s7.2-16 16-16zm272-144h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-16 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16zm16 48h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s7.2-16 16-16zM256 192h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H256c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-16 80c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H256c-8.8 0-16-7.2-16-16zm144-80h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H384c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-16 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H384c-8.8 0-16-7.2-16-16zm16 48h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H384c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
            </svg>
        </div>
        
        <div class="text-content">
            <h1 class="title">월루타자기</h1>
            <p class="subtitle">한글 타자 연습의 새로운 경험</p>
        </div>
    </div>
    
    <div class="features">
        <div class="feature">
            <div class="feature-dot dot-green"></div>
            실시간 통계
        </div>
        <div class="feature">
            <div class="feature-dot dot-orange"></div>
            승급 시스템
        </div>
        <div class="feature">
            <div class="feature-dot dot-pink"></div>
            맞춤형 연습
        </div>
    </div>
    
    <div class="domain">wollu.life</div>
    
    <div class="decoration-1"></div>
    <div class="decoration-2"></div>
</body>
</html>
`;

// HTML 파일로 저장
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'og-template.html'), htmlTemplate);

console.log(`
🎨 OG 이미지 템플릿이 생성되었습니다!

📁 생성된 파일: public/og-template.html

🔧 PNG로 변환하는 방법:

1. 온라인 도구 사용:
   - https://html-css-js.com/html/generator/screenshot/ 
   - 1200x630 크기로 설정 후 스크린샷

2. Puppeteer 사용 (Node.js):
   npm install puppeteer
   
3. 브라우저에서 직접:
   - og-template.html을 브라우저에서 열기
   - 개발자 도구 → Device Mode → 1200x630 설정
   - 스크린샷 캡처

🎯 최종 파일명: public/og-image.png
`);