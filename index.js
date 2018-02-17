import axios from "axios";
import fs from "fs";
import puppeteer from "puppeteer";
import zipWith from "lodash/zipWith";
import {
  BEERS_URL,
  BEER_IMAGE_TAG,
  BEER_NAME,
  BEER_TYPE,
  BEER_SHORT_DESCRIPTION
} from "./utils";

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

async function extractBeerMetadata(tag) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(BEERS_URL);
  const beerNameHandler = await page.$$(tag);

  return await Promise.all(
    beerNameHandler.map(async name => {
      try {
        return await page.evaluate(sel => sel.innerHTML, name);
      } catch (error) {
        throw error;
      }
    })
  );
}

async function fetchAllMetadata() {
  const beerNames = await extractBeerMetadata(BEER_NAME);
  const beerTypes = await extractBeerMetadata(BEER_TYPE);

  return zipWith(beerNames, beerTypes, (name, type) => {
    return {
      name,
      type
    };
  });
}

fetchAllMetadata();
