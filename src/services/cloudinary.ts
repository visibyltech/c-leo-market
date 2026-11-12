const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export async function uploadToCloudinary(file: File, folder: 'products' | 'receipts') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured yet. Add the Cloudinary cloud name and unsigned upload preset in Vercel environment variables.');
  }
  const allowed = folder === 'products'
    ? ['image/jpeg', 'image/png', 'image/webp']
    : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowed.includes(file.type)) throw new Error('Please choose a JPG, PNG, WEBP' + (folder === 'receipts' ? ' or PDF' : '') + ' file.');
  const maxBytes = folder === 'receipts' ? 5 * 1024 * 1024 : 8 * 1024 * 1024;
  if (!file.size || file.size > maxBytes) throw new Error(folder === 'receipts' ? 'Receipt must be 5MB or smaller.' : 'Product image must be 8MB or smaller.');
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', UPLOAD_PRESET);
  data.append('folder', 'c-leo-market/' + folder);
  const resource = file.type === 'application/pdf' ? 'raw' : 'image';
  const response = await fetch('https://api.cloudinary.com/v1_1/' + encodeURIComponent(CLOUD_NAME) + '/' + resource + '/upload', { method: 'POST', body: data });
  const result = await response.json();
  if (!response.ok || !result.secure_url) throw new Error(result.error?.message || 'Cloudinary upload failed. Please try again.');
  return { url: result.secure_url as string, publicId: result.public_id as string };
}


// Import an existing public product image directly into Cloudinary without
// downloading it to the administrator's phone first.
export async function uploadRemoteImageToCloudinary(imageUrl: string, folder: 'products' = 'products') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in Vercel.');
  }
  const remote = new URL(imageUrl);
  if (remote.protocol !== 'https:' || !['shop.cleomarkets.com', 'www.shop.cleomarkets.com', 'cleomarkets.com', 'www.cleomarkets.com'].includes(remote.hostname)) {
    throw new Error('The source image is not from the approved C-LEO catalogue.');
  }
  const data = new FormData();
  data.append('file', imageUrl);
  data.append('upload_preset', UPLOAD_PRESET);
  data.append('folder', 'c-leo-market/' + folder);
  const response = await fetch('https://api.cloudinary.com/v1_1/' + encodeURIComponent(CLOUD_NAME) + '/image/upload', { method: 'POST', body: data });
  const result = await response.json();
  if (!response.ok || !result.secure_url) throw new Error(result.error?.message || 'Cloudinary could not copy a catalogue image.');
  return { url: result.secure_url as string, publicId: result.public_id as string };
}
