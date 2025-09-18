'use client'

import React from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { InlineMath } from 'react-katex'
import { sanitizeLatexForRendering } from '@/lib/utils/latex-sanitization'
import type { ReactNodeViewProps } from '@tiptap/react'

export interface MathInlineOptions {
  HTMLAttributes: Record<string, string>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathInline: {
      setMathInline: (attributes: { math: string }) => ReturnType
    }
  }
}

export const MathInline = Node.create<MathInlineOptions>({
  name: 'mathInline',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'inline',

  content: 'text*',

  marks: '',

  inline: true,

  atom: false,

  addAttributes() {
    return {
      math: {
        default: '',
        parseHTML: element => element.getAttribute('data-math'),
        renderHTML: attributes => {
          if (!attributes.math) {
            return {}
          }
          return {
            'data-math': attributes.math,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-math]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineComponent)
  },

  addCommands() {
    return {
      setMathInline:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
    }
  },

  addInputRules() {
    return [
      {
        find: /\$([^$]+)\$/g,
        handler: ({ state, range, match }) => {
          const math = match[1]
          if (!math.trim()) return

          const { tr } = state
          const start = range.from
          const end = range.to

          tr.delete(start, end)
          tr.insert(start, state.schema.nodes.mathInline.create({
            math: math.trim()
          }))
        },
      },
    ]
  },
})

function MathInlineComponent(props: ReactNodeViewProps) {
  const { node, updateAttributes, selected } = props
  const math = node.attrs.math as string
  const sanitizedMath = sanitizeLatexForRendering(math) || math
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(math)

  React.useEffect(() => {
    setEditValue(math)
  }, [math])

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue !== math) {
      updateAttributes({ math: editValue })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      setIsEditing(false)
      if (editValue !== math) {
        updateAttributes({ math: editValue })
      }
    }
  }

  if (isEditing) {
    return (
      <NodeViewWrapper as="span" className="inline-math-wrapper">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="inline-math-edit"
          style={{
            display: 'inline',
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            padding: '2px 4px',
            fontSize: 'inherit',
            fontFamily: 'monospace',
            backgroundColor: '#f8fafc',
            minWidth: '100px'
          }}
          autoFocus
        />
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper as="span" className="inline-math-wrapper">
      <span 
        className="inline-math" 
        style={{ 
          display: 'inline', 
          verticalAlign: 'baseline',
          cursor: 'pointer',
          border: selected ? '1px solid #3b82f6' : '1px solid transparent',
          borderRadius: '4px',
          padding: '1px 2px'
        }}
        onDoubleClick={handleDoubleClick}
        title="Double-click to edit LaTeX"
      >
        <InlineMath math={sanitizedMath} errorColor="#cc0000" />
      </span>
    </NodeViewWrapper>
  )
}
