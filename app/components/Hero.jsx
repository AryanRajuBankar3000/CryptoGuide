'use client'

import { useEffect, useRef, useState } from 'react'

export function Hero() {
  const containerRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      
      // Calculate how far down we've scrolled inside the container
      const rect = containerRef.current.getBoundingClientRect()
      // rect.top goes from 0 (at top of viewport) to negative values as we scroll down
      const scrollPos = Math.max(0, -rect.top)
      setScrollY(scrollPos)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // We want the hero section to take up 300vh so we have 200vh of scrolling space
  // Progress goes from 0 to 1 based on scrolling
  // 100vh = window.innerHeight
  const maxScroll = typeof window !== 'undefined' ? window.innerHeight * 2 : 1000
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll))

  // Text Animation:
  // Fade in at start (0-10%), fade out slowly as user scrolls 30% of the section (10-40%)
  const textOpacity = progress < 0.1 
    ? (progress / 0.1) // 0 to 1
    : progress < 0.4 
      ? 1 - ((progress - 0.1) / 0.3) // 1 to 0
      : 0

  // Bottle Animation:
  // Starts small and blurred/hidden, then scales up, clears up, and settles in the center
  const bottleScale = 0.5 + (progress * 0.5) // 0.5 to 1.0
  const bottleOpacity = Math.min(1, progress * 2) // fully visible halfway through

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Background Canvas (solid black) */}
        <div className="absolute inset-0 bg-black z-0" />

        {/* Text Overlay */}
        <div 
          className="absolute z-20 flex flex-col items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          <h1 className="text-7xl md:text-9xl font-bold text-white tracking-tighter">
            CryptoGuide
          </h1>
          <p className="mt-4 text-xl text-white/80">Scroll to explore</p>
        </div>

        {/* Product Image Animation */}
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
        >
          {/* Using a standard img tag to animate cleanly based on state */}
          <img
            src="/milk-bottle.jpg"
            alt="Rose Flavored Milk"
            className="object-cover max-w-full max-h-full transition-transform duration-75 ease-out"
            style={{
              transform: `scale(${bottleScale})`,
              opacity: bottleOpacity,
              // Add a slight blur that clears up as it comes into focus
              filter: `blur(${Math.max(0, 10 - (progress * 20))}px)`
            }}
          />
        </div>
        
      </div>
    </div>
  )
}
