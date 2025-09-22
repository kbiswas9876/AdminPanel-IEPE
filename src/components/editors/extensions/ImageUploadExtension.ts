import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
// Removed unused Decoration imports

export interface ImageUploadOptions {
  uploadHandler: (file: File) => Promise<string>
  maxFileSize?: number
  allowedFileTypes?: string[]
}

export const ImageUploadExtension = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      uploadHandler: async () => '',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          handleDrop: (view, event, _slice, moved) => {
            if (!moved && event.dataTransfer && event.dataTransfer.files) {
              const files = Array.from(event.dataTransfer.files)
              const imageFiles = files.filter(file => 
                file.type.startsWith('image/') && 
                this.options.allowedFileTypes?.includes(file.type)
              )
              
              if (imageFiles.length > 0) {
                event.preventDefault()
                // Handle image uploads
                imageFiles.forEach(file => {
                  this.options.uploadHandler(file)
                    .then(url => {
                      const { tr } = view.state
                      const pos = view.state.selection.from
                      tr.insert(pos, view.state.schema.nodes.image.create({ src: url }))
                      view.dispatch(tr)
                    })
                    .catch(error => {
                      console.error('Upload failed:', error)
                    })
                })
                return true
              }
            }
            return false
          },
          handlePaste: (view, event, _slice) => {
            const items = Array.from(event.clipboardData?.items || [])
            const imageItems = items.filter(item => 
              item.type.startsWith('image/') && 
              this.options.allowedFileTypes?.includes(item.type)
            )
            
            if (imageItems.length > 0) {
              event.preventDefault()
              const files = imageItems
                .map(item => item.getAsFile())
                .filter(Boolean) as File[]
              // Handle image uploads
              files.forEach(file => {
                this.options.uploadHandler(file)
                  .then(url => {
                    const { tr } = view.state
                    const pos = view.state.selection.from
                    tr.insert(pos, view.state.schema.nodes.image.create({ src: url }))
                    view.dispatch(tr)
                  })
                  .catch(error => {
                    console.error('Upload failed:', error)
                  })
              })
              return true
            }
            return false
          },
        },
      }),
    ]
  },

})
