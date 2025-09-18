'use client'

import { Extension } from '@tiptap/core'
import { InputRule } from '@tiptap/core'

// Bold input rule
const boldInputRule = new InputRule({
  find: /\*\*([^*]+)\*\*/g,
  handler: ({ state, range, match }) => {
    const { tr } = state
    const start = range.from
    const end = range.to
    const text = match[1]

    tr.delete(start, end)
    tr.insert(start, state.schema.text(text, [state.schema.marks.bold.create()]))
  },
})

// Italic input rule
const italicInputRule = new InputRule({
  find: /\*([^*]+)\*/g,
  handler: ({ state, range, match }) => {
    const { tr } = state
    const start = range.from
    const end = range.to
    const text = match[1]

    tr.delete(start, end)
    tr.insert(start, state.schema.text(text, [state.schema.marks.italic.create()]))
  },
})

// Code input rule
const codeInputRule = new InputRule({
  find: /`([^`]+)`/g,
  handler: ({ state, range, match }) => {
    const { tr } = state
    const start = range.from
    const end = range.to
    const text = match[1]

    tr.delete(start, end)
    tr.insert(start, state.schema.text(text, [state.schema.marks.code.create()]))
  },
})

// Link input rule
const linkInputRule = new InputRule({
  find: /\[([^\]]+)\]\(([^)]+)\)/g,
  handler: ({ state, range, match }) => {
    const { tr } = state
    const start = range.from
    const end = range.to
    const text = match[1]
    const href = match[2]

    tr.delete(start, end)
    tr.insert(start, state.schema.text(text, [state.schema.marks.link.create({ href })]))
  },
})

// Math inline input rule
const mathInlineInputRule = new InputRule({
  find: /\$([^$]+)\$/g,
  handler: ({ state, range, match }) => {
    const { tr } = state
    const start = range.from
    const end = range.to
    const math = match[1]

    tr.delete(start, end)
    tr.insert(start, state.schema.nodes.mathInline.create({ math }))
  },
})

// Math block input rule
const mathBlockInputRule = new InputRule({
  find: /\$\$([\s\S]+?)\$\$/g,
  handler: ({ state, range, match }) => {
    const { tr } = state
    const start = range.from
    const end = range.to
    const math = match[1]

    tr.delete(start, end)
    tr.insert(start, state.schema.nodes.mathBlock.create({ math }))
  },
})

// Main extension
export const MarkdownInputRules = Extension.create({
  name: 'markdownInputRules',

  addInputRules() {
    return [
      // Text formatting
      boldInputRule,
      italicInputRule,
      codeInputRule,
      linkInputRule,
      
      // Math
      mathInlineInputRule,
      mathBlockInputRule,
    ]
  },
})