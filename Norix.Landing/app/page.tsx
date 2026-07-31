import {
  BarChart3,
  Bell,
  Building2,
  ChefHat,
  CreditCard,
  Package,
  Printer,
  QrCode,
  ShieldCheck,
  Table2,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LiveDashboard } from '@/components/landing/live-dashboard'
import { RestaurantParticles } from '@/components/landing/restaurant-particles'

const features = [
  {
    icon: ChefHat,
    title: 'Kitchen Management',
    body: 'Real-time kitchen display with live order tracking.',
    className: 'md:col-span-3',
  },
  {
    icon: QrCode,
    title: 'QR Ordering',
    body: 'Beautiful mobile ordering experience for your guests.',
    className: 'md:col-span-3',
  },
  {
    icon: CreditCard,
    title: 'POS System',
    body: 'Fast, intuitive and powerful point of sale.',
    className: 'md:col-span-3',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    body: 'Make data-driven decisions with real-time insights.',
    className: 'md:col-span-3',
  },
  {
    icon: Package,
    title: 'Inventory',
    body: 'Track stock in real-time and never run out.',
    className: 'md:col-span-3',
  },
  {
    icon: Table2,
    title: 'Table Management',
    body: 'Visual table map with live status updates.',
    className: 'md:col-span-3',
  },
  {
    icon: Printer,
    title: 'Printer Integration',
    body: 'Send orders to kitchen or receipt printers.',
    className: 'md:col-span-3',
  },
  {
    icon: Building2,
    title: 'Multi-Branch',
    body: 'Manage multiple locations from one dashboard.',
    className: 'md:col-span-3',
  },
]

const railModules: Array<{ title: string; icon: LucideIcon; body: string }> = [
  { title: 'Kitchen Operations', icon: ChefHat, body: 'Streamline kitchen workflow' },
  { title: 'QR Ordering', icon: QrCode, body: 'Let customers order from their phone' },
  { title: 'POS System', icon: CreditCard, body: 'Fast and secure point of sale' },
  { title: 'Inventory Control', icon: Package, body: 'Real-time stock management' },
  { title: 'Reports & Analytics', icon: BarChart3, body: 'Insights that help you grow' },
  { title: 'Employees Management', icon: Users, body: 'Roles, permissions and performance' },
  { title: 'Multi-Branch Management', icon: Building2, body: 'Scale your brand effortlessly' },
]

const flow = [
  ['Customer', 'Scans QR code and places order'],
  ['Order Received', 'Order instantly sent to NORIX'],
  ['Kitchen Display', 'Appears in kitchen in real-time'],
  ['Prepare', 'Cook with confidence and speed'],
  ['Serve', 'Order ready for the table'],
  ['Payment', 'Process payment and close bill'],
]

const testimonials = [
  ['Carlos M.', 'Restaurant Manager', 'NORIX transformed our kitchen operations. Orders flow smoothly and our team is more productive than ever.'],
  ['Ana L.', 'Owner', 'The QR ordering increased our average ticket and guests love the experience.'],
  ['Miguel R.', 'Operations Director', 'Everything is connected and real-time. NORIX is a system that just works.'],
]

const pricing = [
  ['Starter', '$49', 'For small restaurants', '1 Branch', 'QR Ordering', 'Kitchen Display'],
  ['Pro', '$99', 'Everything you need to grow', 'Up to 3 Branches', 'All Starter features', 'Inventory Management'],
  ['Enterprise', 'Custom', 'For growing restaurant groups', 'Unlimited Branches', 'Custom Integrations', 'Dedicated Support'],
]

