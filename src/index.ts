#!/usr/bin/env node

import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { DiscoverOpts } from "./types.js";
import fs from "fs";
import {
    aggregateResultItems,
    getNewlyAvailableItems,
    ItemsById,
    sleep,
} from "./utils.js";
import { discover } from "./api.js";
import { sendNotificationForItem, testNotification } from "./notify.js";

dotenv.config();

const parsed = await yargs(hideBin(process.argv))
    .option("lng", { alias: "longitude", type: "number" })
    .option("lat", { alias: "latitude", type: "number" })
    .option("r", { alias: "radius", type: "number" })
    .option("t", {
        alias: "timeout",
        type: "number",
        default: 5,
        describe: "How long to wait before refreshing in minutes",
    })
    .option("c", {
        alias: "cache",
        type: "string",
        default: "./cached.json",
        describe: "Where to store cached results",
    })
    .parse();

interface AppOpts extends DiscoverOpts {
    ifttt_key: string;
    timeout: number;
    cache: string;
}

function collect_opts(): AppOpts {
    const { USER_ID, LONGITUDE, LATITUDE, RADIUS, COOKIE, AUTH, IFTTT_KEY } =
        process.env;

    const opts = {
        userId: (USER_ID as any).toString() as string,
        longitude: parseFloat((parsed.longitude || LONGITUDE) as any),
        latitude: parseFloat((parsed.latitude || LATITUDE) as any),
        radius: parseFloat((parsed.radius || RADIUS) as any),
        cookie: COOKIE,
        auth: AUTH,
        ifttt_key: IFTTT_KEY as string,
        timeout: parsed.timeout as number,
        cache: parsed.cache as string,
    };

    if (
        !opts.userId ||
        !opts.longitude ||
        !opts.latitude ||
        !opts.radius ||
        !opts.ifttt_key
    ) {
        console.error("Options are not specified correctly, got:");
        console.error(opts);
        process.exit(1);
    }

    return opts;
}

async function loadOldItems(
    opts: Pick<AppOpts, "cache">
): Promise<ItemsById | null> {
    try {
        return JSON.parse(
            await fs.promises.readFile(opts.cache, {
                encoding: "utf8",
            })
        );
    } catch (err) {
        return null;
    }
}

/**
 * Refreshes cache and compares for newly available items and returns it.
 */
async function refreshCacheForNewlyAvailableItems(opts: AppOpts) {
    const [oldItems, newResults] = await Promise.all([
        loadOldItems(opts),
        discover(opts),
    ]);
    const newItems = aggregateResultItems(newResults);
    // Cache did not exist. No items can be considered new.
    if (oldItems === null) {
        return [];
    }

    const newlyAvailableItems = getNewlyAvailableItems(oldItems, newItems);
    await fs.promises.writeFile(opts.cache, JSON.stringify(newItems, null, 2), {
        encoding: "utf8",
    });

    return newlyAvailableItems;
}

async function refresh(opts: AppOpts) {
    const newlyAvailableItems = await refreshCacheForNewlyAvailableItems(opts);
    // await omitted purposefully. Don't need to hang on sending notifications.
    Promise.all(
        newlyAvailableItems.map((item) =>
            sendNotificationForItem(item, opts.ifttt_key)
        )
    );
}

async function main() {
    const opts = collect_opts();
    console.log("Starting with options:");
    console.log(opts);

    console.log("Testing IFTTT configuration...");
    await testNotification(opts.ifttt_key);
    console.log(
        "Notification sent. If you don't receive a notification within a minute, you may have misconfigured IFTTT."
    );

    while (true) {
        console.log("Refreshing results...");
        await refresh(opts as AppOpts);
        console.log(`Sleeping for ${opts.timeout} minutes...`);
        await sleep(1000 * 60 * opts.timeout);
    }
}

main();
