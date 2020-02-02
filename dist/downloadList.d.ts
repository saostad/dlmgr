import { ScrapInput } from "./typings/interfaces";
export declare function getListFromUri({ uri, elementToFindInPage, propToSearchInElements, keyWord, }: ScrapInput): Promise<string[]>;
interface GetListFromFileInput {
    filePath: string;
}
export declare function getListFromFile({ filePath, }: GetListFromFileInput): Promise<string[]>;
interface SaveListToFileInput {
    filePath: string;
    data: string[];
}
export declare function saveListToFile({ filePath, data, }: SaveListToFileInput): Promise<boolean>;
interface UpdateListFileInput {
    link: string;
    status: "success" | "fail";
    filePath: string;
}
export declare function updateListFile({ link, status, filePath, }: UpdateListFileInput): Promise<boolean>;
export {};
