import axios from "axios";
import fs from "fs";
import puppeteer from "puppeteer";

import { BEERS_URL, BEER_IMAGE_TAG } from "./utils";

async function extractBeerImages() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(BEERS_URL);

  const imageHandler = await page.$$(BEER_IMAGE_TAG);
  imageHandler.forEach(async imageTag => {
    const link = await page.evaluate(sel => sel.currentSrc, imageTag);
    axios({
      method: "GET",
      url: link,
      responseType: "stream"
    }).then(res => {
      res.data.pipe(
        fs.createWriteStream(`${__dirname}/images/${link.split("/").pop()}`)
      );
    });
  });

  await page.close();
}

extractBeerImages();
