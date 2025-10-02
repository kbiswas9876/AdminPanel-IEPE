'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { cn } from '@/lib/utils'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock,
  Unlock,
  RotateCcw,
  Trash2,
  Upload,
  Type,
  Maximize2,
} from 'lucide-react'

interface ImageNodeViewProps {
  node: {
    attrs: {
      src: string
      alt?: string
      title?: string
      width?: number
      height?: number
      alignment: 'left' | 'center' | 'right'
      caption?: string
      float?: 'left' | 'right' | null
      originalWidth?: number
      originalHeight?: number
      aspectRatio?: number
    }
  }
  updateAttributes: (attrs: Record<string, any>) => void
  deleteNode: () => void
  editor: any
}

export const ImageNodeView: React.FC<ImageNodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
}) => {
  const {
    src,
    alt = '',
    title = '',
    width,
    height,
    alignment = 'center',
    caption = '',
    float,
    originalWidth,
    originalHeight,
    aspectRatio,
  } = node.attrs

  const [isSelected, setIsSelected] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [showDimensions, setShowDimensions] = useState(false)
  const [showAltModal, setShowAltModal] = useState(false)
  const [tempWidth, setTempWidth] = useState(width || '')
  const [tempHeight, setTempHeight] = useState(height || '')
  const [tempAlt, setTempAlt] = useState(alt || '')
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  const [dragHandle, setDragHandle] = useState<string | null>(null)

  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 })

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false)
      }
    }
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSelected])

  // Load original dimensions
  useEffect(() => {
    if (imgRef.current && !originalWidth) {
      const img = imgRef.current
      const updateDimensions = () => {
        const newAspectRatio = img.naturalWidth / img.naturalHeight
        updateAttributes({
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          aspectRatio: newAspectRatio,
          width: width || img.naturalWidth,
          height: height || img.naturalHeight,
        })
        setTempWidth(width || img.naturalWidth)
        setTempHeight(height || img.naturalHeight)
      }
      if (img.complete) {
        updateDimensions()
      } else {
        img.onload = updateDimensions
      }
    }
  }, [src, originalWidth, width, height, updateAttributes])

  // Resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setDragHandle(handle)
    if (imgRef.current) {
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: imgRef.current.offsetWidth,
        height: imgRef.current.offsetHeight,
      }
    }
  }, [])

  // Resize move and end
  useEffect(() => {
    if (!isResizing) return

    const handleResizeMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x
      const deltaY = e.clientY - startPosRef.current.y
      let newWidth = startPosRef.current.width
      let newHeight = startPosRef.current.height
      const maxWidth = editor.view.dom.offsetWidth - 40

      if (dragHandle?.includes('e')) newWidth += deltaX
      if (dragHandle?.includes('w')) newWidth -= deltaX
      if (dragHandle?.includes('s')) newHeight += deltaY
      if (dragHandle?.includes('n')) newHeight -= deltaY

      newWidth = Math.max(100, Math.min(maxWidth, newWidth))

      if (lockAspectRatio && aspectRatio) {
        newHeight = newWidth / aspectRatio
      } else {
        newHeight = Math.max(50, newHeight)
      }

      const roundedWidth = Math.round(newWidth)
      const roundedHeight = Math.round(newHeight)
      
      setTempWidth(roundedWidth)
      setTempHeight(roundedHeight)
      updateAttributes({ width: roundedWidth, height: roundedHeight })
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      setDragHandle(null)
    }

    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isResizing, lockAspectRatio, aspectRatio, dragHandle, updateAttributes, editor])

  // Alignment
  const handleAlignment = useCallback((align: 'left' | 'center' | 'right') => {
    // Clear any existing float first, then apply new alignment
    if (align === 'left' || align === 'right') {
      updateAttributes({ 
        alignment: align, 
        float: align,
        // Ensure width doesn't exceed container when floating
        width: width && width > (editor?.view?.dom?.offsetWidth || 800) * 0.5 
          ? Math.round((editor?.view?.dom?.offsetWidth || 800) * 0.4) 
          : width
      })
    } else {
      updateAttributes({ 
        alignment: align, 
        float: null,
        // Reset width constraints for center alignment
        width: width
      })
    }
  }, [updateAttributes, width, editor])

  // Preset resize
  const handlePresetResize = useCallback((percent: number) => {
    if (originalWidth && originalHeight) {
      const newWidth = (originalWidth * percent) / 100
      const newHeight = (originalHeight * percent) / 100
      updateAttributes({ width: newWidth, height: newHeight })
      setTempWidth(newWidth)
      setTempHeight(newHeight)
    }
  }, [originalWidth, originalHeight, updateAttributes])

  // Reset to original
  const handleReset = useCallback(() => {
    if (originalWidth && originalHeight) {
      updateAttributes({ width: originalWidth, height: originalHeight })
      setTempWidth(originalWidth)
      setTempHeight(originalHeight)
    }
  }, [originalWidth, originalHeight, updateAttributes])

  // Dimension change
  const handleDimensionChange = useCallback((dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0
    if (dimension === 'width') {
      setTempWidth(numValue)
      if (lockAspectRatio && aspectRatio) {
        const newHeight = numValue / aspectRatio
        setTempHeight(Math.round(newHeight))
        updateAttributes({ width: numValue, height: Math.round(newHeight) })
      } else {
        updateAttributes({ width: numValue })
      }
    } else {
      setTempHeight(numValue)
      if (lockAspectRatio && aspectRatio) {
        const newWidth = numValue * aspectRatio
        setTempWidth(Math.round(newWidth))
        updateAttributes({ height: numValue, width: Math.round(newWidth) })
      } else {
        updateAttributes({ height: numValue })
      }
    }
  }, [lockAspectRatio, aspectRatio, updateAttributes])

  // File upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        updateAttributes({ src: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }, [updateAttributes])

  // Create proper alignment styles for the editor view
  const getContainerStyle = () => {
    let style: React.CSSProperties = { 
      maxWidth: '100%', 
      boxSizing: 'border-box',
      display: 'block',
      margin: '1rem 0'
    }

    if (float) {
      style.float = float as 'left' | 'right'
      style.margin = float === 'left' ? '0 16px 16px 0' : '0 0 16px 16px'
      style.maxWidth = '50%'
      style.display = 'inline-block'
    } else {
      // Apply text alignment for non-floating images
      style.textAlign = alignment as 'left' | 'center' | 'right'
    }

    return style
  }

  const getImageStyle = () => {
    let style: React.CSSProperties = {
      width: width ? `${width}px` : 'auto',
      height: height ? `${height}px` : 'auto',
      display: 'block'
    }

    // For non-floating images, also apply margin-based alignment
    if (!float) {
      if (alignment === 'left') {
        style.marginLeft = '0'
        style.marginRight = 'auto'
      } else if (alignment === 'right') {
        style.marginLeft = 'auto'
        style.marginRight = '0'
      } else {
        style.marginLeft = 'auto'
        style.marginRight = 'auto'
      }
    }

    return style
  }

  return (
    <NodeViewWrapper className="my-4 max-w-full">
      <div
        ref={containerRef}
        className="relative"
        style={getContainerStyle()}
        onClick={() => setIsSelected(true)}
      >
        <div className="relative group">
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            title={title}
            className="max-w-full h-auto block rounded-lg shadow-lg transition-shadow hover:shadow-xl"
            style={getImageStyle()}
          />

          {isSelected && (
            <>
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />

              {/* Corner handles */}
              {['nw', 'ne', 'sw', 'se'].map((pos) => (
                <div
                  key={pos}
                  className={cn(
                    'absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full z-10',
                    `cursor-${pos}-resize`
                  )}
                  style={{
                    [pos.includes('n') ? 'top' : 'bottom']: '-6px',
                    [pos.includes('w') ? 'left' : 'right']: '-6px',
                  }}
                  onMouseDown={(e) => handleResizeStart(e, pos)}
                />
              ))}

              {/* Side handles */}
              {['n', 'e', 's', 'w'].map((pos) => (
                <div
                  key={pos}
                  className={cn(
                    'absolute bg-blue-500 border-2 border-white rounded-full z-10',
                    `cursor-${pos}-resize`
                  )}
                  style={{
                    ...(pos === 'n' || pos === 's' ? {
                      width: '24px', 
                      height: '12px', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      [pos === 'n' ? 'top' : 'bottom']: '-6px',
                    } : {
                      width: '12px', 
                      height: '24px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      [pos === 'w' ? 'left' : 'right']: '-6px',
                    }),
                  }}
                  onMouseDown={(e) => handleResizeStart(e, pos)}
                />
              ))}

              {/* Floating toolbar */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-2xl px-2 py-1 flex items-center gap-1 z-50">
                <button 
                  onClick={() => handleAlignment('left')} 
                  className={cn(
                    'p-1.5 hover:bg-gray-700 rounded',
                    alignment === 'left' && 'bg-blue-600'
                  )} 
                  title="Align Left"
                >
                  <AlignLeft size={16} />
                </button>
                <button 
                  onClick={() => handleAlignment('center')} 
                  className={cn(
                    'p-1.5 hover:bg-gray-700 rounded',
                    alignment === 'center' && 'bg-blue-600'
                  )} 
                  title="Align Center"
                >
                  <AlignCenter size={16} />
                </button>
                <button 
                  onClick={() => handleAlignment('right')} 
                  className={cn(
                    'p-1.5 hover:bg-gray-700 rounded',
                    alignment === 'right' && 'bg-blue-600'
                  )} 
                  title="Align Right"
                >
                  <AlignRight size={16} />
                </button>
                <div className="w-px h-6 bg-gray-600 mx-1" />
                {[25, 50, 75, 100].map(p => (
                  <button 
                    key={p} 
                    onClick={() => handlePresetResize(p)} 
                    className="px-2 py-1 hover:bg-gray-700 rounded text-xs"
                  >
                    {p}%
                  </button>
                ))}
                <div className="w-px h-6 bg-gray-600 mx-1" />
                <button 
                  onClick={() => setLockAspectRatio(!lockAspectRatio)} 
                  className={cn(
                    'p-1.5 hover:bg-gray-700 rounded',
                    lockAspectRatio && 'bg-blue-600'
                  )}
                  title={lockAspectRatio ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
                >
                  {lockAspectRatio ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <button 
                  onClick={() => setShowDimensions(!showDimensions)} 
                  className="p-1.5 hover:bg-gray-700 rounded"
                  title="Edit Dimensions"
                >
                  <Maximize2 size={16} />
                </button>
                <button 
                  onClick={handleReset} 
                  className="p-1.5 hover:bg-gray-700 rounded"
                  title="Reset to Original Size"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={() => setShowAltModal(true)} 
                  className="p-1.5 hover:bg-gray-700 rounded"
                  title="Edit Alt Text"
                >
                  <Type size={16} />
                </button>
                <label className="p-1.5 hover:bg-gray-700 rounded cursor-pointer" title="Replace Image">
                  <Upload size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                <button 
                  onClick={deleteNode} 
                  className="p-1.5 hover:bg-red-600 rounded"
                  title="Delete Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Dimension panel */}
              {showDimensions && (
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg shadow-xl px-4 py-3 flex items-center gap-3 z-50">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Width</label>
                    <input 
                      type="number" 
                      value={tempWidth} 
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Height</label>
                    <input 
                      type="number" 
                      value={tempHeight} 
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" 
                    />
                  </div>
                  <button 
                    onClick={() => setShowDimensions(false)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Done
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Caption */}
        <div className="mt-2">
          <input 
            type="text" 
            value={caption} 
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            placeholder="Add a caption..."
            className="w-full px-2 py-1 text-sm text-gray-600 italic border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent" 
          />
        </div>
      </div>

      {/* Alt text modal */}
      {showAltModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={() => setShowAltModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Edit Alt Text</h3>
            <textarea 
              value={tempAlt} 
              onChange={(e) => setTempAlt(e.target.value)}
              placeholder="Describe this image for accessibility..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" 
              rows={4} 
              autoFocus 
            />
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setShowAltModal(false)} 
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={() => { 
                  updateAttributes({ alt: tempAlt }) 
                  setShowAltModal(false) 
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}

export default ImageNodeView
