const http = require('http');

const loginData = JSON.stringify({
  email: 'Shuaib@gmail.com',
  password: 'password'
});

const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Login Response:", data);
  });
});

req.write(loginData);
req.end();
