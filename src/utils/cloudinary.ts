// src/utils/cloudinary.ts
import axios from 'axios'
import Constants from 'expo-constants'

// Grab your values from expoConfig.extra instead of manifest
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} = Constants.expoConfig!.extra as {
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_UPLOAD_PRESET: string
}

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export async function uploadImageAsync(uri: string): Promise<string> {
  const form = new FormData()
  form.append(
    'file',
    {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any
  )
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const res = await axios.post(UPLOAD_URL, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.secure_url as string
}
