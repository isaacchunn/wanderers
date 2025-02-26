import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// S3 Client
const s3Client = new S3Client({
  forcePathStyle: true,
  region: "auto",
  endpoint: process.env.S3_IMAGE_UPLOAD_ENDPOINT ?? "",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

export const uploadS3ProfileImage = async (
  userId: number,
  image_file: Express.Multer.File
) => {
  try {
    const fileExtension = image_file.mimetype.split("/")[1];
    const filePath = `user/${userId}/${randomUUID()}.${fileExtension}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME ?? "",
      Key: filePath,
      Body: image_file.buffer,
      ContentType: `image/${fileExtension}`,
    });

    await s3Client.send(uploadCommand);

    return filePath;
  } catch (error: any) {
    return null;
  }
};

export const deleteS3ProfileImage = async (image_file_path: string) => {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME ?? "",
      Key: image_file_path,
    });

    await s3Client.send(deleteCommand);
  } catch (error: any) {
    throw Error(error.message);
  }
};
