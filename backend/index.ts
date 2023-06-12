import cors from 'cors';
import express, { Request, Response } from 'express';
import { rmSync } from 'fs';
import { Browser, executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { BettingSite } from './src/types';
import * as sportsInteraction from './src/sportsbooks/sportsInteraction';
import * as playNow from './src/sportsbooks/playNow';
import * as fanDuel from './src/sportsbooks/fanDuel';

const port = process.env.PORT ?? 3001;

rmSync(`${__dirname}/lines/`, { recursive: true, force: true });

const app = express();

app.set('etag', false);

app.use(cors());
app.use((_, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

app.get('/scrape', async (req: Request, res: Response) => {
  const type: BettingSite = req.query.type as BettingSite;
  const url: string = req.query.url as string;
  console.log(`[LOG] Scraping ${type}`);

  puppeteer.use(
    StealthPlugin()
  ).launch({
    args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
    headless: 'new',
    executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : executablePath()
  }).then(async (browser: Browser) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 7680, height: 4320 });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    console.log(`[LOG] Going to ${url}`);
    await page.goto(url);

    let resp: Record<string, string>;
    try {
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
    } catch (e) {
      console.log(`[LOG] Error scraping ${type}: ${url} ${e}`);
      res.status(500).send({ message: 'Error scraping webpage' });
      return;
    }


    await page.close();
    await browser.close();

    res.send(JSON.stringify(resp));
  })
});

app.get('/lines/:source/:image', (req: Request, res: Response) => {
  const { source, image } = req.params;
  res.sendFile(`./lines/${source}/${image}`, { root: __dirname });
});

app.listen(port, () => {
  console.log(`[LOG] Server is running at http://localhost:${port}`);
});
