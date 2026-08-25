export const Formats = {
    dataUrl: 'dataUrl',
    blob: 'blob'
  };
  
  const dataUrlRe = /^data:([-\w]+\/[-+\w.]+)?(;?\w+=[-\w]+)*(;base64)?,.*/u;

  // image formats this browser can actually decode into an <img>; HEIC/HEIF and TIFF cannot
  export const decodableImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/avif']);

  // file signatures are the only reliable source of an image's format - phones
  // routinely upload HEIC photos under a .jpg filename
  export async function sniffImageType (data) {
    if (!(data instanceof Blob)) return null;

    const bytes = new Uint8Array(await data.slice(0, 16).arrayBuffer());

    if (bytes.length < 12) return null;

    const ascii = (from, to) => String.fromCharCode(...bytes.slice(from, to));

    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if (bytes[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png';
    if (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a') return 'image/gif';
    if (ascii(0, 2) === 'BM' && bytes[6] === 0 && bytes[7] === 0) return 'image/bmp';
    if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';

    if (ascii(4, 8) === 'ftyp') {
      const brand = ascii(8, 12);

      if (['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs'].includes(brand)) return 'image/heic';
      if (['mif1', 'msf1'].includes(brand)) return 'image/heif';
      if (['avif', 'avis'].includes(brand)) return 'image/avif';
    }

    return null;
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
  