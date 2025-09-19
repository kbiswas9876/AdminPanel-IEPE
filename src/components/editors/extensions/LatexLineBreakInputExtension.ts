import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface LatexLineBreakInputOptions {
  // Configuration options if needed
  enabled?: boolean
}

export const LatexLineBreakInputExtension = Extension.create<LatexLineBreakInputOptions>({
  name: 'latexLineBreakInput',

  addOptions() {
    return {
      // Default options
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('latexLineBreakInput'),
        props: {
          handleTextInput: (view, from, to, text) => {
            // Check if user typed double backslash
            if (text === '\\') {
              const { state, dispatch } = view
              const { selection } = state
              const { $from } = selection

              // Get the current line text
              const currentLine = $from.parent.textContent
              const beforeCursor = currentLine.substring(0, $from.parentOffset)

              // Check if we already have one backslash before the cursor
              if (beforeCursor.endsWith('\\')) {
                // User typed second backslash, replace with line break
                const tr = state.tr
                // Remove the first backslash and the current one, insert line break
                tr.delete(from - 1, from + 1)
                tr.insert(from - 1, state.schema.nodes.hardBreak.create())
                dispatch(tr)
                return true
              }
            }
            return false
          },
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      // Alternative: Ctrl+Enter for LaTeX-style line breaks
      'Mod-Enter': () => {
        this.editor.commands.setHardBreak()
        return true
      },
    }
  },
})
