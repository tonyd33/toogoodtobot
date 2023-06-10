import { BucketType, DiscoverResults, ItemElement } from "./types.js";
import _ from "lodash";

interface ItemsById {
    [id: string]: ItemElement;
}

/**
 * Collects all items in results, deduplicates and keys by item id.
 */
export function aggregateResultItems(results: DiscoverResults): ItemsById {
    const items = [];
    for (const bucket of results.buckets) {
        if (bucket.bucket_type === BucketType.Item) {
            items.push(...(bucket.items ?? []));
        }
    }
    const uniqueItems = _.uniqBy(
        items,
        (item: ItemElement) => item.item.item_id
    );
    return _.zipObject(
        uniqueItems.map((item) => item.item.item_id),
        uniqueItems
    );
}

/**
 * Return items that were previously were unavailable but are now available.
 */
export function getNewlyAvailableItems(
    itemsBefore: ItemsById,
    itemsAfter: ItemsById
): ItemElement[] {
    return Object.keys(itemsBefore)
        .map((itemId) =>
            itemsBefore[itemId].items_available === 0 &&
            itemsAfter[itemId]?.items_available > 0
                ? itemsAfter[itemId]
                : null
        )
        .filter((x) => x !== null) as ItemElement[];
}

export async function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}
