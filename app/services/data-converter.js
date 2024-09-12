export const Formats = {
    dataUrl: 'dataUrl',
    blob: 'blob'
  };
  
  const dataUrlRe = /^data:([-\w]+\/[-+\w.]+)?(;?\w+=[-\w]+)*(;base64)?,.*/u;
  
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
  