import { fileTypeFromBlob } from 'file-type';

export const Formats = {
    dataUrl: 'dataUrl',
    blob: 'blob'
  };
  
  const dataUrlRe = /^data:([-\w]+\/[-+\w.]+)?(;?\w+=[-\w]+)*(;base64)?,.*/u;

  // image formats this browser can actually decode into an <img>; HEIC/HEIF and TIFF cannot
  export const decodableImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/avif']);

  // file signatures are the only reliable source of a file's format - phones
  // routinely upload HEIC photos under a .jpg filename. detection is file-type's
  // job; the callers decide what is actually supported
  export async function sniffFileType (data) {
    if (!(data instanceof Blob)) return null;

    const type = await fileTypeFromBlob(data).catch(() => null);

    return type?.mime || null;
  }

  export async function toDataUrl (data) {
    if (typeof (data) === 'string' && dataUrlRe.test(data)) return data;
  
    if (data instanceof Blob) {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.onabort = () => reject(new Error('Read aborted'));
        reader.readAsDataURL(data);
      });
    }
  
    throw new Error('unsupported data type');
  }
  
  export async function toBlob (data) {
    if (data instanceof Blob) return data;
  
    if (typeof (data) === 'string' && dataUrlRe.test(data)) {
      return await fetch(data).then(r => r.blob());
    }
  
    throw new Error('unsupported data type');
  }
  
  export async function toFile (data, filename, { type, lastModified } = {}) {
    if (data instanceof File) return data;
  
    const blob = await toBlob(data);
  
    return new File([blob], filename || blob.filename || 'not-named', {
      type: type || blob.type,
      lastModified: lastModified || new Date()
    });
  }
  
  export function downloadFile (file) {
    if (!(file instanceof File)) throw new Error('Provided file is not of type "File"');
  
    const objectUrl = URL.createObjectURL(file);
  
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = file.name;
    anchor.click();
  
    URL.revokeObjectURL(objectUrl);
  }
  