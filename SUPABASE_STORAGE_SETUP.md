# Supabase Storage Setup Guide

## Overview

This guide will help you set up Supabase Storage for managing images and files instead of using the public folder.

## Benefits of Supabase Storage

✅ **Scalable** - No file size limits on your Next.js deployment
✅ **CDN** - Global CDN for fast image delivery
✅ **Secure** - Fine-grained access control with RLS
✅ **Organized** - Separate buckets for different content types
✅ **Optimized** - Built-in image transformations
✅ **Cost-effective** - Free tier includes 1GB storage

## Step 1: Create Storage Buckets

1. Open your Supabase Dashboard
2. Go to **Storage** in the left sidebar
3. Click **New Bucket** and create these buckets:

### Buckets to Create:

| Bucket Name | Purpose | Public Access |
|------------|---------|---------------|
| `thumbnails` | Card thumbnails for all content | ✅ Public |
| `covers` | Cover images for detailed views | ✅ Public |
| `notes` | PDF notes and documents | ✅ Public |
| `papers` | Question paper PDFs | ✅ Public |
| `projects` | Project-related files | ✅ Public |

### Creating Each Bucket:

```
1. Click "New Bucket"
2. Enter bucket name (e.g., "thumbnails")
3. Toggle "Public bucket" to ON
4. Click "Create bucket"
```

## Step 2: Set Up Storage Policies

For each bucket, you need to set up policies. Here's the SQL to run:

```sql
-- Thumbnails bucket policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

-- Repeat for other buckets (covers, notes, papers, projects)
-- Just replace 'thumbnails' with the bucket name
```

Or use the UI:
1. Click on a bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select template: "Allow public read access"
5. Click **Review** and **Save**

## Step 3: Use the Storage Utility

Import and use the storage functions in your components:

### Upload Image Example

```typescript
import { uploadImage, BUCKETS } from '@/lib/supabase-storage'

// In your component
const handleImageUpload = async (file: File) => {
  const { url, error } = await uploadImage(
    file,
    BUCKETS.THUMBNAILS,
    'notes/math12.jpg' // optional custom path
  )

  if (error) {
    console.error('Upload failed:', error)
    return
  }

  console.log('Image uploaded:', url)
  // Save URL to database
}
```

### Upload Note with Thumbnail

```typescript
import { uploadNoteWithThumbnail } from '@/lib/supabase-storage'

const handleNoteUpload = async (
  noteFile: File,
  thumbnailFile: File
) => {
  const result = await uploadNoteWithThumbnail(
    noteFile,
    thumbnailFile,
    {
      subject_name: 'Advanced Mathematics',
      subject_code: 'MATH12',
      scheme: '2025',
      class: '12'
    }
  )

  if (result.success) {
    console.log('Note uploaded:', result.data)
  }
}
```

### Upload Project with Images

```typescript
import { uploadProjectWithImages } from '@/lib/supabase-storage'

const handleProjectUpload = async (
  thumbnailFile: File,
  coverFile: File
) => {
  const result = await uploadProjectWithImages(
    thumbnailFile,
    coverFile,
    {
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce website',
      domain: 'Web Development',
      github_url: 'https://github.com/example/ecommerce',
      tags: ['react', 'nodejs'],
      tech_stack: ['React', 'Node.js', 'MongoDB'],
      difficulty: 'Hard'
    }
  )

  if (result.success) {
    console.log('Project uploaded:', result.data)
  }
}
```

## Step 4: Create Upload Component

Here's a reusable upload component:

```typescript
'use client'

import { useState } from 'react'
import { uploadImage, validateImageFile, BUCKETS } from '@/lib/supabase-storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ImageUploader({ 
  bucket, 
  onUploadComplete 
}: { 
  bucket: string
  onUploadComplete: (url: string) => void 
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    const { url, error } = await uploadImage(file, bucket)
    setUploading(false)

    if (error) {
      alert('Upload failed: ' + error.message)
      return
    }

    if (url) {
      onUploadComplete(url)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      {preview && (
        <img 
          src={preview} 
          alt="Preview" 
          className="w-full h-48 object-cover rounded-lg"
        />
      )}
      
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
```

