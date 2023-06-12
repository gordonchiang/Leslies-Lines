FROM ghcr.io/puppeteer/puppeteer:20.2.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY --chown=pptruser:pptruser package*.json ./
RUN npm install
COPY . .

RUN npm run build

CMD [ "node", "dist/index.js" ]
