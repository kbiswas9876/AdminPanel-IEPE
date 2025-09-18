'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { BlockMath } from 'react-katex'
import { sanitizeLatexForRendering } from '@/lib/utils/latex-sanitization'
import type { ReactNodeViewProps } from '@tiptap/react'

export interface MathBlockOptions {
  HTMLAttributes: Record<string, string>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (attributes: { math: string }) => ReturnType
    }
  }
}

export const MathBlock = Node.create<MathBlockOptions>({
  name: 'mathBlock',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block math',

  content: '',

  marks: '',

  inline: false,

  atom: true,

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
        tag: 'div[data-math-block]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockComponent)
  },

  addCommands() {
    return {
      setMathBlock:
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
        find: /\$\$([\s\S]+?)\$\$/g,
        handler: ({ state, range, match }) => {
          const math = match[1]
          if (!math.trim()) return

          const { tr } = state
          const start = range.from
          const end = range.to

          tr.delete(start, end)
          tr.insert(start, state.schema.nodes.mathBlock.create({
            math: math.trim()
          }))
        },
      },
    ]
  },
})

function MathBlockComponent(props: ReactNodeViewProps) {
  const { node } = props
  const math = node.attrs.math as string
  const sanitizedMath = sanitizeLatexForRendering(math) || math

  return (
    <NodeViewWrapper>
      <div className="block-math my-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <BlockMath math={sanitizedMath} errorColor="#cc0000" />
      </div>
    </NodeViewWrapper>
  )
}
