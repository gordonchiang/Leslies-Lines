import { Page } from 'puppeteer';
import { mkdirSync } from 'fs';

export async function parsePage(page: Page): Promise<Record<string, string>> {
  const bettingLines: Record<string, string> = {};

  try {
    await selectAmericanOdds(page);
    await page.waitForSelector('div.Tabs__content div[data-test="main"]');
  } catch {
    return bettingLines;
  }
  
  mkdirSync(`${__dirname}/../../lines/sportsInteraction/`, { recursive: true });
  await page.screenshot({ path: `${__dirname}/../../lines/sportsInteraction/all.png`, fullPage: true });
  bettingLines.all = 'sportsInteraction/all.png';

  const elementHandles = await page.$$('div.Tabs__content div[data-test="main"] div.BetType--displayAllEvents.BetType');
  if (!elementHandles.length) return bettingLines;

  for (const [ i, handle ] of elementHandles.entries()) {
    const heading = await handle.$eval('h5.Heading', element => element.textContent);
    if (heading === null) continue;

    const path = `sportsInteraction/${i}.png`;
    await handle.screenshot({ path: `${__dirname}/../../lines/${path}` });

    bettingLines[heading] = path;
  }

  return bettingLines;
}

async function selectAmericanOdds(page: Page): Promise<void> {
  await page.waitForSelector('footer.Footer select.hidden-select');
  const americanOdds = await page.$$eval(
    'footer.Footer select.hidden-select option',
    options => options.find(o => o.innerText.includes('American'))?.value
  ) ?? '4'; // 4 is the option value for American odds
  await page.select('footer.Footer select.hidden-select', americanOdds);
  await new Promise(r => setTimeout(r, 1000));
}
