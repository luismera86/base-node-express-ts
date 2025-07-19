import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";
import { UploadedFile } from "express-fileupload";

// Cargar variables de entorno
dotenv.config();

export interface S3Config {
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucketName?: string;
}

export interface UploadResult {
    key: string;
    url: string;
    bucket: string;
    etag?: string;
}

export interface FileMetadata {
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
}

export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    /**
     * Constructor que puede tomar configuración explícita o usar variables de entorno
     * @param config Configuración opcional. Si no se proporciona, se usarán variables de entorno.
     */
    constructor(config?: S3Config) {
        // Usar configuración proporcionada o variables de entorno
        const region = config?.region || process.env.AWS_REGION;
        const accessKeyId = config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
        const bucketName = config?.bucketName || process.env.AWS_BUCKET_NAME;

        // Validar que todas las configuraciones necesarias estén presentes
        if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
            throw new Error("Missing S3 configuration. Please provide config or set environment variables.");
        }

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        this.bucketName = bucketName;
    }

    /**
     * Sube un archivo a S3
     */
    async uploadFile(file: Buffer | Uint8Array | string | UploadedFile, folder?: string): Promise<UploadResult> {
        try {
            if (!file) {
                throw new Error("No file provided");
            }

            const originalName = file instanceof Object && "name" in file ? file.name : "file";
            const fileExtension = path.extname(originalName);
            const baseName = path.basename(originalName, fileExtension).replace(/\s+/g, "_");
            const uniqueFileName = `${baseName}-${uuidv4()}${fileExtension}`;
            const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

            let fileBuffer: Buffer;
            if (file instanceof Object && "data" in file) {
                fileBuffer = Buffer.from(file.data);
            } else if (file instanceof Buffer) {
                fileBuffer = file;
            } else if (typeof file === "string") {
                fileBuffer = Buffer.from(file);
            } else {
                throw new Error("Invalid file format");
            }

            const contentType =
                file instanceof Object && "mimetype" in file ? file.mimetype : "application/octet-stream";

            const uploadParams = {
                Bucket: this.bucketName,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
            };

            const upload = new Upload({
                client: this.s3Client,
                params: uploadParams,
            });

            const result = await upload.done();

            return {
                key,
                url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
                bucket: this.bucketName,
                etag: result.ETag,
            };
        } catch (error: any) {
            throw new Error(`Error uploading file: ${error.message}`);
        }
    }

    /**
     * Obtiene un archivo de S3
     */
    async getFile(key: string): Promise<Buffer> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            if (!response.Body) {
                throw new Error("File not found");
            }

            // Convertir stream a buffer
            const chunks: Uint8Array[] = [];
            const stream = response.Body as any;

            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        } catch (error: any) {
            throw new Error(`Error getting file: ${error.message}`);
        }
    }

    /**
     * Genera una URL firmada para acceso temporal
     */
    async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error: any) {
            throw new Error(`Error generating signed URL: ${error.message}`);
        }
    }

    /**
     * Genera una URL firmada para subida directa desde el cliente
     */
    async getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error: any) {
            throw new Error(`Error generating upload URL: ${error.message}`);
        }
    }

    /**
     * Elimina un archivo de S3
     */
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error: any) {
            throw new Error(`Error deleting file: ${error.message}`);
        }
    }

    /**
     * Lista archivos en un folder específico
     */
    async listFiles(prefix?: string, maxKeys = 100): Promise<string[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });

            const response = await this.s3Client.send(command);
            return response.Contents?.map((obj) => obj.Key!) || [];
        } catch (error: any) {
            throw new Error(`Error listing files: ${error.message}`);
        }
    }

    /**
     * Verifica si un archivo existe
     */
    async fileExists(key: string): Promise<boolean> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
            return true;
        } catch (error: any) {
            return false;
        }
    }
}
