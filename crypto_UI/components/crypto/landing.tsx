'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react'

export function Landing({ onEnter }: { onEnter: () => void }) {
  const [transitioning, setTransitioning] = useState(false)

  function handleStart() {
    if (transitioning) return
    setTransitioning(true)
    window.setTimeout(onEnter, 1150)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background car */}
      <div className="absolute inset-0">
        <Image
          src="/crypto/hero-car.png"
          alt="Front-facing electric performance car illuminated by blue automotive lighting"
          fill
          priority
          className="object-cover object-bottom opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        {/* Animated logo */}
        <div className="relative mb-8">
          <span className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border-strong bg-card/60 backdrop-blur">
            <span className="absolute h-20 w-20 rounded-2xl border border-primary/40 animate-pulse-ring" />
            <Lock className="h-9 w-9 text-bright" strokeWidth={1.6} aria-hidden="true" />
          </div>
        </div>

        {/* Platform badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-card/50 px-4 py-1.5 backdrop-blur">
          <ShieldCheck className="h-4 w-4 text-bright" strokeWidth={1.8} aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Automotive Cybersecurity Platform
          </span>
        </div>

        <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
          CRYPTO
        </h1>
        <p className="mt-2 text-lg font-light text-muted-foreground sm:text-xl">
          Secure your vehicle <span className="text-bright">with Cryptography</span>
        </p>

        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground/90 text-pretty sm:text-base">
          Choose the right cryptographic mechanisms for automotive cybersecurity use cases and
          understand the reasoning, risks, hardware impact, and post-quantum migration path.
        </p>

        <button
          onClick={handleStart}
          className="group mt-10 inline-flex min-h-[56px] items-center gap-3 rounded-md bg-primary px-8 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[0_10px_40px_-12px_rgba(59,130,246,0.7)] transition-all duration-200 hover:bg-bright hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Let&apos;s Get Started
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2} aria-hidden="true" />
        </button>

        {/* Security status */}
        <div className="mt-12 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="font-mono uppercase tracking-widest">Security systems online</span>
        </div>
      </div>

      {/* Cinematic headlight transition overlay */}
      {transitioning ? (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
          <span
            className="h-6 w-6 rounded-full bg-bright"
            style={{
              animation: 'crypto-headlight 1.1s cubic-bezier(0.7, 0, 0.84, 0) forwards',
              boxShadow: '0 0 60px 30px rgba(96,165,250,0.8)',
            }}
          />
        </div>
      ) : null}
    </main>
  )
}
