export function prosemirrorToMarkdown(doc: Record<string, unknown>): string {
  if (!doc || typeof doc !== 'object') {
    return ''
  }
  
  function processNode(node: Record<string, unknown>): string {
    if (!node || typeof node !== 'object') return ''
    
    switch (node.type) {
      case 'doc':
        return (node.content as Record<string, unknown>[])?.map(processNode).join('') || ''
      case 'paragraph':
        return (node.content as Record<string, unknown>[])?.map(processNode).join('') + '\n\n'
      case 'heading':
        const level = (node.attrs as Record<string, unknown>)?.level as number
        return '#'.repeat(level) + ' ' + (node.content as Record<string, unknown>[])?.map(processNode).join('') + '\n\n'
      case 'text':
        let text = node.text as string || ''
        if (node.marks) {
          (node.marks as Record<string, unknown>[]).forEach(mark => {
            if (mark.type === 'bold') text = `**${text}**`
            if (mark.type === 'italic') text = `*${text}*`
            if (mark.type === 'code') text = `\`${text}\``
            if (mark.type === 'link') text = `[${text}](${(mark.attrs as Record<string, unknown>)?.href})`
          })
        }
        return text || ''
      case 'hardBreak':
        return '\n'
      case 'bulletList':
        return (node.content as Record<string, unknown>[])?.map(item => '- ' + processNode(item)).join('') + '\n'
      case 'orderedList':
        return (node.content as Record<string, unknown>[])?.map((item, index) => `${index + 1}. ` + processNode(item)).join('') + '\n'
      case 'listItem':
        return (node.content as Record<string, unknown>[])?.map(processNode).join('') + '\n'
      case 'blockquote':
        return '> ' + (node.content as Record<string, unknown>[])?.map(processNode).join('\n> ') + '\n\n'
      case 'codeBlock':
        const language = (node.attrs as Record<string, unknown>)?.language || ''
        return `\`\`\`${language}\n${node.text || ''}\n\`\`\`\n\n`
      case 'image':
        const src = (node.attrs as Record<string, unknown>)?.src || ''
        const alt = (node.attrs as Record<string, unknown>)?.alt || ''
        const title = (node.attrs as Record<string, unknown>)?.title || ''
        return `![${alt}](${src}${title ? ` "${title}"` : ''})\n\n`
      case 'mathInline':
        return `$${(node.attrs as Record<string, unknown>)?.math || ''}$`
      case 'mathBlock':
        return `$$\n${(node.attrs as Record<string, unknown>)?.math || ''}\n$$\n\n`
      default:
        return (node.content as Record<string, unknown>[])?.map(processNode).join('') || ''
    }
  }
  
  const result = processNode(doc).trim()
  return result || ''
}

export function markdownToProsemirror(markdown: string | null | undefined): Record<string, unknown> {
  // Handle null, undefined, or empty string gracefully
  if (!markdown || typeof markdown !== 'string' || markdown.trim() === '') {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
    }
  }
  
  const lines = markdown.split('\n')
  const nodes: Record<string, unknown>[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.trim() === '') {
      continue
    }

    // Handle block math
    if (line.startsWith('$$')) {
      let mathContent = ''
      let j = i + 1
      while (j < lines.length && !lines[j].startsWith('$$')) {
        mathContent += lines[j] + '\n'
        j++
      }
      if (lines[j] && lines[j].startsWith('$$')) {
        nodes.push({
          type: 'mathBlock',
          attrs: { math: mathContent.trim() }
        })
        i = j
        continue
      }
    }

    // Handle headings
    const headingMatch = line.match(/^(#+)\s(.+)$/)
    if (headingMatch) {
      nodes.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: parseInlineContent(headingMatch[2])
      })
      continue
    }

    // Handle blockquotes
    if (line.startsWith('> ')) {
      nodes.push({
        type: 'blockquote',
        content: [{ type: 'paragraph', content: parseInlineContent(line.substring(2)) }]
      })
      continue
    }

    // Handle code blocks
    if (line.startsWith('```')) {
      const langMatch = line.match(/^```(\w*)$/)
      const language = langMatch ? langMatch[1] : ''
      let codeContent = ''
      let j = i + 1
      while (j < lines.length && !lines[j].startsWith('```')) {
        codeContent += lines[j] + '\n'
        j++
      }
      if (lines[j] && lines[j].startsWith('```')) {
        nodes.push({
          type: 'codeBlock',
          attrs: { language },
          content: [{ type: 'text', text: codeContent.trim() }]
        })
        i = j
        continue
      }
    }

    // Default to paragraph for other content
    nodes.push({
      type: 'paragraph',
      content: parseInlineContent(line)
    })
  }

  return {
    type: 'doc',
    content: nodes.length > 0 ? nodes : [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
  }
}

function parseInlineContent(text: string): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = []
  let currentText = ''
  let i = 0
  
  while (i < text.length) {
    // Handle inline math
    if (text[i] === '$' && text[i + 1] && text[i + 1] !== ' ' && text[i + 1] !== '$') {
      const mathStart = i
      let mathEnd = -1
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '$' && text[j - 1] !== '\\') {
          mathEnd = j
          break
        }
      }

      if (mathEnd !== -1) {
        if (currentText) {
          nodes.push({ type: 'text', text: currentText })
          currentText = ''
        }
        const math = text.substring(mathStart + 1, mathEnd)
        nodes.push({ type: 'mathInline', attrs: { math } })
        i = mathEnd + 1
        continue
      }
    }

    // Handle bold
    if (text.substring(i, i + 2) === '**') {
      const boldStart = i
      let boldEnd = -1
      for (let j = i + 2; j < text.length; j++) {
        if (text.substring(j, j + 2) === '**' && text[j - 1] !== '\\') {
          boldEnd = j
          break
        }
      }
      if (boldEnd !== -1) {
        if (currentText) {
          nodes.push({ type: 'text', text: currentText })
          currentText = ''
        }
        const boldText = text.substring(boldStart + 2, boldEnd)
        nodes.push({ type: 'text', text: boldText, marks: [{ type: 'bold' }] })
        i = boldEnd + 2
        continue
      }
    }

    // Handle italic
    if (text[i] === '*' && text[i + 1] && text[i + 1] !== ' ' && text[i + 1] !== '*') {
      const italicStart = i
      let italicEnd = -1
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '*' && text[j - 1] !== '\\') {
          italicEnd = j
          break
        }
      }
      if (italicEnd !== -1) {
        if (currentText) {
          nodes.push({ type: 'text', text: currentText })
          currentText = ''
        }
        const italicText = text.substring(italicStart + 1, italicEnd)
        nodes.push({ type: 'text', text: italicText, marks: [{ type: 'italic' }] })
        i = italicEnd + 1
        continue
      }
    }

    // Handle code
    if (text[i] === '`' && text[i + 1] && text[i + 1] !== '`') {
      const codeStart = i
      let codeEnd = -1
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '`' && text[j - 1] !== '\\') {
          codeEnd = j
          break
        }
      }
      if (codeEnd !== -1) {
        if (currentText) {
          nodes.push({ type: 'text', text: currentText })
          currentText = ''
        }
        const codeText = text.substring(codeStart + 1, codeEnd)
        nodes.push({ type: 'text', text: codeText, marks: [{ type: 'code' }] })
        i = codeEnd + 1
        continue
      }
    }

    currentText += text[i]
    i++
  }

  if (currentText) {
    nodes.push({ type: 'text', text: currentText })
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text: '' }]
}