import Image from '@tiptap/extension-image'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImageComponent } from './ResizableImageComponent'

export const ResizableImageExtension = Image.extend({
  name: 'resizableImage',
  
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
      height: {
        default: null,
        renderHTML: (attributes) => ({
          height: attributes.height,
        }),
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
})
