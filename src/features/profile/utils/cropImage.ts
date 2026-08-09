import imageCompression from 'browser-image-compression';
import type { Area } from 'react-easy-crop';

const PROFILE_IMAGE_MAX_SIZE_MB = 5;
const PROFILE_IMAGE_MAX_DIMENSION = 1080;
const WEBP_FALLBACK_QUALITY = 80;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('이미지를 불러오지 못했습니다')));
    image.src = src;
  });
}

// webp 인코딩이 가능한 브라우저인지 확인해 캐싱함 (iOS는 webp 인코딩 불가능)
let nativeWebpSupport: Promise<boolean> | null = null;
function supportsNativeWebpEncoding(): Promise<boolean> {
  nativeWebpSupport ??= new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob((blob) => resolve(blob?.type === 'image/webp'), 'image/webp');
  });
  return nativeWebpSupport;
}

// canvas의 webp 인코딩을 지원하지 않는 브라우저(Safari 등)를 위한 함수
// 번들에 영향 없도록 실제로 필요할 때만 동적으로 불러옴
async function encodeToWebpWithWasm(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context를 생성하지 못했습니다');
    }
    ctx.drawImage(image, 0, 0);

    const { default: encode } = await import('@jsquash/webp/encode');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const webpBuffer = await encode(imageData, { quality: WEBP_FALLBACK_QUALITY });

    return new File([webpBuffer], 'profile-image.webp', { type: 'image/webp' });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function getCroppedImageBlob(imageSrc: string, cropArea: Area): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context를 생성하지 못했습니다');
  }

  const scale = Math.min(
    1,
    PROFILE_IMAGE_MAX_DIMENSION / Math.max(cropArea.width, cropArea.height),
  );
  canvas.width = Math.max(1, Math.round(cropArea.width * scale));
  canvas.height = Math.max(1, Math.round(cropArea.height * scale));

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    canvas.width,
    canvas.height,
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
  const canEncodeWebpNatively = await supportsNativeWebpEncoding();

  // webp 인코딩이 안 되는 브라우저는 webp가 아닌 png로 변환, 인코딩은 별도로 처리
  const compressed = await imageCompression(croppedFile, {
    fileType: canEncodeWebpNatively ? 'image/webp' : 'image/png',
    maxSizeMB: PROFILE_IMAGE_MAX_SIZE_MB,
    maxWidthOrHeight: PROFILE_IMAGE_MAX_DIMENSION,
    useWebWorker: true,
  });

  if (canEncodeWebpNatively) {
    return compressed;
  }

  return encodeToWebpWithWasm(compressed);
}
