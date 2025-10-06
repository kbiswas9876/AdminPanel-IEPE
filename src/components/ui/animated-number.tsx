'use client'

import { useSpring, animated } from '@react-spring/web'
import { useEffect, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  className?: string
  decimals?: number
}

export function AnimatedNumber({ value, className = '', decimals = 0 }: AnimatedNumberProps) {
  const [prevValue, setPrevValue] = useState(value)
  
  useEffect(() => {
    setPrevValue(value)
  }, [value])

  const { number } = useSpring({
    from: { number: prevValue },
    number: value,
    delay: 100,
    config: { mass: 1, tension: 20, friction: 10 }
  })

  return (
    <animated.span className={className}>
      {number.to(n => n.toFixed(decimals))}
    </animated.span>
  )
}

