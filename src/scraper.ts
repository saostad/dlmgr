import axios from "axios";
import cheerio from "cheerio";
import { writeLog } from "fast-node-logger";
import { ScrapInput } from "./typings/interfaces";

async function getUriBody(uri: string) {
  const response = await axios.get(uri);
  if (!response.status.toString().startsWith("2")) {
    throw `url ${uri} is not valid!`;
  }
  return response.data;
}

export async function scrap({
  uri,
  keyWord,
  elementToFindInPage,
  propToSearchInElements,
}: ScrapInput) {
  writeLog(`opening page ${uri}`, { stdout: true });

  const body = await getUriBody(uri);

  const $ = cheerio.load(body);

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
