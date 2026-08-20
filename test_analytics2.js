const http = require('http');

const registerData = JSON.stringify({
  email: "test@example.com",
  password: "password123",
  firstName: "Test",
  lastName: "User"
});

const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
        console.log("Register Response:", body);
        const token = JSON.parse(body).token;
        if (!token) return console.log("No token");
        
        http.get({
          hostname: 'localhost',
          port: 8080,
          path: '/api/v1/analytics',
          headers: { 'Authorization': 'Bearer ' + token }
        }, (res2) => {
          let body2 = '';
          res2.on('data', chunk => body2 += chunk);
          res2.on('end', () => console.log("Analytics Response:", res2.statusCode, body2));
        });
    } catch(e) { console.log(e); }
  });
});

req.write(registerData);
req.end();
