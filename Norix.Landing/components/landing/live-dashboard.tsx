'use client'

import { motion } from 'framer-motion'
import { BarChart3, ChefHat, CreditCard, Package, ReceiptText, Settings, Utensils } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const events = [
  { id: '#1052', table: 'Table 12', state: 'New', tone: 'text-[var(--norix-blue)]' },
  { id: '#1051', table: 'Table 7', state: 'Preparing', tone: 'text-[#ffb300]' },
  { id: '#1049', table: 'Table 1', state: 'Ready', tone: 'text-[var(--norix-green)]' },
  { id: '#1048', table: 'Table 9', state: 'Completed', tone: 'text-white/50' },
]

const nav: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Overview', icon: BarChart3 },
  { label: 'Orders', icon: ReceiptText },
  { label: 'Kitchen', icon: ChefHat },
  { label: 'POS', icon: CreditCard },
  { label: 'Menu', icon: Utensils },
  { label: 'Inventory', icon: Package },
  { label: 'Settings', icon: Settings },
]

export function LiveDashboard() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#141a24]/55 p-3 shadow-[0_40px_140px_rgb(0_0_0/0.45)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, rotateX: 2, rotateY: -3 }}
    >
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[var(--norix-green)]/60 to-transparent" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--norix-blue)]/18 blur-3xl" />
      <div className="absolute -bottom-24 left-14 h-56 w-56 rounded-full bg-[var(--norix-green)]/12 blur-3xl" />
      <div className="relative rounded-[1.45rem] border border-white/10 bg-[#080f19]/72 backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5252]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffb300]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--norix-green)]" />
          <span className="ml-4 text-xs font-bold tracking-[0.2em] text-white">NORIX</span>
          <span className="ml-auto text-xs font-medium text-[var(--norix-muted)]">Today, live</span>
        </div>

        <div className="grid min-h-[520px] gap-4 p-4 lg:grid-cols-[170px_1fr]">
          <aside className="hidden rounded-2xl border border-white/10 bg-black/25 p-3 lg:block">
            <div className="grid gap-1">
              {nav.map(({ label, icon: Icon }, index) => {
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs ${
                      index === 0
                        ? 'bg-[var(--norix-violet)]/18 text-white'
                        : 'text-[var(--norix-muted)]'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </div>
                )
              })}
            </div>
            <div className="mt-24 rounded-2xl border border-white/10 bg-[#141a24]/55 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--norix-muted)]">Current Branch</p>
              <p className="mt-2 text-sm font-semibold text-white">La Mestiza Centro</p>
            </div>
          </aside>

          <div className="grid content-start gap-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Today Orders', '128', '+12% vs yesterday'],
                ['Sales', '$4,680', '+8.1% vs yesterday'],
                ['Average Ticket', '$36.56', '+5.1% vs yesterday'],
                ['Active Tables', '24 / 40', '60% occupied'],
              ].map(([label, value, meta]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-[#141a24]/50 p-4">
                  <p className="text-[11px] text-[var(--norix-muted)]">{label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
                  <p className="mt-2 text-[11px] text-[var(--norix-green)]">{meta}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-2xl border border-white/10 bg-[#141a24]/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Live Orders</p>
                  <span className="rounded-full bg-[var(--norix-green)]/10 px-2 py-1 text-[10px] font-semibold text-[var(--norix-green)]">
                    Live
                  </span>
                </div>
                <div className="grid gap-2">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                      animate={{ opacity: [0.68, 1, 0.78], x: [0, 5, 0] }}
                      transition={{ duration: 3.4, delay: index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <span className="text-xs font-semibold text-white">{event.id}</span>
                      <span className="text-xs text-[var(--norix-muted)]">{event.table}</span>
                      <span className={`text-xs font-semibold ${event.tone}`}>{event.state}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#141a24]/50 p-4">
                <p className="mb-4 text-sm font-semibold text-white">Kitchen Display</p>
                <div className="grid grid-cols-3 gap-3">
                  {events.slice(0, 3).map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="min-h-28 rounded-2xl border border-white/10 bg-black/25 p-3"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, delay: index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <span className={`text-[11px] font-semibold ${event.tone}`}>{event.state}</span>
                      <p className="mt-3 text-sm font-semibold text-white">{event.id}</p>
                      <p className="text-xs text-[var(--norix-muted)]">{event.table}</p>
                      <p className="mt-4 text-[11px] text-[var(--norix-muted)]">{index + 2} items</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.48fr]">
              <div className="rounded-2xl border border-white/10 bg-[#141a24]/50 p-4">
                <p className="mb-3 text-sm font-semibold text-white">Sales Overview</p>
                <div className="flex h-28 items-end gap-2">
                  {[28, 42, 34, 58, 46, 64, 52, 74, 66, 82, 76, 92].map((height, index) => (
                    <motion.span
                      key={index}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-[var(--norix-blue)] to-[var(--norix-green)]"
                      initial={{ height: 8 }}
                      animate={{ height }}
                      transition={{ duration: 1.5, delay: index * 0.08, repeat: Infinity, repeatType: 'mirror' }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#141a24]/50 p-4">
                <p className="mb-4 text-sm font-semibold text-white">Top Items</p>
                {['Ribeye Steak', 'Truffle Pasta', 'Margarita Pizza'].map((item, index) => (
                  <div key={item} className="mb-3 flex justify-between text-xs">
                    <span className="text-[var(--norix-muted)]">{index + 1}. {item}</span>
                    <span className="text-white">{[28, 24, 18][index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
