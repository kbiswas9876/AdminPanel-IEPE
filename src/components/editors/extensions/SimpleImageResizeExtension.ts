import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface SimpleImageResizeOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

export const SimpleImageResizeExtension = Extension.create<SimpleImageResizeOptions>({
  name: 'simpleImageResize',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      style: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('simpleImageResize'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []
            const { doc, selection } = state

            doc.descendants((node, pos) => {
              if (node.type.name === 'image') {
                const decoration = Decoration.node(
                  pos,
                  pos + node.nodeSize,
                  {
                    class: 'image-resize-container',
                    'data-image-pos': pos.toString()
                  }
                )
                decorations.push(decoration)
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
