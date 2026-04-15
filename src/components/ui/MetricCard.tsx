import * as React from "react"
import { cn } from "@/lib/utils"

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, trend, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col bg-[#1a1a1a] rounded-[4px] p-6 transition-colors duration-200 hover:bg-[#2c2c2c]",
          className
        )}
        {...props}
      >
        <span className="text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-[#adaaaa] mb-2 font-sans">
          {title}
        </span>
        <div className="text-4xl sm:text-5xl font-bold tracking-tight text-[#f3ffca] font-sans">
          {value}
        </div>
        {trend && (
          <div className="mt-4 flex items-center space-x-2 text-sm font-sans">
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-[#cafd00]" : "text-[#ff7351]"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-[#adaaaa]">{trend.label}</span>
          </div>
        )}
      </div>
    )
  }
)
MetricCard.displayName = "MetricCard"

export { MetricCard }
