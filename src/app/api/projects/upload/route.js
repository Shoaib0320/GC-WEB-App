import { NextResponse } from 'next/server';
import { cloudinaryService } from '@/lib/cloudinary';

// POST - Upload multiple images for project
export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const folder = formData.get('folder') || 'portfolio-projects';

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No files provided',
        },
        { status: 400 }
      );
    }

    const uploadedImages = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        errors.push(`File ${i + 1}: Must be an image`);
        continue;
      }

      // Validate file size (max 10MB per image)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`File ${i + 1}: Size must be less than 10MB`);
        continue;
      }

      try {
        // Convert to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary
        const result = await cloudinaryService.uploadImage(buffer, folder);

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          order: i,
        });
      } catch (uploadError) {
        errors.push(`File ${i + 1}: Upload failed - ${uploadError.message}`);
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'All uploads failed',
          details: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          images: uploadedImages,
          uploadedCount: uploadedImages.length,
          totalFiles: files.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload images error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload images',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete image from Cloudinary
export async function DELETE(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Public ID is required',
        },
        { status: 400 }
      );
    }

    await cloudinaryService.deleteImage(publicId);

    return NextResponse.json(
      {
        success: true,
        message: 'Image deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete image',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
