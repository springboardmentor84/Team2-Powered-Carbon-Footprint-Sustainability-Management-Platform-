const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Intercept and print console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Wait for 3 seconds then stop
  try {
    await page.goto('http://localhost:4200/dashboard/analytics', { waitUntil: 'networkidle2' });
  } catch(e) {
    console.error(e);
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
