import { Page } from 'puppeteer';
import { mkdirSync } from 'fs';

export async function parsePage(page: Page): Promise<Record<string, string>> {
  const bettingLines: Record<string, string> = {};

  try {
    await page.waitForSelector('div.eventmarketgroup.marketgroup', { visible: true });
  } catch {
    return bettingLines;
  }

  mkdirSync(`${__dirname}/../../lines/fanDuel/`, { recursive: true });
  await page.screenshot({ path: `${__dirname}/../../lines/fanDuel/all.png`, fullPage: true });
  bettingLines.all = 'fanDuel/all.png';

  const elementHandles = await page.$$('div.eventmarketgroup.marketgroup div.event-market-header');

  const gameLinesHandle = await page.$('div.markets-wrapper');
  if (gameLinesHandle) {
    const heading = await gameLinesHandle.$eval('span.coupontitle', element => element.textContent);
    if (heading !== null) {
      const path = `fanDuel/-1.png`;
      await gameLinesHandle.screenshot({ path: `${__dirname}/../../lines/${path}` });
  
      bettingLines[heading] = path;
    }
  }

  if (!elementHandles.length) return bettingLines;

  for (const [ i, handle ] of elementHandles.entries()) {
    await handle.click();

    const heading = await handle.$eval('h4.market-name-title', element => element.textContent);
    if (heading === null) continue;

    const path = `fanDuel/${i}.png`;
    await handle.screenshot({ path: `${__dirname}/../../lines/${path}` });

    bettingLines[heading] = path;
  }

  return bettingLines;
}
