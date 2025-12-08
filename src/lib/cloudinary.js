// lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
  // ============ SINGLE IMAGE UPLOAD ============
  uploadImage: async (file, folder = 'team-members') => {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        if (file instanceof File) {
          const reader = file.stream().getReader();
          const pump = async () => {
            const { done, value } = await reader.read();
            if (done) {
              uploadStream.end();
              return;
            }
            uploadStream.write(value);
            pump();
          };
          pump();
        } else if (Buffer.isBuffer(file)) {
          uploadStream.write(file);
          uploadStream.end();
        } else {
          reject(new Error('Invalid file type'));
        }
      });
    } catch (error) {
      console.error('Cloudinary single upload error:', error);
      throw new Error('Failed to upload image');
    }
  },

  // ============ MULTIPLE IMAGES UPLOAD ============
  uploadImages: async (files, folder = 'products') => {
    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder,
              resource_type: 'image',
              quality: 'auto',
              fetch_format: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          if (file instanceof File) {
            const reader = file.stream().getReader();
            const pump = async () => {
              const { done, value } = await reader.read();
              if (done) {
                uploadStream.end();
                return;
              }
              uploadStream.write(value);
              pump();
            };
            pump();
          } else if (Buffer.isBuffer(file)) {
            uploadStream.write(file);
            uploadStream.end();
          } else {
            reject(new Error('Invalid file type'));
          }
        });
      });

      const results = await Promise.all(uploadPromises);
      return results.map(result => ({
        secure_url: result.secure_url,
        public_id: result.public_id,
        url: result.url,
      }));
    } catch (error) {
      console.error('Cloudinary multiple upload error:', error);
      throw new Error('Failed to upload images');
    }
  },

  // ============ DELETE SINGLE IMAGE ============
  deleteImage: async (publicId) => {
    try {
      if (!publicId) {
        throw new Error('Public ID is required for deletion');
      }
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete image');
    }
  },

  // ============ DELETE MULTIPLE IMAGES ============
  deleteImages: async (publicIds) => {
    try {
      const deletePromises = publicIds.map(publicId =>
        cloudinary.uploader.destroy(publicId)
      );

      const results = await Promise.all(deletePromises);
      return results.every(result => result.result === 'ok');
    } catch (error) {
      console.error('Cloudinary batch delete error:', error);
      throw new Error('Failed to delete images');
    }
  },

  // ============ EXTRACT PUBLIC ID FROM URL ============
  getPublicId: (url, folder = 'products') => {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      return `${folder}/${publicId}`;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  },

  // ============ GET IMAGE OPTIMIZATION URL ============
  getOptimizedUrl: (url, width = null, height = null, quality = 'auto') => {
    try {
      if (!url) return url;

      // If URL contains cloudinary, optimize it
      if (url.includes('cloudinary.com')) {
        let transformations = `q_${quality}`;

        if (width && height) {
          transformations = `w_${width},h_${height},c_fill/${transformations}`;
        } else if (width) {
          transformations = `w_${width},c_scale/${transformations}`;
        } else if (height) {
          transformations = `h_${height},c_scale/${transformations}`;
        }

        // Insert transformation before /upload/
        return url.replace('/upload/', `/upload/${transformations}/`);
      }

      return url;
    } catch (error) {
      console.error('Error optimizing URL:', error);
      return url;
    }
  },
};