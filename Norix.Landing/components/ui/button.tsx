import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = ComponentPropsWithoutRef<'a'> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <a
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-xl border px-5 text-sm font-semibold transition duration-200 ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
        variant === 'primary' &&
          'border-[#22d3a6]/35 bg-gradient-to-br from-[#22d3a6] to-[#2563ff] text-[#03120f] shadow-[0_18px_42px_rgb(37_99_255/0.22)] hover:-translate-y-0.5',
        variant === 'secondary' &&
          'border-white/10 bg-[#141a24]/55 text-[#e2e6f0] backdrop-blur-xl hover:-translate-y-0.5 hover:border-[#22d3a6]/35',
        variant === 'ghost' &&
          'border-transparent bg-transparent text-[#8f98a8] hover:text-white',
        className,
      )}
      {...props}
    />
  )
}
