import { ElementHandle, Page } from 'puppeteer';
import { mkdirSync } from 'fs';

export async function parsePage(page: Page): Promise<Record<string, string>> {
  const bettingLines: Record<string, string> = {};

  try {
    await page.waitForSelector('div.event-markets div.event-panel');
  } catch {
    return bettingLines;
  }
  
  mkdirSync(`${__dirname}/../../lines/playNow/`, { recursive: true });
  await page.screenshot({ path: `${__dirname}/../../lines/playNow/all.png`, fullPage: true });
  bettingLines.all = 'playNow/all.png';

  const elementHandles = await page.$$('div.event-markets div.event-panel');
  if (!elementHandles.length) return bettingLines;

  for (const [ i, handle ] of elementHandles.entries()) {
    const heading = await handle.$eval('div.event-panel__heading__market-name', element => element.textContent);
    if (heading === null) continue;

    await expandCollapsedBettingLine(handle);

    const path = `playNow/${i}.png`;
    await handle.screenshot({ path: `${__dirname}/../../lines/${path}` });

    bettingLines[heading] = path;
  }

  return bettingLines;
}

async function expandCollapsedBettingLine(handle: ElementHandle<HTMLDivElement>): Promise<void> {
  const collapsedHandle = await handle.$('span.collapsed');
  await collapsedHandle?.evaluate(element => element.click());
}
