import crypto from 'crypto';

type CloudinaryUploadResponse = {
  secure_url: string;
};

export class CloudinaryService {
  private readonly cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  private readonly apiKey = process.env.CLOUDINARY_API_KEY;
  private readonly apiSecret = process.env.CLOUDINARY_API_SECRET;

  private ensureConfigured() {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error('Cloudinary is not configured correctly');
    }
  }

  private createSignature(params: Record<string, string | number>) {
    const serializedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return crypto.createHash('sha1').update(`${serializedParams}${this.apiSecret}`).digest('hex');
  }

  public async uploadBookImage(image: string): Promise<string> {
    this.ensureConfigured();

    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      folder: 'rebook/books',
      timestamp,
    };
    const signature = this.createSignature(params);
    const formData = new FormData();

    formData.append('file', image);
    formData.append('api_key', this.apiKey as string);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', params.folder);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const payload = (await response.json()) as
      | CloudinaryUploadResponse
      | { error?: { message?: string } };

    if (!response.ok || !('secure_url' in payload)) {
      const errorMessage = 'error' in payload ? payload.error?.message : undefined;
      throw new Error(errorMessage || 'Cloudinary upload failed');
    }

    return payload.secure_url;
  }
}
