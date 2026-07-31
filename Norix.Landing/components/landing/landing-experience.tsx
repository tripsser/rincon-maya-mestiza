'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import SplitType from 'split-type'
import { useEffect, useRef } from 'react'

export function LandingExperience() {
  const horizontalRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({ duration: 0.72, smoothWheel: true, wheelMultiplier: 1 })
    const raf = (time: number) => lenis.raf(time * 1000)

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    let split: SplitType | undefined
    const ctx = gsap.context(() => {
      split = new SplitType('[data-split]', { types: 'words' })
      gsap.from(split.words, {
        yPercent: 105,
        opacity: 0,
        stagger: 0.035,
        duration: 0.82,
        ease: 'power4.out',
      })

      gsap.from('[data-reveal]', {
        y: 34,
        opacity: 0,
        stagger: 0.08,
        duration: 0.72,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-reveal-root]', start: 'top 72%' },
      })

      if (horizontalRef.current && trackRef.current && window.matchMedia('(min-width: 901px)').matches) {
        const distance = trackRef.current.scrollWidth - horizontalRef.current.clientWidth

        gsap.to(trackRef.current, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: horizontalRef.current,
            start: 'top top',
            end: () => `+=${distance}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      }
    })

    return () => {
      ctx.revert()
      split?.revert()
      lenis.destroy()
      gsap.ticker.remove(raf)
    }
  }, [])

  return (
    <section ref={horizontalRef} className="relative z-10 min-h-screen overflow-hidden">
      <div ref={trackRef} className="flex min-h-screen w-max items-center gap-6 px-4 md:px-[calc((100vw-min(1180px,calc(100vw-32px)))/2)]">
        {['Kitchen', 'QR Ordering', 'POS', 'Reports', 'Employees'].map((item, index) => (
          <article
            className="relative grid min-h-[62vh] w-[min(76vw,700px)] content-end overflow-hidden rounded-[2rem] border border-white/10 bg-[#141a24]/55 p-8 shadow-[0_28px_90px_rgb(0_0_0/0.28)] backdrop-blur-2xl md:p-12"
            key={item}
          >
            <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--norix-green)]/50 to-transparent" />
            <span className="mb-8 text-8xl font-black tracking-[-0.08em] text-[var(--norix-blue)]/18">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--norix-green)]">Module</p>
            <h2 className="text-6xl font-semibold tracking-[-0.05em] text-white md:text-8xl">{item}</h2>
          </article>
        ))}
      </div>
    </section>
  )
}
