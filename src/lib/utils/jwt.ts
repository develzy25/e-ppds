
export interface JwtPayload {
  sub?: string;
  userId: string;
  pondokId: string;
  periodId: string;
  roles: string[];
  permissions: string[];
  sessionVersion: number;
  permissionVersion: number;
  exp?: number;
  iat?: number;
}

const cryptoInstance = typeof crypto !== 'undefined' ? crypto : (globalThis as unknown as { crypto: Crypto }).crypto;

function base64UrlEncode(str: string): string {
  const base64 = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  return decodeURIComponent(Array.prototype.map.call(binary, (c: string) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return cryptoInstance.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  ) as Promise<CryptoKey>;
}

export async function signJwt(payload: JwtPayload, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerStr = base64UrlEncode(JSON.stringify(header));
  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const enc = new TextEncoder();
  const data = enc.encode(`${headerStr}.${payloadStr}`);
  const key = await getCryptoKey(secret);
  const signature = await cryptoInstance.subtle.sign('HMAC', key, data);
  const sigStr = arrayBufferToBase64Url(signature);
  return `${headerStr}.${payloadStr}.${sigStr}`;
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerStr, payloadStr, sigStr] = parts;
  const enc = new TextEncoder();
  const data = enc.encode(`${headerStr}.${payloadStr}`);
  const key = await getCryptoKey(secret);
  
  // Decode sigStr back to ArrayBuffer
  let base64 = sigStr.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  const isValid = await cryptoInstance.subtle.verify('HMAC', key, bytes.buffer, data);
  if (!isValid) return null;
  const payload = JSON.parse(base64UrlDecode(payloadStr)) as JwtPayload;
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}
