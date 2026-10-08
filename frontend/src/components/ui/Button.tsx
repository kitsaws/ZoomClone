import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "orange"
    | "secondary"
    | "outline"
    | "danger"
    | "ghost"
    | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zoom-blue/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-zoom-blue text-white hover:bg-zoom-blue-hover shadow-[0_2px_8px_rgba(45,140,255,0.25)] hover:shadow-[0_4px_12px_rgba(45,140,255,0.35)]",
      orange:
        "bg-zoom-orange text-white hover:bg-zoom-orange-hover shadow-[0_2px_8px_rgba(242,109,33,0.25)] hover:shadow-[0_4px_12px_rgba(242,109,33,0.35)]",
      secondary:
        "bg-surface text-text-primary hover:bg-surface-hover border border-app-border hover:border-app-border-light shadow-sm",
      outline:
        "bg-transparent text-text-primary hover:bg-surface-hover border border-app-border hover:border-zoom-blue/50",
      danger:
        "bg-zoom-danger text-white hover:bg-zoom-danger-hover shadow-[0_2px_8px_rgba(224,40,40,0.25)]",
      ghost:
        "bg-transparent text-text-primary hover:bg-surface-hover",
      subtle:
        "bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-subtle",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
