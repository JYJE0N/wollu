"use client";

interface KeyCapProps {
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg';
  variant?: 'default' | 'accent' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function KeyCap({ 
  children, 
  size = 'base', 
  variant = 'default',
  className = '' 
}: KeyCapProps) {
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs min-w-[28px] h-6',
    base: 'px-3 py-1 text-sm min-w-[36px] h-7',
    lg: 'px-4 py-1.5 text-base min-w-[44px] h-9'
  };

  const variantStyles = {
    default: {
      backgroundColor: 'var(--color-background-elevated)',
      color: 'var(--color-text-secondary)',
      borderColor: 'var(--color-border)'
    },
    accent: {
      backgroundColor: 'var(--color-interactive-secondary)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-interactive-secondary)'
    },
    primary: {
      backgroundColor: 'var(--color-interactive-primary)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-interactive-primary)'
    },
    success: {
      backgroundColor: 'var(--color-feedback-success)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-feedback-success)'
    },
    warning: {
      backgroundColor: 'var(--color-feedback-warning)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-feedback-warning)'
    },
    danger: {
      backgroundColor: 'var(--color-feedback-error)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-feedback-error)'
    },
    info: {
      backgroundColor: 'var(--color-feedback-info)',
      color: 'var(--color-text-inverse)',
      borderColor: 'var(--color-feedback-info)'
    }
  };

  return (
    <kbd 
      className={`
        inline-flex items-center justify-center
        border rounded-md
        font-mono font-semibold
        transition-all duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        ...variantStyles[variant],
        boxShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.5)',
        textShadow: '0 1px 0 rgba(0,0,0,0.5)'
      }}
    >
      {children}
    </kbd>
  );
}