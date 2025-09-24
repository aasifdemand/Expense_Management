/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { Injectable } from "@nestjs/common";
import ImageKit from "imagekit";

@Injectable()
export class ImagekitService {
    private imagekit: ImageKit;

    constructor() {
        this.imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY! as string,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY! as string,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT! as string,
        });
    }

    async uploadFile(file: Buffer, fileName: string, folder: string = "/"): Promise<any> {
        return await this.imagekit.upload({
            file,
            fileName,
            folder,
        });
    }

    getFileUrl(fileId: string): string {
        return this.imagekit.url({ path: fileId });
    }

    async deleteFile(fileId: string): Promise<any> {
        return await this.imagekit.deleteFile(fileId);
    }
}
