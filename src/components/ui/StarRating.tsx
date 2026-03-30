import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({ rating, maxRating = 5, size = 16, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={size}
            className={i < Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
            }
          />
        </button>
      ))}
    </div>
  )
}
