import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/10 bg-[#141a24]/55 shadow-[0_28px_90px_rgb(0_0_0/0.28)] backdrop-blur-2xl',
        'before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#22d3a6]/45 before:to-transparent',
        'relative',
        className,
      )}
      {...props}
    />
  )
}
