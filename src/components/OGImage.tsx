"use client";

import React from 'react';
import { FaKeyboard } from "react-icons/fa6";

/**
 * Open Graph 이미지용 컴포넌트
 * 1200x630 크기로 소셜 미디어 공유용 이미지 생성
 */
export function OGImage() {
  return (
    <div 
      style={{
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Pretendard Variable', -apple-system, BlinkMacSystemFont, sans-serif",
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 배경 패턴 */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        }}
      />

      {/* 메인 콘텐츠 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '40px',
        zIndex: 10,
        marginBottom: '30px'
      }}>
        {/* 키보드 아이콘 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '30px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <FaKeyboard 
            style={{ 
              fontSize: '120px',
              filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))'
            }} 
          />
        </div>

        {/* 텍스트 콘텐츠 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          <h1 style={{ 
            fontSize: '80px', 
            fontWeight: '800',
            margin: '0 0 20px 0',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            월루타자기
          </h1>
          <p style={{ 
            fontSize: '36px', 
            fontWeight: '500',
            margin: '0',
            opacity: '0.9',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            한글 타자 연습의 새로운 경험
          </p>
        </div>
      </div>

      {/* 하단 설명 */}
      <div style={{ 
        display: 'flex', 
        gap: '60px',
        zIndex: 10,
        opacity: '0.8'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#4ade80'
          }} />
          실시간 통계
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#f59e0b'
          }} />
          승급 시스템
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ec4899'
          }} />
          맞춤형 연습
        </div>
      </div>

      {/* 도메인 표시 */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '40px',
        fontSize: '28px',
        fontWeight: '700',
        opacity: '0.6',
        textShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        wollu.life
      </div>

      {/* 좌상단 장식 */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
      }} />

      {/* 우하단 장식 */}
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        right: '-150px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.03)',
      }} />
    </div>
  );
}