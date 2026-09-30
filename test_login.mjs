import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting login test...');
  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    console.log('Navigating to http://localhost:3005');
    // Using networkidle2 to wait for React to render
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle2' });
    
    // 1. Verify Login Screen is present
    const content = await page.content();
    if (content.includes('Admin Access Required') && content.includes('Authenticate')) {
      console.log('✅ PASS: Login screen rendered successfully and blocks the dashboard.');
    } else {
      console.error('WHAT WAS RENDERED:', content);
      throw new Error('❌ FAIL: Login screen NOT rendered. The app might not be protected.');
    }
    
    // 2. Fill the login form
    console.log('Entering credentials...');
    await page.type('input[type="email"]', 'admin@gmail.com');
    await page.type('input[type="password"]', 'Admin@12345');
    
    console.log('Submitting form...');
    await page.click('button[type="submit"]');
    
    // 3. Verify dashboard loads after login
    // We expect "Weekly Status Analysis" or "OfficeHub360 AI Intel" to show up.
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Weekly Status Analysis') || 
             document.body.innerText.includes('OfficeHub360 AI Intel');
    }, { timeout: 5000 });
    
    console.log('✅ PASS: Successfully authenticated and dashboard rendered.');
    
    // 4. Verify sessionStorage was set properly
    const isAuth = await page.evaluate(() => sessionStorage.getItem('officehub360_is_admin_authenticated'));
    if (isAuth === 'true') {
      console.log('✅ PASS: sessionStorage token correctly set.');
    } else {
      throw new Error('❌ FAIL: sessionStorage token not found or incorrect.');
    }
    
    console.log('\n🎉 ALL TESTS PASSED. The login requirement is officially verified.');
    process.exit(0);
  } catch (error) {
    console.error('\n🚨 TEST FAILURE:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
