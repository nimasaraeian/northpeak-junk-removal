# Social media image upload — isolated proof of concept

Status: design-only; no production changes or deployments.

## Approved scope
- Work only in `feature/social-media-upload-draft`.
- Add a protected server-side upload endpoint for approved social assets.
- Store JPEG images in a public Vercel Blob store and return a direct HTTPS URL compatible with Instagram publishing.
- Require server-side authentication, MIME/content validation, maximum 8 MB, and a 4:5–1.91:1 aspect ratio for Instagram feed images.
- Keep Blob credentials server-side; never expose tokens in browser responses or source control.
- Do not modify existing site pages, CRM, auth, database, or live deployment.
- No automatic publication; publishing requires separate explicit approval for each post.

## Proposed implementation after review
1. Inspect existing Next.js API authentication patterns and environment setup.
2. Create a public Blob store in the correct Vercel team/project (only after approval of storage provisioning).
3. Add `@vercel/blob` dependency and an isolated Next.js route with auth and input validation.
4. Test on preview deployment using a non-production sample JPEG.
5. Verify public image URL works with Windsor.ai `create_image_post` without actually publishing.
6. Request explicit approval before merging or deploying to production.

## Operational constraint
A public upload API alone does not grant the ChatGPT image-generation runtime a direct way to send files to it. Verify the file-transfer mechanism end-to-end before promising hands-off scheduled publication.
