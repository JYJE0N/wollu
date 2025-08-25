"use client";

import React from 'react';
import { Header } from './Header';

interface GlobalHeaderProps {
  className?: string;
}

export function GlobalHeader({ className = "" }: GlobalHeaderProps) {
  return (
    <div className={`app-header ${className}`}>
      <Header mode="normal" />
    </div>
  );
}