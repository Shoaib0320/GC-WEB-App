import { NextResponse } from 'next/server';
import { cloudinaryService } from '@/lib/cloudinary';

// POST - Upload single image
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'team-members';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'File must be an image',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size must be less than 5MB',
        },
        { status: 400 }
      );
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadImage(buffer, folder);

    return NextResponse.json(
      {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          originalUrl: result.url,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload image',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
