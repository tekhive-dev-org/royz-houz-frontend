import { mediaLibraryApi } from "./mediaLibraryApi";

function normalizeCloudinaryDimension(value) {
  return Number(value) > 0 ? Number(value) : null;
}

function slugifyFileName(fileName) {
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "asset";
  return `${base}-${Date.now()}`;
}

function uploadToCloudinary(file, signed, onProgress) {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  form.append("folder", signed.folder);
  form.append("public_id", signed.publicId);
  form.append("allowed_formats", signed.allowedFormats.join(","));

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", signed.uploadUrl);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onerror = () => reject(new Error("The media upload could not reach Cloudinary."));
    request.onload = () => {
      let payload;
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        reject(new Error("Cloudinary returned an invalid upload response."));
        return;
      }

      if (request.status < 200 || request.status >= 300) {
        reject(new Error(payload?.error?.message || "Cloudinary rejected the media upload."));
        return;
      }
      resolve(payload);
    };
    request.send(form);
  });
}

/**
 * Performs the browser half of the protected signed-upload workflow and then
 * registers the resulting Cloudinary asset through the protected admin API.
 */
export async function uploadMediaAsset({ file, mediaType = "image", title, summary, altText, category, onProgress }) {
  if (!file) throw new Error("Choose a file to upload.");

  onProgress?.(0);
  const signed = await mediaLibraryApi.signedUpload({
    mediaType,
    fileName: file.name,
    mimeType: file.type,
    bytes: file.size,
  });
  const upload = await uploadToCloudinary(file, signed, onProgress);
  const defaultTitle = file.name.replace(/\.[^.]+$/, "");
  const assetTitle = title?.trim() || defaultTitle;
  const asset = await mediaLibraryApi.registerUpload({
    asset: {
      mediaType,
      slug: slugifyFileName(file.name),
      title: assetTitle,
      summary: summary?.trim() || undefined,
      altText: altText?.trim() || assetTitle,
    }, 
    upload: {
      public_id: upload.public_id,
      resource_type: upload.resource_type,
      secure_url: upload.secure_url,
      url: upload.url,
      format: upload.format,
      width: normalizeCloudinaryDimension(upload.width),
      height: normalizeCloudinaryDimension(upload.height),
      duration: upload.duration,
      bytes: upload.bytes,
    },
  });

  onProgress?.(100);
  return {
    asset,
    secureUrl: upload.secure_url,
    altText: assetTitle,
    category,
    summary,
    title: assetTitle,
    durationSeconds: upload.duration ?? null,
    width: normalizeCloudinaryDimension(upload.width),
    height: normalizeCloudinaryDimension(upload.height),
    format: upload.format || null,
  };
}
