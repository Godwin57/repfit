import * as React from "react"
import { cn } from "@/lib/utils"

export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center text-[0.6875rem] font-bold tracking-[0.05em] uppercase transition-all duration-200 rounded-[4px] px-6 py-3 font-sans",
          variant === "primary"
            ? "bg-gradient-to-r from-[#beee00] to-[#cafd00] text-[#3a4a00] hover:scale-[1.02] active:scale-95"
            : "bg-[#262626] text-white border border-[#484847]/15 hover:bg-[#2c2c2c] hover:border-[#484847]/30",
          className
        )}
        {...props}
      />
    )
  }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton }
