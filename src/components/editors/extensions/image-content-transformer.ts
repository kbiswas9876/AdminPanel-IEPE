/**
 * Utility functions to transform existing HTML content to work with AdvancedImage extension
 */

export function transformImageContent(htmlContent: string): string {
  if (!htmlContent) return htmlContent

  // Create a temporary DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  // Find all img tags that are not already processed
  const images = doc.querySelectorAll('img')
  
  images.forEach(img => {
    // Extract attributes
    const src = img.getAttribute('src')
    const alt = img.getAttribute('alt') || ''
    const title = img.getAttribute('title') || ''
    const width = img.getAttribute('width') || img.getAttribute('data-width')
    const height = img.getAttribute('height') || img.getAttribute('data-height')
    const alignment = img.getAttribute('data-alignment') || 'center'
    const caption = img.getAttribute('data-caption') || ''
    const float = img.getAttribute('data-float')
    
    // Set data attributes for our extension
    if (width) img.setAttribute('data-width', width)
    if (height) img.setAttribute('data-height', height)
    img.setAttribute('data-alignment', alignment)
    if (caption) img.setAttribute('data-caption', caption)
    if (float) img.setAttribute('data-float', float)
    
    // Add class for styling
    const existingClasses = img.getAttribute('class') || ''
    if (!existingClasses.includes('editor-image')) {
      img.setAttribute('class', `${existingClasses} editor-image rounded-lg shadow-sm max-w-full h-auto`.trim())
    }
    
    // Ensure proper styling
    let style = img.getAttribute('style') || ''
    if (!style.includes('max-width')) {
      style += 'max-width: 100%; height: auto; border-radius: 8px;'
      img.setAttribute('style', style)
    }
  })
  
  return doc.body.innerHTML
}

export function ensureAdvancedImageNodes(editor: any) {
  if (!editor) return
  
  // Get current content
  const currentContent = editor.getHTML()
  
  // Transform the content
  const transformedContent = transformImageContent(currentContent)
  
  // Only update if content changed
  if (transformedContent !== currentContent) {
    editor.commands.setContent(transformedContent)
  }
}

export function convertLegacyImages(htmlContent: string): string {
  return transformImageContent(htmlContent)
}
