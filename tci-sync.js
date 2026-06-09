export default async ({ page }) => {
  const TCI_USER = 'multilix.leonardo';
  const TCI_PASS = '123456';

  const now = new Date();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const y = now.getFullYear();
  const dtInicio = `01/${m}/${y}`;
  const dtFim = `${d}/${m}/${y}`;

  await page.setViewport({ width: 1366, height: 900 });
  await page.goto('https://tcicloudaws5.com.br/Multilix/login.aspx', {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await page.waitForSelector('input[type="text"]', { timeout: 15000 });
  const inputs = await page.$$('input[type="text"]');
  await inputs[0].type(TCI_USER, { delay: 30 });
  const pass = await page.$('input[type="password"]');
  await pass.type(TCI_PASS, { delay: 30 });
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"], input[type="submit"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(8000);
  const screenshot = await page.screenshot({ encoding: 'base64' });
  return { url: page.url(), screenshot };
};
