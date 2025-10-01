// Image resize functionality using JavaScript
export function initializeImageResize() {
  console.log('Initializing image resize functionality')
  
  // Function to add resize handles to images
  function addResizeHandles() {
    const images = document.querySelectorAll('.image-resize-container img')
    console.log('Found images with resize container:', images.length)
    
    images.forEach((img: Element) => {
      const container = img.parentElement
      console.log('Processing image:', img, 'Container:', container)
      
      if (!container) {
        console.log('No container found for image')
        return
      }
      
      // Check if handles already exist
      if (container.querySelector('.resize-handle')) {
        console.log('Handles already exist for this image')
        return
      }
      
      console.log('Adding resize handles to image')
      
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
        handleEl.style.opacity = '1'
        handleEl.style.transition = 'opacity 0.2s ease'
        handleEl.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'
        
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
        
        container.appendChild(handleEl)
        console.log(`Added ${handle} handle`)
      })
      
      console.log('Successfully added all resize handles to image:', img)
    })
  }
  
  // Initial call
  addResizeHandles()
  
  // Watch for new images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const images = node.querySelectorAll('img')
            images.forEach((img) => {
              if (!img.classList.contains('image-resize-container')) {
                img.classList.add('image-resize-container')
                addResizeHandles()
              }
            })
          }
        })
      }
    })
  })
  
  observer.observe(document.body, { childList: true, subtree: true })
  
  return () => observer.disconnect()
}