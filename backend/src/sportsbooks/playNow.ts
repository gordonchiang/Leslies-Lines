import { Page } from 'puppeteer';
import { mkdirSync } from 'fs';

export async function parsePage(page: Page): Promise<Record<string, string>> {
  const bettingLines: Record<string, string> = {};

  await page.waitForNavigation({ waitUntil: 'networkidle0' }); 
  
  mkdirSync(`${__dirname}/../../lines/playNow/`, { recursive: true });
  await page.screenshot({ path: `${__dirname}/../../lines/playNow/all.png`, fullPage: true });
  bettingLines.all = 'playNow/all.png';

  const elementHandles = await page.$$('div.event-markets div.event-panel');
  if (!elementHandles.length) {
    bettingLines;
  }

  for (const [ i, handle ] of elementHandles.entries()) {
    const heading = await handle.$eval('div.event-panel__heading__market-name', element => element.textContent);
    if (heading === null) {
      continue;
    }

    const path = `playNow/${i}.png`;
    await handle.screenshot({ path: `${__dirname}/../../lines/${path}` });

    bettingLines[heading] = path;
  }

  return bettingLines;
}
