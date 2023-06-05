import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { rmSync } from 'fs';
import { Browser, Page, executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { BettingSite } from './src/types';
import * as sportsInteraction from './src/sportsbooks/sportsInteraction';

const port = process.env.PORT ?? 4200;

rmSync(`${__dirname}/lines/`, { recursive: true, force: true });

const app: Express = express();
app.use(cors<Request>());

app.get('/', (req: Request, res: Response) => {
  res.send('hello world');
});

app.get('/scrape', async (req: Request, res: Response) => {
  const type: BettingSite = req.query.type as BettingSite;
  const url: string = req.query.url as string;
  console.log(type, url);

  puppeteer
  .use(StealthPlugin()) // Add stealth plugin and use defaults (all evasion techniques)
  .launch({ headless: 'new', executablePath: executablePath() })
  .then(async (browser: Browser) => {
    const page: Page = await browser.newPage();
    await page.goto(url);
    const resp = await sportsInteraction.parsePage(page);
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
