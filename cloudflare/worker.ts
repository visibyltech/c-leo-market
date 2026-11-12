interface Env {
  IMAGES: R2Bucket;
  FIREBASE_PROJECT_ID: string;
  ALLOWED_ORIGIN: string;
}
const json = (data: unknown, status = 200, origin = '*') =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization,content-type', 'access-control-allow-methods': 'POST,GET,OPTIONS', 'vary': 'Origin' } });

function decode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')), c => c.charCodeAt(0));
}
async function verifyFirebaseToken(token: string, projectId: string) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid login token');
  const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(decode(parts[1])));
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Invalid token signature');
  const keys = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com').then(r => r.json()) as {keys:Array<JsonWebKey & {kid:string}>};
  const jwk = keys.keys.find(k => k.kid === header.kid);
  if (!jwk) throw new Error('Signing key not found');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  const now = Math.floor(Date.now() / 1000);
  if (!valid || claims.aud !== projectId || claims.iss !== 'https://securetoken.google.com/' + projectId || claims.exp < now || claims.iat > now || claims.email_verified !== true || !claims.sub) throw new Error('Please sign in with a verified account');
  return { uid: claims.sub, email: String(claims.email || '').toLowerCase() };
}
export default {
  async fetch(request: Request, env: Env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': origin === allowed ? allowed : 'null', 'access-control-allow-methods': 'POST,GET,OPTIONS', 'access-control-allow-headers': 'authorization,content-type', 'vary': 'Origin' } });
    if (origin !== allowed) return json({ error: 'Origin not allowed' }, 403, 'null');
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/upload') {
      try {
        const auth = request.headers.get('Authorization') || '';
        if (!auth.startsWith('Bearer ')) return json({ error: 'Sign in required' }, 401, allowed);
        const user = await verifyFirebaseToken(auth.slice(7), env.FIREBASE_PROJECT_ID);
        const form = await request.formData();
        const file = form.get('file');
        const folder = String(form.get('folder') || '');
        if (!(file instanceof File)) return json({ error: 'Select a file' }, 400, allowed);
        const isReceipt = folder === 'receipts';
        const isImage = folder === 'products' && ['image/jpeg','image/png','image/webp'].includes(file.type);
        const isPdf = isReceipt && file.type === 'application/pdf';
        if (!isImage && !isPdf && !(isReceipt && ['image/jpeg','image/png','image/webp'].includes(file.type))) return json({ error: 'Unsupported file type' }, 415, allowed);
        if (file.size < 1 || file.size > (isReceipt ? 5 : 8) * 1024 * 1024) return json({ error: 'File is too large (maximum 5MB for receipts, 8MB for product images)' }, 413, allowed);
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : file.type === 'application/pdf' ? 'pdf' : 'jpg';
        const key = isReceipt ? `receipts/${user.uid}/${crypto.randomUUID()}.${ext}` : `products/${user.uid}/${crypto.randomUUID()}.${ext}`;
        await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { owner: user.uid, uploadedBy: user.email } });
        return json({ key, fileName: file.name, contentType: file.type, size: file.size }, 201, allowed);
      } catch (error) { return json({ error: error instanceof Error ? error.message : 'Upload failed' }, 400, allowed); }
    }
    if (request.method === 'GET' && url.pathname.startsWith('/images/')) {
      const key = url.pathname.slice('/images/'.length);
      if (!key.startsWith('products/')) return json({ error: 'Not found' }, 404, allowed);
      const object = await env.IMAGES.get(key);
      if (!object) return json({ error: 'Not found' }, 404, allowed);
      const headers = new Headers({ 'content-type': object.httpMetadata?.contentType || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': allowed });
      return new Response(object.body, { headers });
    }
    return json({ error: 'Not found' }, 404, allowed);
  }
};