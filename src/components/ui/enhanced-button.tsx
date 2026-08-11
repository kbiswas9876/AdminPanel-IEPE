'use client'

import React, { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2, Check, X, AlertTriangle } from 'lucide-react'

interface EnhancedButtonProps extends React.ComponentProps<"button"> {
  loading?: boolean
  success?: boolean
  error?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ripple?: boolean
  hover?: 'scale' | 'glow' | 'lift'
  animation?: 'bounce' | 'pulse' | 'shake'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning'
}

export function EnhancedButton({
  children,
  loading = false,
  success = false,
  error = false,
  icon,
  iconPosition = 'left',
  ripple = true,
  hover = 'scale',
  animation,
  variant = 'default',
  className,
  onClick,
  disabled,
  ...props
}: EnhancedButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newRipple = {
        id: Date.now(),
        x,
        y
      }
      
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)
    }

    if (onClick && !loading && !disabled) {
      onClick(e)
    }
  }

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (success) return <Check className="h-4 w-4" />
    if (error) return <X className="h-4 w-4" />
    return icon
  }

  const getHoverClass = () => {
    switch (hover) {
      case 'scale':
        return 'hover:scale-105'
      case 'glow':
        return 'hover:shadow-lg hover:shadow-blue-500/25'
      case 'lift':
        return 'hover:-translate-y-0.5 hover:shadow-md'
      default:
        return ''
    }
  }

  const getAnimationClass = () => {
    switch (animation) {
      case 'bounce':
        return 'animate-bounce'
      case 'pulse':
        return 'animate-pulse'
      case 'shake':
        return 'animate-shake'
      default:
        return ''
    }
  }

  const getVariantClass = () => {
    if (success) {
      return 'bg-green-600 hover:bg-green-700 text-white'
    }
    if (error) {
      return 'bg-red-600 hover:bg-red-700 text-white'
    }
    if (variant === 'success') {
      return 'bg-green-600 hover:bg-green-700 text-white'
    }
    if (variant === 'warning') {
      return 'bg-yellow-600 hover:bg-yellow-700 text-white'
    }
    return ''
  }

  return (
    <Button
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        getHoverClass(),
        getAnimationClass(),
        getVariantClass(),
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effect */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}

      {/* Content */}
      <span className="flex items-center gap-2">
        {getStatusIcon() && iconPosition === 'left' && (
          <span className="flex-shrink-0">
            {getStatusIcon()}
          </span>
        )}
        
        {children && (
          <span className={cn(loading && 'opacity-70')}>
            {children}
          </span>
        )}
        
        {getStatusIcon() && iconPosition === 'right' && (
          <span className="flex-shrink-0">
            {getStatusIcon()}
          </span>
        )}
      </span>
    </Button>
  )
}

// Specialized button variants
export function LoadingButton(props: Omit<EnhancedButtonProps, 'loading'>) {
  return <EnhancedButton {...props} loading />
}

export function SuccessButton(props: Omit<EnhancedButtonProps, 'success'>) {
  return <EnhancedButton {...props} success />
}

export function ErrorButton(props: Omit<EnhancedButtonProps, 'error'>) {
  return <EnhancedButton {...props} error />
}

export function IconButton({ 
  icon, 
  children, 
  ...props 
}: EnhancedButtonProps & { icon: React.ReactNode }) {
  return (
    <EnhancedButton
      {...props}
      icon={icon}
      iconPosition="left"
      className={cn('gap-2', props.className)}
    >
      {children}
    </EnhancedButton>
  )
}

export function FloatingActionButton({ 
  children, 
  ...props 
}: EnhancedButtonProps) {
  return (
    <EnhancedButton
      {...props}
      className={cn(
        'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg',
        'hover:scale-110 hover:shadow-xl',
        'transition-all duration-300',
        props.className
      )}
    >
      {children}
    </EnhancedButton>
  )
}

export function ToggleButton({ 
  pressed, 
  onPressedChange, 
  children, 
  ...props 
}: EnhancedButtonProps & { 
  pressed: boolean
  onPressedChange: (pressed: boolean) => void 
}) {
  return (
    <EnhancedButton
      {...props}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        pressed && 'bg-blue-600 text-white',
        props.className
      )}
    >
      {children}
    </EnhancedButton>
  )
}
