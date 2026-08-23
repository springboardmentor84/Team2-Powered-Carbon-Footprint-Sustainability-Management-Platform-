const crypto = require('crypto');
function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { sub: 'Shuaib@gmail.com', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 360000 };
const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const signature = base64url(crypto.createHmac('sha256', Buffer.from('404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970', 'utf8')).update(encodedHeader + '.' + encodedPayload).digest());
console.log(encodedHeader + '.' + encodedPayload + '.' + signature);
