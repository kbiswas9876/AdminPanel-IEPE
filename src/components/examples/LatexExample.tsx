'use client'

import React from 'react'
import { LatexRenderer } from '@/lib/utils/latex-renderer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LatexExample() {
  const examples = [
    {
      title: "Question with Inline Math",
      content: "What is the value of $x$ in the equation $2x + 5 = 13$?"
    },
    {
      title: "Question with Block Math",
      content: "Solve the quadratic equation: $$x^2 - 4x + 3 = 0$$"
    },
    {
      title: "Mixed Content",
      content: "Find the derivative of $f(x) = x^2 + 3x - 1$. The solution is: $$f'(x) = 2x + 3$$"
    },
    {
      title: "Complex Math",
      content: "Evaluate: $$\\int_0^1 x^2 dx = \\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{3}$$"
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">LaTeX Rendering Examples</h2>
      {examples.map((example, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{example.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <LatexRenderer text={example.content} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
