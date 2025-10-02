import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageNodeView } from './ImageNodeView'

export interface AdvancedImageOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    advancedImage: {
      /**
       * Insert an advanced image
       */
      setImage: (options: {
        src: string
        alt?: string
        title?: string
        width?: number
        height?: number
        alignment?: 'left' | 'center' | 'right'
        caption?: string
        float?: 'left' | 'right' | null
      }) => ReturnType
      /**
       * Set image alignment
       */
      setImageAlignment: (alignment: 'left' | 'center' | 'right') => ReturnType
      /**
       * Set image float
       */
      setImageFloat: (float: 'left' | 'right' | null) => ReturnType
    }
  }
}

export const AdvancedImage = Node.create<AdvancedImageOptions>({
  name: 'advancedImage',
  group: 'block',
  atom: true,
  draggable: true,
  priority: 1000, // Higher priority than basic Image extension

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => {
          if (!attributes.src) return {}
          return { src: attributes.src }
        },
      },
      alt: {
        default: '',
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => {
          if (!attributes.alt) return {}
          return { alt: attributes.alt }
        },
      },
      title: {
        default: '',
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) return {}
          return { title: attributes.title }
        },
      },
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('data-width')
          return width ? parseInt(width) : null
        },
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { 'data-width': attributes.width }
        },
      },
      height: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('data-height')
          return height ? parseInt(height) : null
        },
        renderHTML: attributes => {
          if (!attributes.height) return {}
          return { 'data-height': attributes.height }
        },
      },
      aspectRatio: {
        default: null,
        parseHTML: element => {
          const ratio = element.getAttribute('data-aspect-ratio')
          return ratio ? parseFloat(ratio) : null
        },
        renderHTML: attributes => {
          if (!attributes.aspectRatio) return {}
          return { 'data-aspect-ratio': attributes.aspectRatio }
        },
      },
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment') || 'center',
        renderHTML: attributes => {
          return { 'data-alignment': attributes.alignment || 'center' }
        },
      },
      caption: {
        default: '',
        parseHTML: element => element.getAttribute('data-caption') || '',
        renderHTML: attributes => {
          if (!attributes.caption) return {}
          return { 'data-caption': attributes.caption }
        },
      },
      float: {
        default: null,
        parseHTML: element => element.getAttribute('data-float'),
        renderHTML: attributes => {
          if (!attributes.float) return {}
          return { 'data-float': attributes.float }
        },
      },
      originalWidth: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('data-original-width')
          return width ? parseInt(width) : null
        },
        renderHTML: attributes => {
          if (!attributes.originalWidth) return {}
          return { 'data-original-width': attributes.originalWidth }
        },
      },
      originalHeight: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('data-original-height')
          return height ? parseInt(height) : null
        },
        renderHTML: attributes => {
          if (!attributes.originalHeight) return {}
          return { 'data-original-height': attributes.originalHeight }
        },
      },
    }
  },

  parseHTML() {
    return [
      // Parse wrapped images (our format)
      {
        tag: 'div[data-image-wrapper]',
        getAttrs: dom => {
          const element = dom as HTMLElement
          const img = element.querySelector('img')
          if (!img) return false
          
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || '',
            title: img.getAttribute('title') || '',
            width: img.getAttribute('data-width') ? parseInt(img.getAttribute('data-width')!) : null,
            height: img.getAttribute('data-height') ? parseInt(img.getAttribute('data-height')!) : null,
            alignment: img.getAttribute('data-alignment') || element.getAttribute('data-alignment') || 'center',
            caption: img.getAttribute('data-caption') || element.getAttribute('data-caption') || '',
            float: img.getAttribute('data-float') || element.getAttribute('data-float'),
            aspectRatio: img.getAttribute('data-aspect-ratio') ? parseFloat(img.getAttribute('data-aspect-ratio')!) : null,
            originalWidth: img.getAttribute('data-original-width') ? parseInt(img.getAttribute('data-original-width')!) : null,
            originalHeight: img.getAttribute('data-original-height') ? parseInt(img.getAttribute('data-original-height')!) : null,
          }
        },
      },
      // Parse direct img tags (fallback)
      {
        tag: 'img[src]',
        getAttrs: dom => {
          const element = dom as HTMLElement
          // Skip if this img is already inside a wrapper div
          if (element.closest('[data-image-wrapper]')) return false
          
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt') || '',
            title: element.getAttribute('title') || '',
            width: element.getAttribute('data-width') ? parseInt(element.getAttribute('data-width')!) : 
                   element.getAttribute('width') ? parseInt(element.getAttribute('width')!) : null,
            height: element.getAttribute('data-height') ? parseInt(element.getAttribute('data-height')!) : 
                    element.getAttribute('height') ? parseInt(element.getAttribute('height')!) : null,
            alignment: element.getAttribute('data-alignment') || 'center',
            caption: element.getAttribute('data-caption') || '',
            float: element.getAttribute('data-float'),
            aspectRatio: element.getAttribute('data-aspect-ratio') ? parseFloat(element.getAttribute('data-aspect-ratio')!) : null,
            originalWidth: element.getAttribute('data-original-width') ? parseInt(element.getAttribute('data-original-width')!) : null,
            originalHeight: element.getAttribute('data-original-height') ? parseInt(element.getAttribute('data-original-height')!) : null,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment = 'center', float, caption, ...imgAttrs } = HTMLAttributes
    
    // Always wrap in a div for consistent alignment control
    let wrapperStyle = 'display: block; margin: 1rem 0;'
    let imageStyle = 'max-width: 100%; height: auto; border-radius: 8px; display: block;'
    
    // Apply alignment styles
    if (float) {
      // Floating images
      wrapperStyle += ` float: ${float}; margin: ${float === 'left' ? '0 16px 16px 0' : '0 0 16px 16px'}; max-width: 50%; text-align: ${float};`
      imageStyle += ' width: 100%;'
    } else {
      // Non-floating images - use text-align on wrapper
      wrapperStyle += ` text-align: ${alignment};`
      
      // For left/right alignment without float, also set margin
      if (alignment === 'left') {
        imageStyle += ' margin-left: 0; margin-right: auto;'
      } else if (alignment === 'right') {
        imageStyle += ' margin-left: auto; margin-right: 0;'
      } else {
        imageStyle += ' margin-left: auto; margin-right: auto;'
      }
    }
    
    // Create image element with all necessary attributes
    const imgElement = ['img', mergeAttributes(this.options.HTMLAttributes, {
      ...imgAttrs,
      'data-alignment': alignment,
      'data-float': float || null,
      'data-caption': caption || null,
      style: imageStyle,
    })]
    
    // Create wrapper div
    const wrapperElement = [
      'div',
      { 
        'data-image-wrapper': 'true',
        'data-alignment': alignment,
        'data-float': float || null,
        style: wrapperStyle
      },
      imgElement
    ]
    
    // Add caption if present
    if (caption) {
      wrapperElement.push([
        'div', 
        { 
          class: 'image-caption',
          style: 'margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit; clear: both;' 
        }, 
        caption
      ])
    }
    
    return wrapperElement
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView, {
      className: 'advanced-image-wrapper',
    })
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
      setImageAlignment:
        alignment =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { alignment })
        },
      setImageFloat:
        float =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { float })
        },
    }
  },
})

export default AdvancedImage
