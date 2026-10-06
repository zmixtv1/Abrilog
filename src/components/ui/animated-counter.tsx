'use client'

import { useEffect, useState, useRef } from 'react'
import { formatNumber } from '@/lib/utils/format'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1100,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const startVal = 0
    const endVal = value

    // Valor zero nao precisa de animacao: a atualizacao e agendada em um frame
    // para nao disparar render em cascata dentro do efeito.
    if (endVal === 0) {
      frameRef.current = requestAnimationFrame(() => setDisplayValue(0))
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
      }
    }

    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3)
    }

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.round(startVal + (endVal - startVal) * easeOutCubic(progress))

      setDisplayValue(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      } else {
        setDisplayValue(endVal)
      }
    }

    startTimeRef.current = null
    frameRef.current = requestAnimationFrame(step)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  )
}
