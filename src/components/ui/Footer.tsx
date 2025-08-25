"use client";

import React from "react";
import { IoLogoGithub } from "react-icons/io5";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`app-footer ${className}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            © 2025 월루타자기. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Made by Doomock</span>

            <a
              href="https://github.com/JYJE0N"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 p-2 rounded-md transition-all duration-200 flex items-center justify-center"
              style={{
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-interactive-secondary)'
                e.currentTarget.style.backgroundColor = 'var(--color-surface)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-primary)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              aria-label="GitHub Profile"
              title="GitHub Profile"
            >
              <IoLogoGithub className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
