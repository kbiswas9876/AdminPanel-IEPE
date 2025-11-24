# Cloudinary Setup Guide

## Step 1: Create Cloudinary Account
1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Sign up or log in to your account

## Step 2: Get Your Credentials
Your credentials are already configured in the code:
- **Cloud Name:** `dxnzfzu3o`
- **API Key:** `497356693436946`
- **API Secret:** `qekxcBYQgtFfFctjbOoyYriKslU` (⚠️ Generate new secret for production)

## Step 3: Create Upload Preset
1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set the following:
   - **Preset name:** `ml_default`
   - **Signing Mode:** `Unsigned` (for public uploads)
   - **Folder:** `admin-panel` (optional)
   - **Resource type:** `Image`
   - **Access mode:** `Public`
5. Click **Save**

## Step 4: Test Upload
Once the preset is created, the image upload will work automatically.

## Alternative: Use Client-Side Widget
If you prefer to use the Cloudinary Upload Widget instead of server-side upload:

1. The widget is already implemented in `CloudinaryUploadWidget.tsx`
2. It will open a popup for image selection and upload
3. No server-side configuration needed

## Environment Variables (Optional)
Create a `.env.local` file in your project root:
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxnzfzu3o
NEXT_PUBLIC_CLOUDINARY_API_KEY=497356693436946
CLOUDINARY_API_SECRET=qekxcBYQgtFfFctjbOoyYriKslU
```

## Security Note
⚠️ **Important:** The API secret is exposed in the code for development purposes only. 
For production deployment:
1. Generate a new API secret in Cloudinary
2. Store it securely in environment variables
3. Never commit secrets to version control

