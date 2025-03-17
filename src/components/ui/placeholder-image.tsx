import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PlaceholderImageProps extends HTMLAttributes<HTMLDivElement> {
  width?: number
  height?: number
}

export function PlaceholderImage({ width = 100, height = 100, className, ...props }: PlaceholderImageProps) {
  return (
    <div
      className={cn("flex items-center justify-center bg-muted text-muted-foreground rounded-md", className)}
      style={{ width: `${width}px`, height: `${height}px` }}
      {...props}
    >
      <span className="text-xs">
        {width} × {height}
      </span>
    </div>
  )
}

