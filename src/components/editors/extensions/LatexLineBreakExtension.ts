import { Extension } from '@tiptap/core'

export const LatexLineBreakExtension = Extension.create({
  name: 'latexLineBreak',

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-l': () => {
        this.editor.commands.insertContent('\\\\')
        return true
      },
    }
  },
})
