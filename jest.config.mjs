import { readFile } from "fs/promises";

/** @return {Promise<import("jest").Config>} */
const getOption = async () => {
    const swcrc = JSON.parse(await readFile(`${import.meta.dirname}/.swcrc`, "utf-8"));

    return {
        verbose: true,
        transform: {
            "^.+\\.(t|j)s?$": [ "@swc/jest", { ...swcrc } ]
        }
    }
}

export default getOption;
