import puppeteer from 'puppeteer';

export const testPuppet = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.hikorea.go.kr/cvlappl/cvlapplInfoR.pt?CAT_SEQ=2190')

  await page.setViewport({width: 1080, height: 1024});
  await page.screenshot({path: 'full.png', fullPage: true});
  await browser.close();
}