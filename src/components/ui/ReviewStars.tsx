import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ReviewStarsProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number
  maxRating?: number
  starSize?: number
}

const ReviewStars = React.forwardRef<HTMLDivElement, ReviewStarsProps>(
  ({ className, rating, maxRating = 5, starSize = 16, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn("flex items-center space-x-1", className)} 
        {...props}
        aria-label={`Rating: ${rating} out of ${maxRating} stars`}
      >
        {Array.from({ length: maxRating }).map((_, i) => {
          const isFilled = i < Math.floor(rating)
          const isHalf = i === Math.floor(rating) && rating % 1 !== 0

          if (isFilled) {
            return (
              <Star
                key={i}
                size={starSize}
                className="fill-[#cafd00] text-[#cafd00]"
              />
            )
          }

          if (isHalf) {
            return (
              <div key={i} className="relative">
                <Star size={starSize} className="text-[#484847]" />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star size={starSize} className="fill-[#cafd00] text-[#cafd00]" />
                </div>
              </div>
            )
          }

          return (
            <Star
              key={i}
              size={starSize}
              className="text-[#484847]"
            />
          )
        })}
      </div>
    )
  }
)
ReviewStars.displayName = "ReviewStars"

export { ReviewStars }
