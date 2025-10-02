# 🔍 Image Alignment Debug Guide

## Issue Analysis

The image alignment works in the editor but not in preview mode. This suggests the HTML output is not preserving the alignment correctly.

## Debugging Steps

### 1. Check HTML Output
When you save a question with a center-aligned image, the HTML should look like:

```html
<div data-image-wrapper="true" data-alignment="center" style="text-align: center; display: block;">
  <img src="..." data-alignment="center" data-width="..." data-height="..." class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
  <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit;">Caption text</div>
</div>
```

### 2. CSS Rules Applied
The following CSS rules should apply in preview mode:

```css
/* High specificity rules */
div[data-image-wrapper="true"][data-alignment="center"],
.prose div[data-image-wrapper="true"][data-alignment="center"] {
  text-align: center !important;
}
```

### 3. Verification Steps

1. **In Editor**: 
   - Click image → Select center alignment
   - Image should appear centered with blue toolbar

2. **Save Question**:
   - Click save/update
   - HTML should contain proper data attributes

3. **Preview Mode**:
   - View saved question
   - Image should maintain center alignment

### 4. Common Issues & Fixes

#### Issue: HTML Missing Data Attributes
**Symptom**: Preview shows left-aligned images
**Fix**: Enhanced `renderHTML()` function to preserve attributes

#### Issue: CSS Not Loading
**Symptom**: No alignment styling in preview
**Fix**: Added CSS import to `globals.css`

#### Issue: CSS Specificity
**Symptom**: Alignment overridden by other styles
**Fix**: Added `!important` and higher specificity selectors

### 5. Testing Commands

To test the HTML output, you can:

1. **Browser Console**:
```javascript
// Check if image wrapper exists
document.querySelectorAll('[data-image-wrapper="true"]')

// Check alignment attribute
document.querySelectorAll('[data-alignment="center"]')

// Check computed styles
getComputedStyle(document.querySelector('[data-image-wrapper="true"]')).textAlign
```

2. **Network Tab**:
- Verify `advanced-image.css` is loaded
- Check for CSS 404 errors

### 6. Expected Behavior

✅ **Working**: Image alignment in editor
✅ **Fixed**: HTML output with proper attributes  
✅ **Fixed**: CSS rules with high specificity
✅ **Fixed**: Global CSS import for preview mode

The alignment should now persist in preview mode!
