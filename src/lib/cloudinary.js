// lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
  // Upload multiple images
  uploadImages: async (files) => {
    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'products',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Convert file to buffer for upload
          if (file instanceof File) {
            const reader = file.stream().getReader();
            reader.read().then(({ value }) => {
              uploadStream.write(value);
              uploadStream.end();
            });
          } else {
            // If it's already a buffer
            uploadStream.write(file);
            uploadStream.end();
          }
        });
      });

      const results = await Promise.all(uploadPromises);
      return results.map(result => result.secure_url);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload images');
    }
  },

  // Delete images from Cloudinary
  deleteImages: async (imageUrls) => {
    try {
      const deletePromises = imageUrls.map(url => {
        // Extract public_id from URL
        const publicId = url.split('/').pop().split('.')[0];
        const fullPublicId = `products/${publicId}`;
        
        return cloudinary.uploader.destroy(fullPublicId);
      });

      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete images');
    }
  },

  // Extract public ID from Cloudinary URL
  getPublicId: (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return `products/${filename.split('.')[0]}`;
  }
};