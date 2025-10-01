import React, { useState, useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'

interface ResizableImageComponentProps {
  node: {
    attrs: {
      src: string
      alt?: string
      title?: string
      width?: string
      height?: string
    }
  }
  updateAttributes: (attrs: any) => void
  selected: boolean
}

export const ResizableImageComponent: React.FC<ResizableImageComponentProps> = ({
  node,
  updateAttributes,
  selected
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const { src, alt, title, width, height } = node.attrs

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setResizeHandle(handle)
    setStartPos({ x: e.clientX, y: e.clientY })
    
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      setStartSize({ width: rect.width, height: rect.height })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeHandle || !imageRef.current) return

    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y

    let newWidth = startSize.width
    let newHeight = startSize.height

    switch (resizeHandle) {
      case 'se':
        newWidth = Math.max(50, startSize.width + deltaX)
        newHeight = Math.max(50, startSize.height + deltaY)
        break
      case 'sw':
        newWidth = Math.max(50, startSize.width - deltaX)
        newHeight = Math.max(50, startSize.height + deltaY)
        break
      case 'ne':
        newWidth = Math.max(50, startSize.width + deltaX)
        newHeight = Math.max(50, startSize.height - deltaY)
        break
      case 'nw':
        newWidth = Math.max(50, startSize.width - deltaX)
        newHeight = Math.max(50, startSize.height - deltaY)
        break
    }

    updateAttributes({
      width: `${newWidth}px`,
      height: `${newHeight}px`
    })
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    setResizeHandle(null)
  }

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeHandle, startPos, startSize])

  return (
    <NodeViewWrapper
      as="div"
      className={`resizable-image-container ${selected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        border: selected ? '2px dashed #007bff' : '2px dashed transparent',
        borderRadius: '4px',
        transition: 'border-color 0.2s ease'
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        title={title}
        style={{
          width: width || 'auto',
          height: height || 'auto',
          maxWidth: '100%',
          display: 'block'
        }}
        draggable={false}
      />
      
      {selected && (
        <>
          {/* Corner resize handles */}
          <div
            className="resize-handle resize-handle-nw"
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
            style={{
              position: 'absolute',
              top: '-6px',
              left: '-6px',
              width: '12px',
              height: '12px',
              backgroundColor: '#007bff',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'nw-resize',
              zIndex: 1000,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          />
          <div
            className="resize-handle resize-handle-ne"
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              width: '12px',
              height: '12px',
              backgroundColor: '#007bff',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'ne-resize',
              zIndex: 1000,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          />
          <div
            className="resize-handle resize-handle-sw"
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '-6px',
              width: '12px',
              height: '12px',
              backgroundColor: '#007bff',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'sw-resize',
              zIndex: 1000,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          />
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={(e) => handleMouseDown(e, 'se')}
            style={{
              position: 'absolute',
              bottom: '-6px',
              right: '-6px',
              width: '12px',
              height: '12px',
              backgroundColor: '#007bff',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'se-resize',
              zIndex: 1000,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          />
        </>
      )}
    </NodeViewWrapper>
  )
}
