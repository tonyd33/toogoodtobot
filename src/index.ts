#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import {
    aggregateResultItems,
    getNewlyAvailableItems,
    ItemsById,
    sleep,
} from "./utils.js";
import { IFTTTNotifier } from "./notify.js";
import configOpts from "./config.js";
import { TGTGClient } from "./client.js";

const parsed = await yargs(hideBin(process.argv))
    .option("email", { type: "string" })
    .option("ifttt-key", { type: "string" })
    .option("skip-test", { type: "boolean", default: false })
    .option("lng", { alias: "longitude", type: "number" })
    .option("lat", { alias: "latitude", type: "number" })
    .option("r", { alias: "radius", type: "number" })
    .option("t", {
        alias: "timeout",
        type: "number",
        default: 180,
        describe: "How long to wait before refreshing in seconds",
    })
    .option("c", {
        alias: "cache",
        type: "string",
        default: "./cached.json",
        describe: "Where to store cached results",
    })
    .parse();

type AppOpts = typeof configOpts & {
    skipTest: boolean;
};

function getOpts(): AppOpts {
    return {
        email: parsed.email ?? configOpts.email,
        longitude: (parsed.longitude as number) ?? configOpts.longitude,
        latitude: (parsed.latitude as number) ?? configOpts.latitude,
        radius: (parsed.radius as number) ?? configOpts.radius,
        iftttKey: parsed.iftttKey ?? configOpts.iftttKey,
        timeout: (parsed.timeout as number) ?? configOpts.timeout,
        cache: (parsed.cache as string) ?? configOpts.timeout,
        skipTest: !!parsed.skip_test,
    };
}

async function compareAndUpdateNewItems(newItems: ItemsById) {
    const { cache } = getOpts();

    let oldItems: ItemsById | null;
    try {
        oldItems = JSON.parse(
            await fs.promises.readFile(cache, {
                encoding: "utf8",
            })
        );
    } catch (err) {
        oldItems = null;
    }

    // Cache did not exist. No items are considered new.
    if (oldItems === null) {
        return [];
    }

    const newlyAvailableItems = getNewlyAvailableItems(oldItems, newItems);
    await fs.promises.writeFile(cache, JSON.stringify(newItems, null, 2), {
        encoding: "utf8",
    });

    return newlyAvailableItems;
}

async function main() {
    const opts = getOpts();

    console.log("Starting with options:");
    console.log(opts);

    const tgtgClient = new TGTGClient({ email: opts.email });
    const notifier = new IFTTTNotifier(opts.iftttKey);

    if (!opts.skipTest) {
        console.log("Testing IFTTT configuration...");
        await notifier.sendTestNotification();
        console.log(
            "Notification sent. If you don't receive a notification within a minute, you may have misconfigured IFTTT."
        );
    }

    while (true) {
        console.log("Refreshing results...");
        const newItems = aggregateResultItems(
            await tgtgClient.discover({
                longitude: opts.longitude,
                latitude: opts.latitude,
                radius: opts.radius,
            })
        );
        const newlyAvailableItems = await compareAndUpdateNewItems(newItems);
        // await omitted purposefully. Don't need to hang on sending notifications.
        Promise.all(
            newlyAvailableItems.map((item) =>
                notifier.sendNotificationForItem(item)
            )
        );

        console.log(`Sleeping for ${opts.timeout} minutes...`);
        await sleep(1000 * opts.timeout);
    }
}

main();