const metrics: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: '99.99%', label: 'Uptime', icon: ShieldCheck },
  { value: '<300ms', label: 'Average Sync', icon: Bell },
  { value: '10K+', label: 'Orders Processed Daily', icon: Package },
  { value: 'Multi-Branch', label: 'Ready', icon: Building2 },
]

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--norix-deep)] text-[var(--norix-light)]">
      <RestaurantParticles />
      <div className="norix-grid pointer-events-none fixed inset-0 z-[1]" />
      <div className="norix-beam norix-beam-a" />
      <div className="norix-beam norix-beam-b" />

      <section className="relative z-10 mx-auto grid min-h-screen w-[min(1280px,calc(100%_-_32px))] px-4 py-6">
        <header className="sticky top-4 z-30 flex items-center justify-between rounded-2xl border border-white/10 bg-[#080f19]/45 px-4 py-3 shadow-[0_24px_80px_rgb(0_0_0/0.28)] backdrop-blur-2xl">
          <a className="flex items-center gap-3 text-sm font-bold tracking-[0.28em] text-white" href="#">
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-[#141a24]/60 text-[var(--norix-green)] backdrop-blur-xl">
              N
            </span>
            NORIX
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--norix-muted)] md:flex">
            <a href="#modules">Product</a>
            <a href="#workflow">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Resources</a>
            <a href="#footer">Company</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button href="/login" variant="secondary">
              Log in
            </Button>
            <Button href="/login">Start Free Trial</Button>
          </div>
        </header>

        <div className="grid items-center gap-10 py-16 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-[var(--norix-green)]/20 bg-[#141a24]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--norix-green)] backdrop-blur-xl">
              All-in-one restaurant OS
            </p>
            <h1
              data-split
              className="max-w-[12ch] text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-white md:text-7xl"
            >
              The Operating System for Modern Restaurants
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[var(--norix-muted)] md:text-lg">
              NORIX brings together orders, kitchen, POS, inventory and analytics
              in one powerful platform. Built to simplify operations and elevate
              every dining experience.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/login">Start Free Trial</Button>
              <Button href="#modules" variant="secondary">
                Watch Demo
              </Button>
            </div>

            <div className="mt-16">
              <p className="mb-5 text-sm text-[var(--norix-muted)]">Trusted by modern restaurants</p>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold uppercase tracking-[0.16em] text-white/35">
                <span>Rincon</span>
                <span>La Parrilla</span>
                <span>Cafe Central</span>
                <span>Sabor</span>
              </div>
            </div>
          </div>

          <LiveDashboard />
        </div>
      </section>

      <section id="modules" data-reveal-root className="relative z-10 mx-auto grid w-[min(1280px,calc(100%_-_32px))] gap-8 px-4 py-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-[var(--norix-blue)]/25 bg-[var(--norix-blue)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--norix-green)]">
            Built for every operation
          </p>
          <h2 className="text-4xl font-semibold leading-[0.96] tracking-[-0.045em] text-white md:text-6xl">
            Run the restaurant from one living command center.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} data-reveal className={`group min-h-[270px] overflow-hidden p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--norix-green)]/25 ${feature.className}`}>
                <div className="mb-7 flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--norix-green)]/20 bg-[var(--norix-green)]/10 text-[var(--norix-green)]">
                    <Icon size={20} />
                  </div>
                  <span className="rounded-full border border-[var(--norix-green)]/20 bg-[var(--norix-green)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--norix-green)] opacity-0 transition group-hover:opacity-100">
                    Live
                  </span>
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{feature.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--norix-muted)]">{feature.body}</p>
                <div className="mt-8 rounded-2xl border border-white/10 bg-[#080f19]/65 p-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[var(--norix-green)] to-[var(--norix-blue)] transition duration-500 group-hover:w-full" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto w-[min(1280px,calc(100%_-_32px))] px-4 py-10">
        <Card className="overflow-hidden p-5">
          <p className="mb-6 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--norix-muted)]">
            Built for every restaurant
          </p>
          <div className="grid gap-3 md:grid-cols-7">
            {railModules.map(({ title, icon: Icon, body }) => {
              return (
                <div key={title} className="grid min-h-36 place-items-center rounded-2xl border border-white/10 bg-[#080f19]/50 p-4 text-center">
                  <Icon className="text-[var(--norix-green)]" size={24} />
                  <strong className="mt-3 text-sm text-white">{title}</strong>
                  <span className="mt-1 text-xs leading-5 text-[var(--norix-muted)]">{body}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      <section id="workflow" className="relative z-10 mx-auto grid w-[min(1280px,calc(100%_-_32px))] gap-8 px-4 py-20 lg:grid-cols-[0.28fr_0.72fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--norix-muted)]">
            How NORIX works
          </p>
          <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white md:text-5xl">
            From Customer to Kitchen. Seamlessly.
          </h2>
          <p className="mt-5 leading-7 text-[var(--norix-muted)]">
            Every order flows through your operation in real-time. No delays. No confusion.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {flow.map(([title, body], index) => (
            <Card key={title} className="relative min-h-48 p-5 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[var(--norix-blue)]/25 bg-[var(--norix-blue)]/10 text-white">
                {index + 1}
              </div>
              <strong className="mt-5 block text-sm text-white">{title}</strong>
              <span className="mt-2 block text-xs leading-5 text-[var(--norix-muted)]">{body}</span>
            </Card>
          ))}
        </div>
      </section>

      <section id="metrics" className="relative z-10 mx-auto grid w-[min(1280px,calc(100%_-_32px))] gap-4 px-4 py-10 md:grid-cols-4">
        {metrics.map(({ value, label, icon: Icon }) => {
          return (
            <Card key={value} className="flex min-h-32 items-center gap-5 p-6">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-[var(--norix-blue)]/20 bg-[var(--norix-blue)]/10 text-[var(--norix-green)]">
                <Icon size={24} />
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-white">{value}</p>
                <span className="text-sm text-[var(--norix-muted)]">{label}</span>
              </div>
            </Card>
          )
        })}
      </section>

      <section id="testimonials" className="relative z-10 mx-auto grid w-[min(1280px,calc(100%_-_32px))] gap-4 px-4 py-16 md:grid-cols-4">
        {testimonials.map(([name, role, quote]) => (
          <Card key={name} className="p-6 md:col-span-1">
            <p className="min-h-28 text-sm leading-7 text-white/80">"{quote}"</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[var(--norix-green)] to-[var(--norix-blue)] text-sm font-bold text-[#03120f]">
                {name.charAt(0)}
              </span>
              <div>
                <strong className="block text-sm text-white">{name}</strong>
                <span className="text-xs text-[var(--norix-muted)]">{role}</span>
              </div>
            </div>
          </Card>
        ))}
        <Card className="p-6">
          <p className="mb-4 text-sm font-semibold text-white">All plans include:</p>
          {['Unlimited Orders', 'Real-time Sync', 'Printer Integration', 'Mobile App', '24/7 Support'].map((item) => (
            <div key={item} className="mb-3 flex items-center gap-2 text-sm text-[var(--norix-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--norix-green)]" />
              {item}
            </div>
          ))}
        </Card>
      </section>

      <section id="pricing" className="relative z-10 mx-auto grid w-[min(1280px,calc(100%_-_32px))] gap-4 px-4 py-10 md:grid-cols-4">
        <Card className="grid content-center p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--norix-muted)]">Simple pricing</p>
          <h2 className="text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white">
            Choose the plan that fits your restaurant.
          </h2>
        </Card>
        {pricing.map(([name, price, body, ...items]) => (
          <Card key={name} className="grid gap-5 p-6">
            <div>
              <h3 className="text-xl font-semibold text-white">{name}</h3>
              <p className="mt-2 text-sm text-[var(--norix-muted)]">{body}</p>
            </div>
            <p className="text-4xl font-semibold tracking-[-0.05em] text-white">{price}</p>
            <div className="grid gap-2">
              {items.map((item) => (
                <span key={item} className="text-sm text-[var(--norix-muted)]">{item}</span>
              ))}
            </div>
            <Button href="/login" variant={name === 'Pro' ? 'primary' : 'secondary'}>
              {name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
            </Button>
          </Card>
        ))}
      </section>

      <footer id="footer" className="relative z-10 mx-auto grid w-[min(1280px,calc(100%_-_32px))] gap-8 px-4 py-16 md:grid-cols-[1fr_2fr_auto]">
        <div>
          <p className="text-sm font-bold tracking-[0.28em] text-white">NORIX</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--norix-muted)]">
            The operating system for modern restaurants.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm text-[var(--norix-muted)] md:grid-cols-4">
          {['Product', 'Solutions', 'Resources', 'Company'].map((group) => (
            <div key={group}>
              <strong className="mb-3 block text-white">{group}</strong>
              <span className="block">Features</span>
              <span className="mt-2 block">Integrations</span>
              <span className="mt-2 block">Updates</span>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-3">
          <Button href="/login">Start Free Trial</Button>
          <Button href="#modules" variant="secondary">Watch Demo</Button>
        </div>
      </footer>
    </main>
  )
}
