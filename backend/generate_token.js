const crypto = require('crypto');
function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const payload = base64url(JSON.stringify({ sub: 'fahad@example.com', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }));
const secret = Buffer.from('404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970', 'hex');
const signature = base64url(crypto.createHmac('sha256', secret).update(header + '.' + payload).digest());
console.log(header + '.' + payload + '.' + signature);
