import imageCompression from 'browser-image-compression';
import type { Area } from 'react-easy-crop';

const PROFILE_IMAGE_MAX_SIZE_MB = 5;
const PROFILE_IMAGE_MAX_DIMENSION = 1080;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('이미지를 불러오지 못했습니다')));
    image.src = src;
  });
}

export async function getCroppedImageBlob(imageSrc: string, cropArea: Area): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context를 생성하지 못했습니다');
  }

  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height,
  );

  const croppedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('이미지 크롭에 실패했습니다'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });

  const croppedFile = new File([croppedBlob], 'profile-image.png', { type: croppedBlob.type });

  return imageCompression(croppedFile, {
    fileType: 'image/webp',
    maxSizeMB: PROFILE_IMAGE_MAX_SIZE_MB,
    maxWidthOrHeight: PROFILE_IMAGE_MAX_DIMENSION,
    useWebWorker: true,
  });
}
