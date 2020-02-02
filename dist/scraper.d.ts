import { ScrapInput } from "./typings/interfaces";
export declare function scrap({ uri, keyWord, elementToFindInPage, propToSearchInElements, }: ScrapInput): Promise<string[]>;