## Step 5: Migrate Existing Images

If you have images in your public folder, you can migrate them:

### Option 1: Manual Upload via Dashboard
1. Go to Storage in Supabase Dashboard
2. Select a bucket
3. Click "Upload file"
4. Select images from your public folder
5. Update database records with new URLs

### Option 2: Programmatic Migration

```typescript
// scripts/migrate-images-to-storage.ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateImages() {
  const publicDir = path.join(process.cwd(), 'public/thumbnails')
  const files = fs.readdirSync(publicDir)

  for (const file of files) {
    const filePath = path.join(publicDir, file)
    const fileBuffer = fs.readFileSync(filePath)

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('thumbnails')
      .upload(file, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error(`Failed to upload ${file}:`, error)
    } else {
      console.log(`Uploaded ${file}`)
    }
  }
}

migrateImages()
```

## Step 6: Image Transformations

Supabase Storage supports on-the-fly image transformations:

```typescript
// Get optimized thumbnail
const { data } = supabase.storage
  .from('thumbnails')
  .getPublicUrl('math12.jpg', {
    transform: {
      width: 400,
      height: 300,
      resize: 'cover',
      quality: 80
    }
  })

console.log(data.publicUrl) // Optimized image URL
```

### Common Transformations:

```typescript
// Thumbnail (400x300)
transform: { width: 400, height: 300, resize: 'cover' }

// Card image (800x600)
transform: { width: 800, height: 600, resize: 'contain' }

// High quality (original size, 90% quality)
transform: { quality: 90 }

// WebP format
transform: { format: 'webp' }
```

## Step 7: Update Your Components

Replace public folder references with Supabase URLs:

### Before:
```typescript
<img src="/thumbnails/math.jpg" alt="Math" />
```

### After:
```typescript
<img src={note.thumbnail_url} alt={note.subject_name} />
```

## Storage Limits & Pricing

### Free Tier:
- 1 GB storage
- 2 GB bandwidth per month
- Unlimited requests

### Pro Tier ($25/month):
- 100 GB storage
- 200 GB bandwidth
- Additional storage: $0.021/GB
- Additional bandwidth: $0.09/GB

## Best Practices

1. **Optimize images before upload**
   - Compress images (use tools like TinyPNG)
   - Resize to appropriate dimensions
   - Use WebP format when possible

2. **Organize with folders**
   ```
   thumbnails/
   ├── notes/
   │   ├── math12.jpg
   │   └── physics11.jpg
   ├── projects/
   │   └── ecommerce.jpg
   └── papers/
       └── exam2024.jpg
   ```

3. **Use consistent naming**
   - `{subject_code}.jpg` for notes
   - `{project-slug}.jpg` for projects
   - `{year}-{subject}.jpg` for papers

4. **Set cache headers**
   ```typescript
   await supabase.storage
     .from('thumbnails')
     .upload(fileName, file, {
       cacheControl: '3600', // 1 hour
       upsert: false
     })
   ```

5. **Handle errors gracefully**
   - Show fallback images
   - Retry failed uploads
   - Log errors for debugging

## Troubleshooting

### Images not showing
- Check bucket is public
- Verify RLS policies allow SELECT
- Check URL is correct

### Upload fails
- Check file size limits
- Verify authentication
- Check bucket exists

### Slow loading
- Use image transformations
- Enable CDN caching
- Optimize image sizes

## Summary

✅ Created storage buckets
✅ Set up access policies
✅ Created utility functions
✅ Built upload components
✅ Migrated existing images
✅ Implemented transformations

Your images are now stored in Supabase Storage with CDN delivery, automatic backups, and scalable infrastructure! 🎉
