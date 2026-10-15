// 用內建的 Chromium 讀網頁文字（給排程搜尋用，可以讀到 curl 讀不到的動態網頁）
// 用法：NODE_PATH=$(npm root -g) node job-search/fetch.mjs <網址> [網址...]
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');

const urls = process.argv.slice(2);
const browser = await chromium.launch({
  proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  args: ['--ignore-certificate-errors'],
});
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  locale: 'zh-TW',
});
for (const u of urls) {
  const p = await ctx.newPage();
  try {
    await p.goto(u, { timeout: 45000, waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(6000);
    const text = (await p.innerText('body')).replace(/\s+/g, ' ');
    console.log(`===== ${u}\nTITLE: ${await p.title()}\n${text.slice(0, 8000)}\n`);
  } catch (e) {
    console.log(`===== ${u}\nERROR: ${e.message.split('\n')[0]}\n`);
  }
  await p.close();
}
await browser.close();
