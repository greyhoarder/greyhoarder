import { Injectable } from '@angular/core';

const EDGE = 256;
const QUALITY = 0.85;

/** Makes pictures small and square in the browser, so that only small JPEGs reach the server. */
@Injectable({ providedIn: 'root' })
export class SquareImage {
  /**
   * The middle of the image as a JPEG in Base64.
   *
   * @throws DOMException when the file is no image a browser can read
   */
  async toJpeg(file: Blob): Promise<string> {
    const image = await createImageBitmap(file);
    const side = Math.min(image.width, image.height);
    const canvas = document.createElement('canvas');
    canvas.width = EDGE;
    canvas.height = EDGE;
    canvas
      .getContext('2d')
      ?.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, EDGE, EDGE);
    image.close();
    return canvas.toDataURL('image/jpeg', QUALITY).split(',')[1] ?? '';
  }
}
