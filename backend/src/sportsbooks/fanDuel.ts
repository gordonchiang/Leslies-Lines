import { ElementHandle, Page } from 'puppeteer';
import { mkdirSync } from 'fs';

export async function parsePage(page: Page): Promise<Record<string, string>> {
  const bettingLines: Record<string, string> = {};

  try {
    await page.waitForXPath('/html/body/div[1]/div/div/div/div[2]/div[2]/main/div/div[1]/div/div[2]/div[4]/ul', { visible: true });
  } catch {
    return bettingLines;
  }

  mkdirSync(`${__dirname}/../../lines/fanDuel/`, { recursive: true });
  await page.screenshot({ path: `${__dirname}/../../lines/fanDuel/all.png`, fullPage: true });
  bettingLines.all = 'fanDuel/all.png';

  const elementHandles = await page.$$('#main > div > div > div > div > div > ul > li > div > div > div');
  // const elementHandles = await page.$x('//*[@id="main"]/div/div[1]/div/div[2]/div[4]/ul/li/div/div/div');
  if (!elementHandles.length) return bettingLines;

  for (const [ i, handle ] of elementHandles.entries()) {
    const heading = await handle.$eval('span', element => {
      const heading = element.textContent;
      if (!heading?.includes('Game Lines')) element.click();
      return heading;
    });
    if (heading === null) continue;
    await handle.$$eval('span', elements => {
      elements.map(e => {
        if (e.textContent?.includes('Show more')) e.click();
      })
    });
 
    const path = `fanDuel/${i}.png`;
    await handle.screenshot();
    // await screenshotXPath(page, handle, path);

    bettingLines[heading] = path;
  }

  return bettingLines;
}

async function screenshotXPath(page: Page, elementHandle: ElementHandle<Node>, path: string): Promise<void> {
  const rect = await page.evaluate(element => {
    // @ts-ignore
    const {x, y, width, height} = element.getBoundingClientRect();
    return {left: x, top: y, width, height};
  }, elementHandle);

  await page.screenshot({
    path: `${__dirname}/../../lines/${path}`,
    clip: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    },
  });
}
