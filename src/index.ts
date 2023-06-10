#!/usr/bin/env node

import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { DiscoverOpts } from "./types.js";
import fs from "fs";
import {
    aggregateResultItems,
    getNewlyAvailableItems,
    sleep,
} from "./utils.js";
import { discover } from "./api.js";
dotenv.config();

const parsed = await yargs(hideBin(process.argv))
    .command("$1", "")
    .option("u", { alias: "user-id", type: "string" })
    .option("lng", { alias: "longitude", type: "number" })
    .option("lat", { alias: "latitude", type: "number" })
    .option("r", { alias: "radius", type: "number" })
    .option("c", { alias: "cookie", type: "string" })
    .option("a", { alias: "auth", type: "string" })
    .parse();

const oldItemsPath = "./cached.json";

function collect_opts(): Partial<DiscoverOpts> {
    const { USER_ID, LONGITUDE, LATITUDE, RADIUS, COOKIE, AUTH } = process.env;

    return {
        userId: ((parsed.userId || USER_ID) as any).toString(),
        longitude: parseFloat((parsed.longitude || LONGITUDE) as any),
        latitude: parseFloat((parsed.latitude || LATITUDE) as any),
        radius: parseFloat((parsed.radius || RADIUS) as any),
        cookie: (parsed.cookie || COOKIE) as any,
        auth: (parsed.auth || AUTH) as any,
    };
}

async function loadOldItems() {
    try {
        return JSON.parse(
            await fs.promises.readFile(oldItemsPath, {
                encoding: "utf8",
            })
        );
    } catch (err) {
        return {};
    }
}

/**
 * Refreshes cache and compares for newly available items and returns it.
 */
async function refreshCacheForNewlyAvailableItems(opts: DiscoverOpts) {
    const [oldItems, newResults] = await Promise.all([
        loadOldItems(),
        discover(opts),
    ]);
    const newItems = aggregateResultItems(newResults);

    const newlyAvailableItems = getNewlyAvailableItems(oldItems, newItems);
    await fs.promises.writeFile(
        oldItemsPath,
        JSON.stringify(newItems, null, 2),
        { encoding: "utf8" }
    );

    return newlyAvailableItems;
}

async function refresh(opts: DiscoverOpts) {
    const newlyAvailableItems = await refreshCacheForNewlyAvailableItems(opts);
    console.log("Newly available items");
    console.log(JSON.stringify(newlyAvailableItems, null, 2));
}

async function main() {
    const opts = collect_opts();
    if (!opts.userId || !opts.longitude || !opts.latitude || !opts.radius) {
        console.error("User details not specified correctly.");
        process.exit(1);
    }
    console.log("Starting with options", opts);

    while (true) {
        console.log("Refreshing results...");
        await refresh(opts as DiscoverOpts);
        console.log("Sleeping for 5 minutes...");
        await sleep(1000 * 60 * 5);
    }
}

main();
