import { Page } from 'puppeteer';
import { mkdirSync } from 'fs';

export async function parsePage(page: Page): Promise<Record<string, string>> {
  const bettingLines: Record<string, string> = {};

  try {
    await page.waitForSelector('div.Tabs__content div[data-test="main"]');
  } catch {
    return bettingLines;
  }
  
  mkdirSync(`${__dirname}/../../lines/sportsInteraction/`, { recursive: true });
  await page.screenshot({ path: `${__dirname}/../../lines/sportsInteraction/all.png`, fullPage: true });
  bettingLines.all = 'sportsInteraction/all.png';

  const elementHandles = await page.$$('div.Tabs__content div[data-test="main"] li.LiveBettingEvents__betType');
  if (!elementHandles.length) {
    bettingLines;
  }

  for (const [ i, handle ] of elementHandles.entries()) {
    const heading = await handle.$eval('h5.Heading', element => element.textContent);
    if (heading === null) {
      continue;
    }

    const path = `sportsInteraction/${i}.png`;
    await handle.screenshot({ path: `${__dirname}/../../lines/${path}` });

    bettingLines[heading] = path;
  }

  return bettingLines;
}
