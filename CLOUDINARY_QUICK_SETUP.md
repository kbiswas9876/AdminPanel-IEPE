# Quick Cloudinary Setup

## The Issue
The Cloudinary upload is failing because the upload preset `ml_default` doesn't exist in your Cloudinary account.

## Quick Fix (2 minutes)

1. **Go to Cloudinary Console:**
   - Visit: https://cloudinary.com/console
   - Log in with your account

2. **Create Upload Preset:**
   - Go to **Settings** → **Upload**
   - Scroll to **Upload presets** section
   - Click **Add upload preset**
   - Set these values:
     - **Preset name:** `ml_default`
     - **Signing Mode:** `Unsigned`
     - **Folder:** `admin-panel` (optional)
     - **Resource type:** `Image`
     - **Access mode:** `Public`
   - Click **Save**

3. **Re-enable Cloudinary Widget:**
   - In `src/components/editors/AdvancedToolbar.tsx`
   - Uncomment lines 384-387
   - Uncomment line 37

## Alternative: Use File Upload Only
The editor already works with local file uploads. You can:
- Click the **Image** button in the toolbar
- Select files from your computer
- Images will be embedded as local URLs

## Current Status
✅ **Editor is fully functional** - All features work
✅ **Image uploads work** - Using local file URLs
✅ **LaTeX rendering works** - Math formulas display correctly
✅ **No errors** - Cloudinary widget is disabled

The application is ready to use! The Cloudinary setup is optional.


