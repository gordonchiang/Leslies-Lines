import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { rmSync } from 'fs';
import { Browser, Page, executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { BettingSite } from './src/types';
import * as sportsInteraction from './src/sportsbooks/sportsInteraction';
import * as playNow from './src/sportsbooks/playNow';
import * as fanDuel from './src/sportsbooks/fanDuel';

const port = process.env.PORT ?? 4200;

rmSync(`${__dirname}/lines/`, { recursive: true, force: true });

const app: Express = express();
app.use(cors<Request>());

app.get('/scrape', async (req: Request, res: Response) => {
  const type: BettingSite = req.query.type as BettingSite;
  const url: string = req.query.url as string;
  console.log(type, url);

  puppeteer.use(
    StealthPlugin() // Add stealth plugin and use defaults (all evasion techniques)
  ).launch({
    headless: 'new',
    executablePath: executablePath()
  }).then(async (browser: Browser) => {
    const page: Page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto(url);

    let resp: Record<string, string>;
    switch (type) {
      case 'sportsInteraction':
        resp = await sportsInteraction.parsePage(page);
        break;
      case 'playNow':
        resp = await playNow.parsePage(page);
        break;
      case 'fanDuel':
        resp = await fanDuel.parsePage(page);
        break;
      default:
        resp = {};
    }

    await page.close();
    await browser.close();

    res.send(JSON.stringify(resp));
  })
});

app.get('/lines/:source/:image', async (req: Request, res: Response) => {
  const { source, image } = req.params;
  res.sendFile(`./lines/${source}/${image}`, { root: __dirname });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
