# 🔧 Image Alignment & Caption Fix

## Issues Identified

### 1. **Alignment Not Preserved in Preview** ❌
- **Problem**: Images appear center-aligned in editor but left-aligned in preview
- **Root Cause**: Complex wrapper div structure not being rendered correctly in preview mode

### 2. **Captions Not Showing After Save** ❌  
- **Problem**: Captions visible in editor but disappear in preview
- **Root Cause**: Caption HTML structure not being preserved in saved content

## Solution Implemented

### 🎯 **Simplified HTML Structure**

**Before (Complex):**
```html
<div data-image-wrapper="true" style="text-align: center;">
  <img src="..." />
  <div class="image-caption">Caption</div>
</div>
```

**After (Simplified):**
```html
<div data-image-wrapper="true" data-alignment="center" style="text-align: center; display: block; margin: 1rem 0;">
  <img src="..." data-alignment="center" data-caption="Caption" style="max-width: 100%; height: auto; border-radius: 8px;" />
  <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit;">Caption</div>
</div>
```

### 🔧 **Key Changes Made**

#### 1. **Enhanced renderHTML Function**
- Simplified wrapper structure with inline styles
- Preserved all data attributes on img element
- Proper caption rendering with inline styles
- Different handling for floating vs non-floating images

#### 2. **Improved CSS Rules**
- Added high-specificity selectors with `!important`
- Support for both wrapper and direct img styling
- Proper caption styling class
- Floating image support

#### 3. **Updated Content Transformer**
- Better attribute preservation
- Proper style application
- Enhanced data attribute handling

#### 4. **Global CSS Import**
- Added CSS to `globals.css` for preview mode
- Ensures styling works outside editor context

## Technical Implementation

### **renderHTML Logic:**
```typescript
// Non-floating images: wrapped with text-align
if (!float) {
  const wrapperStyle = `text-align: ${alignment}; display: block; margin: 1rem 0;`
  return ['div', { style: wrapperStyle }, imgElement, captionElement]
}

// Floating images: direct styling on img
return imgElement // with float styles applied
```

### **CSS Specificity:**
```css
div[data-image-wrapper="true"][data-alignment="center"],
.prose div[data-image-wrapper="true"][data-alignment="center"] {
  text-align: center !important;
}
```

### **Caption Handling:**
```css
.image-caption {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  font-style: italic;
  text-align: inherit;
}
```

## Expected Results

### ✅ **Alignment Preservation**
- Center-aligned images stay centered in preview
- Left/right alignment works correctly
- Floating images maintain proper text wrapping

### ✅ **Caption Display**
- Captions appear below images in preview
- Proper styling and inheritance
- Editable in editor, visible in preview

### ✅ **Backward Compatibility**
- Existing images automatically upgraded
- No breaking changes to current content
- Smooth migration path

## Testing Checklist

- [ ] **Editor**: Image alignment controls work
- [ ] **Editor**: Caption editing works
- [ ] **Save**: Content saves without errors
- [ ] **Preview**: Alignment preserved after save
- [ ] **Preview**: Captions visible after save
- [ ] **Legacy**: Old images work with new features

## Files Modified

1. **`AdvancedImage.ts`** - Simplified renderHTML function
2. **`advanced-image.css`** - Enhanced CSS rules and caption styling
3. **`image-content-transformer.ts`** - Better attribute preservation
4. **`globals.css`** - Global CSS import for preview mode

The implementation now uses inline styles and data attributes to ensure alignment and captions are preserved across editor and preview modes! 🎉
