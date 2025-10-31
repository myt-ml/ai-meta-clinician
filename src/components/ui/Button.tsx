import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium transition-all duration-[var(--motion-duration)] rounded-md focus:outline-none focus:ring-2 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary-dark focus:ring-primary disabled:bg-gray-300",
    secondary:
      "bg-surface border border-border text-textMain hover:bg-surfaceAlt focus:ring-primary disabled:bg-gray-100",
    danger:
      "border border-danger text-danger bg-surface hover:bg-danger-soft focus:ring-danger disabled:opacity-50",
    ghost:
      "text-textSubtle hover:text-primary hover:bg-surfaceAlt focus:ring-primary disabled:text-textMuted",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
