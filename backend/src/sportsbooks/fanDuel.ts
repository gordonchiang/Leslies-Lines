import { ElementHandle, Page } from 'puppeteer';
import { mkdirSync } from 'fs';

export async function parsePage(page: Page): Promise<Record<string, string>> {
  const bettingLines: Record<string, string> = {};

  try {
    await page.waitForSelector('#main > div > div > div > div > div > ul', { visible: true });
  } catch {
    return bettingLines;
  }

  mkdirSync(`${__dirname}/../../lines/fanDuel/`, { recursive: true });
  await page.screenshot({ path: `${__dirname}/../../lines/fanDuel/all.png`, fullPage: true });
  bettingLines.all = 'fanDuel/all.png';

  const elementHandles = await page.$$('#main > div > div > div > div > div > ul > li > div > div > div');
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
    await handle.screenshot({ path: `${__dirname}/../../lines/${path}` });

    bettingLines[heading] = path;
  }

  return bettingLines;
}
