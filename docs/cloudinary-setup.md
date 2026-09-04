# Cloudinary Setup

Royz Houz uses Cloudinary for admin-managed images, videos, and audio. Supabase stores only media **metadata and references**; media files live in Cloudinary. Cloudinary processes audio through its `video` resource pipeline while Supabase records the semantic media type as `audio`.

## Accounts and credentials

Create a Cloudinary account and take note of:

- Cloud name (`CLOUDINARY_CLOUD_NAME`)
- API key (`CLOUDINARY_API_KEY`)
- API secret (`CLOUDINARY_API_SECRET`)

Set these as server-only environment variables in **both** applications:

```text
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Security rules:

- The API secret is a server credential. It must never be placed in a `NEXT_PUBLIC_*` variable, browser bundle, client component, public repository, or documentation.
- Configuration lives in server-only modules (`lib/cloudinary/` in each app). Browser code cannot import them.
- Rotate the API secret if it is ever exposed.

## How the integration works

1. **Signed upload request (server)** — the admin API issues a signed upload payload for the current admin after verifying the exact `media.upload` permission. The client uploads directly to Cloudinary.
2. **Registration (server)** — after upload, a protected route registers the asset metadata (public ID, secure URL, resource type, format, dimensions, duration, bytes, alt text, caption) in `media_assets`.
3. **YouTube** — a valid YouTube URL is normalized server-side to an embed URL and thumbnail URL and stored as a `youtube` media source. Arbitrary iframe HTML is rejected.
4. **Deletion (server)** — deletion uses the stored Cloudinary public ID (never an arbitrary URL) and is blocked while the asset is referenced by published content.

## Upload validation

- **Client request**: Zod validation of declared metadata (bytes, resource type, folder, format).
- **Server registration**: re-validates the actual provider metadata — Cloudinary host, folder, resource type, allowed format, and stored size.
- **Provider-side**: for defense in depth, create a Cloudinary **upload preset** that enforces the size ceiling and allowed resource types, and reference it in the signed-upload response.

## Recommended upload preset

Create an unsigned/signed upload preset in the Cloudinary dashboard with:

- Allowed resource types: `image`, `video` (Cloudinary audio uploads use the `video` resource pipeline)
- Application limits: 10 MB for images, 250 MB for video, and 50 MB for audio
- Image formats: `jpg`, `jpeg`, `png`, `webp`, `avif`
- Video formats: `mp4`, `webm`, `mov`, `m4v`
- Audio formats: `mp3`, `wav`, `m4a`, `aac`, `ogg`, `flac`
- Secure delivery enabled (HTTPS)

## Media folder convention

Uploads should target an application-owned folder such as:

```text
royz-houz/<entity>/<filename>
```

For example `royz-houz/talents/`, `royz-houz/events/`, `royz-houz/blog/`, `royz-houz/gallery/`. The folder is validated server-side at registration.

## next/image integration (public site)

Cloudinary images rendered through `next/image` require the host to be allowlisted in `web/next.config.js`:

```js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};
```

No secrets belong in `next.config.js`. The public site currently ships local fallback assets, so the build works without this file; add the allowlist before publishing Cloudinary/YouTube media.

## Environment summary

| Variable | App(s) | Server-only |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | web, admin | yes |
| `CLOUDINARY_API_KEY` | web, admin | yes |
| `CLOUDINARY_API_SECRET` | web, admin | yes |

## Troubleshooting

- **Upload succeeds but registration fails**: check the provider metadata against the allowed folder/resource type/format/size; registration is the authoritative guard.
- **Image renders broken via `next/image`**: confirm the host is in `images.remotePatterns`.
- **Deletion refused**: the asset is still referenced by published content (`media_asset_references`); replace or unlink the reference first.
