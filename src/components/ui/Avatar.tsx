import { ReactNode } from "react";

export interface AvatarProps {
  type: "user" | "assistant";
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({
  type,
  icon,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizeStyles = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const backgroundStyles =
    type === "user"
      ? "bg-gray-100 border border-border text-textSubtle"
      : "bg-primary/10 border border-primary/20 text-primary";

  const defaultIcon =
    type === "user" ? (
      <svg
        className={`${iconSizes[size]}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ) : (
      <svg
        className={`${iconSizes[size]}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );

  return (
    <div
      className={`${sizeStyles[size]} rounded-md ${backgroundStyles} flex items-center justify-center flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      {icon || defaultIcon}
    </div>
  );
}
