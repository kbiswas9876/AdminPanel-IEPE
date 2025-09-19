import DOMPurify from 'dompurify'

export function sanitizeHTML(html: string): string {
  // Configure DOMPurify with strict settings for security
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'a',
      'div', 'span',
      'sub', 'sup',
      'hr',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
      'class', 'id', 'style',
      'data-*', // Allow data attributes for math rendering
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,
    WHOLE_DOCUMENT: false,
  })

  return clean
}

export function sanitizeForDatabase(html: string): string {
  // Additional sanitization for database storage
  return sanitizeHTML(html)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

export function validateMathContent(html: string): boolean {
  // Validate that math content is properly formatted
  const mathRegex = /\$[^$]+\$|\$\$[^$]+\$\$/
  return mathRegex.test(html)
}
