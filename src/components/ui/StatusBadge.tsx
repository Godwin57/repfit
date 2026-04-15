import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "excellent" | "good" | "needs-attention" | "critical" | string
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, ...props }, ref) => {
    const getStatusStyles = (status: string) => {
      switch (status.toLowerCase()) {
        case "excellent":
          return "bg-[#cafd00]/10 text-[#cafd00] border-[#cafd00]/20"
        case "good":
          return "bg-[#ece856]/10 text-[#ece856] border-[#ece856]/20"
        case "needs-attention":
          return "bg-[#ff7351]/10 text-[#ff7351] border-[#ff7351]/20"
        case "critical":
          return "bg-[#b92902]/10 text-[#ff7351] border-[#ff7351]/20"
        default:
          return "bg-[#262626] text-[#adaaaa] border-[#484847]/15"
      }
    }

    const getStatusLabel = (status: string) => {
      return status.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold tracking-[0.05em] uppercase border",
          getStatusStyles(status),
          className
        )}
        {...props}
      >
        {getStatusLabel(status)}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
