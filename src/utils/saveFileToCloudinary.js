import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';

cloudinary.config({
  secure: true,
  cloud_name: 'my_cloud_name',
  api_key: 'my_key',
  api_secret: 'my_secret',
});

export async function saveFileToCloudinary(buffer, userId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'student-app/avatars',
        resource_type: 'image',
        public_id: `avatar_${userId}`,
        overwrite: true,
        unique_filename: false,
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}
