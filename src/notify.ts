import axios from "axios";
import { ItemElement } from "./types.js";
import PQueue from "p-queue";
import moment from "moment";

// Send at most one notification every second
const queue = new PQueue({ concurrency: 1, interval: 1000, intervalCap: 1 });

export async function sendNotificationForItem(
    item: ItemElement,
    iftttKey: string
) {
    const pictureLink = item.item.cover_picture.current_url;
    const itemPrice = formatItemPrice(item);
    const itemRating =
        item.item.average_overall_rating?.average_overall_rating.toFixed(1) ||
        null;
    const itemRatingText = itemRating ? ` (${itemRating}⭐️)` : "";
    const itemName = item.display_name;
    const distanceMeters = Math.round(item.store.distance * 1000);
    const pickupInterval = formatItemPickupInterval(item);
    const pickupIntervalText = pickupInterval
        ? ` from ${pickupInterval.start} — ${pickupInterval.end}`
        : "";

    const message = `${itemName}${itemRatingText} is on sale for $${itemPrice} ${distanceMeters}m away${pickupIntervalText}`;
    console.log(message);

    await queue.add(() =>
        axios({
            method: "POST",
            url: `https://maker.ifttt.com/trigger/toogoodtobot/with/key/${iftttKey}`,
            data: {
                value1: message,
                value2: pictureLink,
            },
        })
    );
}

/**
 * Test sending a notification to check things work.
 */
export async function testNotification(iftttKey: string) {
    await axios({
        method: "POST",
        url: `https://maker.ifttt.com/trigger/toogoodtobot/with/key/${iftttKey}`,
        data: {
            value1: "This is a test notification.",
            value2: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Too_Good_To_Go_Logo.svg/2560px-Too_Good_To_Go_Logo.svg.png",
        },
    });
}

function formatItemPrice(item: ItemElement): string {
    const { minor_units, decimals } = item.item.item_price;
    const canonical_price = minor_units / 10 ** decimals;
    return canonical_price.toString();
}

function formatItemPickupInterval(
    item: ItemElement
): { start: string; end: string } | null {
    if (!item.pickup_interval) {
        return null;
    }

    const pickupStart = moment(item.pickup_interval.start);
    const pickupEnd = moment(item.pickup_interval.end);
    return {
        start: pickupStart.format("ddd hA"),
        end: pickupEnd.format("ddd hA"),
    };
}
