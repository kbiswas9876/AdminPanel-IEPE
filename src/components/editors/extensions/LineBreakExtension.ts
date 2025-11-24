import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const LineBreakExtension = Extension.create({
  name: 'lineBreak',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('lineBreak'),
        props: {
          handleKeyDown: (view, event) => {
            // Handle Shift+Enter for line breaks
            if (event.key === 'Enter' && event.shiftKey) {
              event.preventDefault()
              const { state, dispatch } = view
              const { selection } = state
              const { from } = selection
              
              // Insert a line break
              const tr = state.tr.insertText('\n', from)
              dispatch(tr)
              return true
            }
            return false
          },
        },
      }),
    ]
  },


  addKeyboardShortcuts() {
    return {
      'Shift-Enter': () => {
        this.editor.commands.insertContent('<br>')
        return true
      },
    }
  },
})
