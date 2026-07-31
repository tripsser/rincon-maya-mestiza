'use client'

import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export function RestaurantParticles() {
  return (
    <ParticlesProvider init={loadSlim}>
      <Particles
        id="restaurant-particles"
        className="pointer-events-none fixed inset-0 z-[2] opacity-70"
        options={{
          fullScreen: false,
          background: { color: 'transparent' },
          fpsLimit: 40,
          particles: {
            number: { value: 72, density: { enable: true, width: 1200, height: 900 } },
            color: { value: ['#22d3a6', '#2563ff', '#e2e6f0'] },
            opacity: { value: { min: 0.08, max: 0.28 } },
            size: { value: { min: 0.45, max: 1.55 } },
            move: { enable: true, speed: 0.12, direction: 'none', outModes: 'out' },
          },
          detectRetina: true,
        }}
      />
    </ParticlesProvider>
  )
}
