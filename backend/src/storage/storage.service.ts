import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface UploadedImage {
  key: string;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket = process.env['MINIO_BUCKET'] ?? 'listings-images';
  private readonly publicUrl = process.env['MINIO_PUBLIC_URL'] ?? 'http://localhost:9000';

  constructor() {
    this.client = new S3Client({
      endpoint: process.env['MINIO_ENDPOINT'] ?? 'http://localhost:9000',
      region: process.env['MINIO_REGION'] ?? 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env['MINIO_ACCESS_KEY'] ?? '',
        secretAccessKey: process.env['MINIO_SECRET_KEY'] ?? '',
      },
    });
  }

  async uploadImage(file: Express.Multer.File, listingId: string): Promise<UploadedImage> {
    const extension = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'jpg';
    const key = `${listingId}/${randomUUID()}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return { key, url: `${this.publicUrl}/${this.bucket}/${key}` };
  }

  async deleteImage(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
