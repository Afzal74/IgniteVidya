import { supabase } from './supabase'

/**
 * Supabase Storage utility functions for managing images and files
 */

// Storage bucket names
export const BUCKETS = {
  THUMBNAILS: 'thumbnails',
  COVERS: 'covers',
  NOTES: 'notes',
  PAPERS: 'papers',
  PROJECTS: 'projects',
} as const

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - Optional path within the bucket (e.g., 'math/calculus.jpg')
 * @returns Public URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  bucket: string,
  path?: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Generate unique filename if path not provided
    const fileName = path || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Upload exception:', error)
    return { url: null, error: error as Error }
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  files: File[],
  bucket: string
): Promise<{ urls: string[]; errors: Error[] }> {
  const results = await Promise.all(
    files.map(file => uploadImage(file, bucket))
  )

  const urls = results.filter(r => r.url).map(r => r.url!)
  const errors = results.filter(r => r.error).map(r => r.error!)

  return { urls, errors }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * List files in a bucket
 */
export async function listFiles(
  bucket: string,
  folder?: string
): Promise<{ files: any[]; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) {
      return { files: [], error }
    }

    return { files: data || [], error: null }
  } catch (error) {
    return { files: [], error: error as Error }
  }
}

/**
 * Upload note with thumbnail
 */
export async function uploadNoteWithThumbnail(
  noteFile: File,
  thumbnailFile: File | null,
  metadata: {
    subject_name: string
    subject_code: string
    scheme: string
    class?: string
    semester?: number
  }
) {
  try {
    // Upload note PDF
    const noteResult = await uploadImage(
      noteFile,
      BUCKETS.NOTES,
      `${metadata.subject_code}/${noteFile.name}`
    )

    if (noteResult.error) {
      return { success: false, error: noteResult.error }
    }

    // Upload thumbnail if provided
    let thumbnailUrl = null
    if (thumbnailFile) {
      const thumbResult = await uploadImage(
        thumbnailFile,
        BUCKETS.THUMBNAILS,
        `notes/${metadata.subject_code}.jpg`
      )
      thumbnailUrl = thumbResult.url
    }

    // Insert into database
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...metadata,
        file_url: noteResult.url,
        thumbnail_url: thumbnailUrl,
        uploaded_by: 'User', // Replace with actual user
      })
      .select()
      .single()

    if (error) {
      return { success: false, error }
    }

    return { success: true, data, error: null }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

/**
 * Upload project with images
 */
export async function uploadProjectWithImages(
  thumbnailFile: File | null,
  coverFile: File | null,
  projectData: {
    title: string
    description: string
    domain: string
    github_url: string
    tags?: string[]
    tech_stack?: string[]
    difficulty?: string
  }
) {
  try {
    let thumbnailUrl = null
    let coverUrl = null

    // Upload thumbnail
    if (thumbnailFile) {
      const thumbResult = await uploadImage(
        thumbnailFile,
        BUCKETS.THUMBNAILS,
        `projects/${Date.now()}-thumb.jpg`
      )
      thumbnailUrl = thumbResult.url
    }

    // Upload cover
    if (coverFile) {
      const coverResult = await uploadImage(
        coverFile,
        BUCKETS.COVERS,
        `projects/${Date.now()}-cover.jpg`
      )
      coverUrl = coverResult.url
    }

    // Insert into database
    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        thumbnail_url: thumbnailUrl,
        cover_image_url: coverUrl,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error }
    }

    return { success: true, data, error: null }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' }
  }

  return { valid: true }
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'PDF size must be less than 50MB' }
  }

  return { valid: true }
}

/**
 * Get file size in human-readable format
 */
export function getFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
