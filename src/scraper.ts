import axios from "axios";
import cheerio from "cheerio";
import { writeLog } from "fast-node-logger";
import {
  elementToFindInPage,
  propToSearchInElements,
  keyWord,
  fetchUrl,
} from "./helpers/variables";

export async function scrap() {
  writeLog(`opening page ${fetchUrl}`, { stdout: true });

  const response = await axios.get(fetchUrl);

  if (!response.status.toString().startsWith("2")) {
    throw `url ${fetchUrl} is not valid!`;
  }

  const $ = cheerio.load(response.data);

  writeLog(`searching for keyword '${keyWord}' in href of a HTML tags`, {
    stdout: true,
  });

  /**filter s elements with content of their link contain '1080'
   * for just getting full hd links
   * otherwise return false
   */

  const rawLinks: string[] = [];

  $(elementToFindInPage).each((index, element) => {
    if (element.attribs[propToSearchInElements].includes(keyWord)) {
      rawLinks.push(element.attribs[propToSearchInElements]);
    }
  });

  return rawLinks;
}
