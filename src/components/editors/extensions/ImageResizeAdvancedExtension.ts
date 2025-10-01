import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface ImageResizeAdvancedOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

export const ImageResizeAdvancedExtension = Extension.create<ImageResizeAdvancedOptions>({
  name: 'imageResizeAdvanced',

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
        key: new PluginKey('imageResizeAdvanced'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []
            const { doc, selection } = state

            doc.descendants((node, pos) => {
              if (node.type.name === 'image') {
                const decoration = Decoration.widget(
                  pos + 1,
                  () => {
                    const container = document.createElement('div')
                    container.className = 'image-resize-container'
                    container.style.position = 'relative'
                    container.style.display = 'inline-block'
                    container.style.cursor = 'pointer'
                    container.style.border = '2px dashed transparent'
                    container.style.borderRadius = '4px'
                    container.style.transition = 'border-color 0.2s'
                    
                    // Add hover effect
                    container.addEventListener('mouseenter', () => {
                      container.style.borderColor = '#007bff'
                    })
                    
                    container.addEventListener('mouseleave', () => {
                      container.style.borderColor = 'transparent'
                    })
                    
                    // Add resize handles
                    const handles = ['nw', 'ne', 'sw', 'se']
                    handles.forEach(handle => {
                      const handleEl = document.createElement('div')
                      handleEl.className = `resize-handle resize-handle-${handle}`
                      handleEl.style.position = 'absolute'
                      handleEl.style.width = '12px'
                      handleEl.style.height = '12px'
                      handleEl.style.backgroundColor = '#007bff'
                      handleEl.style.border = '2px solid #fff'
                      handleEl.style.borderRadius = '50%'
                      handleEl.style.cursor = `${handle}-resize`
                      handleEl.style.zIndex = '1000'
                      handleEl.style.opacity = '0'
                      handleEl.style.transition = 'opacity 0.2s'
                      handleEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
                      
                      // Position handles
                      switch (handle) {
                        case 'nw':
                          handleEl.style.top = '-6px'
                          handleEl.style.left = '-6px'
                          break
                        case 'ne':
                          handleEl.style.top = '-6px'
                          handleEl.style.right = '-6px'
                          break
                        case 'sw':
                          handleEl.style.bottom = '-6px'
                          handleEl.style.left = '-6px'
                          break
                        case 'se':
                          handleEl.style.bottom = '-6px'
                          handleEl.style.right = '-6px'
                          break
                      }
                      
                      // Show handles on hover
                      container.addEventListener('mouseenter', () => {
                        handleEl.style.opacity = '1'
                      })
                      
                      container.addEventListener('mouseleave', () => {
                        handleEl.style.opacity = '0'
                      })
                      
                      // Add resize functionality
                      let isResizing = false
                      let startX = 0
                      let startY = 0
                      let startWidth = 0
                      let startHeight = 0
                      
                      handleEl.addEventListener('mousedown', (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        
                        isResizing = true
                        startX = e.clientX
                        startY = e.clientY
                        
                        const img = container.querySelector('img')
                        if (img) {
                          startWidth = img.offsetWidth
                          startHeight = img.offsetHeight
                        }
                        
                        document.addEventListener('mousemove', handleResize)
                        document.addEventListener('mouseup', stopResize)
                      })
                      
                      const handleResize = (e: MouseEvent) => {
                        if (!isResizing) return
                        
                        const deltaX = e.clientX - startX
                        const deltaY = e.clientY - startY
                        
                        const img = container.querySelector('img')
                        if (img) {
                          let newWidth = startWidth
                          let newHeight = startHeight
                          
                          switch (handle) {
                            case 'se':
                              newWidth = startWidth + deltaX
                              newHeight = startHeight + deltaY
                              break
                            case 'sw':
                              newWidth = startWidth - deltaX
                              newHeight = startHeight + deltaY
                              break
                            case 'ne':
                              newWidth = startWidth + deltaX
                              newHeight = startHeight - deltaY
                              break
                            case 'nw':
                              newWidth = startWidth - deltaX
                              newHeight = startHeight - deltaY
                              break
                          }
                          
                          // Maintain aspect ratio
                          const aspectRatio = startWidth / startHeight
                          if (Math.abs(deltaX) > Math.abs(deltaY)) {
                            newHeight = newWidth / aspectRatio
                          } else {
                            newWidth = newHeight * aspectRatio
                          }
                          
                          // Set minimum size
                          newWidth = Math.max(50, newWidth)
                          newHeight = Math.max(50, newHeight)
                          
                          img.style.width = `${newWidth}px`
                          img.style.height = `${newHeight}px`
                          img.style.maxWidth = '100%'
                          img.style.height = 'auto'
                        }
                      }
                      
                      const stopResize = () => {
                        isResizing = false
                        document.removeEventListener('mousemove', handleResize)
                        document.removeEventListener('mouseup', stopResize)
                      }
                      
                      container.appendChild(handleEl)
                    })
                    
                    return container
                  },
                  {
                    side: 1,
                    ignoreSelection: true,
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
