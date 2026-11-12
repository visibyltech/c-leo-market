interface Env {
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_ENDPOINT: string;
  FIREBASE_PROJECT_ID?: string;
}
const DEFAULT_PROJECT_ID = 'c-leo-market';
const ALLOWED_ORIGINS = new Set(['https://c-leo-market-eight.vercel.app']);
const json = (data: unknown, status = 200, origin = '*') =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization,content-type', 'access-control-allow-methods': 'POST,GET,OPTIONS', 'vary': 'Origin' } });

function decode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')), c => c.charCodeAt(0));
}

const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (value: ArrayBuffer | string) => hex(await crypto.subtle.digest('SHA-256', typeof value === 'string' ? new TextEncoder().encode(value) : value));
const hmac = async (key: CryptoKey | ArrayBuffer, value: string) => {
  const cryptoKey = key instanceof CryptoKey ? key : await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value));
};
async function r2Request(env: Env, method: 'PUT' | 'GET', key: string, body?: ArrayBuffer, contentType = 'application/octet-stream') {
  const endpoint = new URL(env.R2_ENDPOINT);
  const path = '/' + [env.R2_BUCKET_NAME, ...key.split('/')].map(encodeURIComponent).join('/');
  const url = new URL(path, endpoint.origin);
  const now = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = now.slice(0, 8);
  const payloadHash = await sha256(body || new ArrayBuffer(0));
  const headers: Record<string,string> = { host: url.host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': now };
  if (method === 'PUT') headers['content-type'] = contentType;
  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.keys(headers).sort().map(k => k + ':' + headers[k].trim() + '\\n').join('');
  const canonicalRequest = [method, url.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\\n');
  const scope = date + '/auto/s3/aws4_request';
  const stringToSign = ['AWS4-HMAC-SHA256', now, scope, await sha256(canonicalRequest)].join('\\n');
  const kDate = await hmac(new TextEncoder().encode('AWS4' + env.R2_SECRET_ACCESS_KEY), date);
  const kRegion = await hmac(kDate, 'auto');
  const kService = await hmac(kRegion, 's3');
  const kSigning = await hmac(kService, 'aws4_request');
  const signature = hex(await hmac(kSigning, stringToSign));
  headers.authorization = 'AWS4-HMAC-SHA256 Credential=' + env.R2_ACCESS_KEY_ID + '/' + scope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;
  return fetch(url.toString(), { method, headers, body: method === 'PUT' ? body : undefined });
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
    const allowed = ALLOWED_ORIGINS.has(origin) ? origin : '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': origin === allowed ? allowed : 'null', 'access-control-allow-methods': 'POST,GET,OPTIONS', 'access-control-allow-headers': 'authorization,content-type', 'vary': 'Origin' } });
    if (origin !== allowed) return json({ error: 'Origin not allowed' }, 403, 'null');
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/upload') {
      try {
        const auth = request.headers.get('Authorization') || '';
        if (!auth.startsWith('Bearer ')) return json({ error: 'Sign in required' }, 401, allowed);
        const user = await verifyFirebaseToken(auth.slice(7), env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID);
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
        const bytes = await file.arrayBuffer();
        const put = await r2Request(env, 'PUT', key, bytes, file.type);
        if (!put.ok) throw new Error('R2 upload failed (' + put.status + ')');
        return json({ key, fileName: file.name, contentType: file.type, size: file.size }, 201, allowed);
      } catch (error) { return json({ error: error instanceof Error ? error.message : 'Upload failed' }, 400, allowed); }
    }
    if (request.method === 'GET' && url.pathname.startsWith('/receipts/')) {\n      try {\n        const auth = request.headers.get('Authorization') || '';\n        if (!auth.startsWith('Bearer ')) return json({ error: 'Sign in required' }, 401, allowed);\n        const user = await verifyFirebaseToken(auth.slice(7), env.FIREBASE_PROJECT_ID);\n        const key = url.pathname.slice(1);\n        const object = await env.IMAGES.get(key);\n        if (!object || !key.startsWith('receipts/') || (object.customMetadata?.owner !== user.uid && user.email !== 'tvplugng@gmail.com')) return json({ error: 'Not found' }, 404, allowed);\n        const headers = new Headers({ 'content-type': object.httpMetadata?.contentType || 'application/octet-stream', 'content-disposition': 'inline', 'cache-control': 'private, no-store', 'access-control-allow-origin': allowed });\n        return new Response(object.body, { headers });\n      } catch (error) { return json({ error: error instanceof Error ? error.message : 'Access denied' }, 403, allowed); }\n    }\n    if (request.method === 'GET' && url.pathname.startsWith('/images/')) {
      const key = url.pathname.slice('/images/'.length);
      if (!key.startsWith('products/')) return json({ error: 'Not found' }, 404, allowed);
      const object = await r2Request(env, 'GET', key);
      if (!object.ok) return json({ error: 'Not found' }, 404, allowed);
      const headers = new Headers({ 'content-type': object.headers.get('content-type') || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': allowed });
      return new Response(object.body, { headers });
    }
    return json({ error: 'Not found' }, 404, allowed);
  }
};