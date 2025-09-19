'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface MathSymbolPaletteProps {
  onInsert: (formula: string) => void
}

export function MathSymbolPalette({ onInsert }: MathSymbolPaletteProps) {
  const mathSymbols = [
    // Basic Operations
    { symbol: '+', formula: '+' },
    { symbol: '−', formula: '-' },
    { symbol: '×', formula: '\\times' },
    { symbol: '÷', formula: '\\div' },
    { symbol: '±', formula: '\\pm' },
    { symbol: '∓', formula: '\\mp' },
    
    // Fractions and Roots
    { symbol: '√', formula: '\\sqrt{x}' },
    { symbol: '∛', formula: '\\sqrt[3]{x}' },
    { symbol: 'ⁿ√', formula: '\\sqrt[n]{x}' },
    { symbol: '½', formula: '\\frac{1}{2}' },
    { symbol: '⅓', formula: '\\frac{1}{3}' },
    { symbol: '¼', formula: '\\frac{1}{4}' },
    
    // Powers and Subscripts
    { symbol: 'x²', formula: 'x^2' },
    { symbol: 'x³', formula: 'x^3' },
    { symbol: 'xⁿ', formula: 'x^n' },
    { symbol: 'x₁', formula: 'x_1' },
    { symbol: 'x₂', formula: 'x_2' },
    { symbol: 'xₙ', formula: 'x_n' },
    
    // Greek Letters
    { symbol: 'α', formula: '\\alpha' },
    { symbol: 'β', formula: '\\beta' },
    { symbol: 'γ', formula: '\\gamma' },
    { symbol: 'δ', formula: '\\delta' },
    { symbol: 'ε', formula: '\\epsilon' },
    { symbol: 'θ', formula: '\\theta' },
    { symbol: 'λ', formula: '\\lambda' },
    { symbol: 'μ', formula: '\\mu' },
    { symbol: 'π', formula: '\\pi' },
    { symbol: 'σ', formula: '\\sigma' },
    { symbol: 'τ', formula: '\\tau' },
    { symbol: 'φ', formula: '\\phi' },
    { symbol: 'χ', formula: '\\chi' },
    { symbol: 'ψ', formula: '\\psi' },
    { symbol: 'ω', formula: '\\omega' },
    
    // Capital Greek Letters
    { symbol: 'Γ', formula: '\\Gamma' },
    { symbol: 'Δ', formula: '\\Delta' },
    { symbol: 'Θ', formula: '\\Theta' },
    { symbol: 'Λ', formula: '\\Lambda' },
    { symbol: 'Π', formula: '\\Pi' },
    { symbol: 'Σ', formula: '\\Sigma' },
    { symbol: 'Φ', formula: '\\Phi' },
    { symbol: 'Ψ', formula: '\\Psi' },
    { symbol: 'Ω', formula: '\\Omega' },
    
    // Relations
    { symbol: '=', formula: '=' },
    { symbol: '≠', formula: '\\neq' },
    { symbol: '<', formula: '<' },
    { symbol: '>', formula: '>' },
    { symbol: '≤', formula: '\\leq' },
    { symbol: '≥', formula: '\\geq' },
    { symbol: '≈', formula: '\\approx' },
    { symbol: '≡', formula: '\\equiv' },
    { symbol: '∝', formula: '\\propto' },
    { symbol: '∞', formula: '\\infty' },
    
    // Set Theory
    { symbol: '∈', formula: '\\in' },
    { symbol: '∉', formula: '\\notin' },
    { symbol: '⊂', formula: '\\subset' },
    { symbol: '⊃', formula: '\\supset' },
    { symbol: '⊆', formula: '\\subseteq' },
    { symbol: '⊇', formula: '\\supseteq' },
    { symbol: '∪', formula: '\\cup' },
    { symbol: '∩', formula: '\\cap' },
    { symbol: '∅', formula: '\\emptyset' },
    
    // Arrows
    { symbol: '→', formula: '\\rightarrow' },
    { symbol: '←', formula: '\\leftarrow' },
    { symbol: '↔', formula: '\\leftrightarrow' },
    { symbol: '⇒', formula: '\\Rightarrow' },
    { symbol: '⇐', formula: '\\Leftarrow' },
    { symbol: '⇔', formula: '\\Leftrightarrow' },
    
    // Calculus
    { symbol: '∫', formula: '\\int' },
    { symbol: '∬', formula: '\\iint' },
    { symbol: '∭', formula: '\\iiint' },
    { symbol: '∂', formula: '\\partial' },
    { symbol: '∇', formula: '\\nabla' },
    { symbol: '∑', formula: '\\sum' },
    { symbol: '∏', formula: '\\prod' },
    { symbol: 'lim', formula: '\\lim' },
    
    // Trigonometry
    { symbol: 'sin', formula: '\\sin' },
    { symbol: 'cos', formula: '\\cos' },
    { symbol: 'tan', formula: '\\tan' },
    { symbol: 'cot', formula: '\\cot' },
    { symbol: 'sec', formula: '\\sec' },
    { symbol: 'csc', formula: '\\csc' },
    
    // Logic
    { symbol: '∧', formula: '\\land' },
    { symbol: '∨', formula: '\\lor' },
    { symbol: '¬', formula: '\\neg' },
    { symbol: '∀', formula: '\\forall' },
    { symbol: '∃', formula: '\\exists' },
    
    // Geometry
    { symbol: '∠', formula: '\\angle' },
    { symbol: '△', formula: '\\triangle' },
    { symbol: '□', formula: '\\square' },
    { symbol: '○', formula: '\\circ' },
    { symbol: '⊥', formula: '\\perp' },
    { symbol: '∥', formula: '\\parallel' },
  ]

  return (
    <div className="p-4 max-w-md">
      <h3 className="font-semibold mb-3">Math Symbols</h3>
      <div className="grid grid-cols-8 gap-1">
        {mathSymbols.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => onInsert(item.formula)}
            className="h-8 w-8 p-0 text-xs"
            title={item.formula}
          >
            {item.symbol}
          </Button>
        ))}
      </div>
    </div>
  )
}
