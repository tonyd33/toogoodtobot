import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { DiscoverOpts } from "./types.js";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

export async function discover(opts: DiscoverOpts) {
    const {
        userId,
        longitude,
        latitude,
        radius,
        cookie,
        auth: authorization,
    } = opts;

    const response = await client.post(
        "https://apptoogoodtogo.com/api/discover/v1/",
        {
            experimental_group: "Default",
            debug_mode: false,
            user_id: userId,
            supported_buckets: [
                {
                    type: "ACTION",
                    display_types: [
                        "CAROUSEL",
                        "DONATION",
                        "HOW_IT_WORKS",
                        "JOB_APPLICATION",
                        "RATE_ORDER",
                        "USER_REFERRAL",
                    ],
                },
                {
                    type: "HEADER",
                    display_types: [
                        "SOLD_OUT",
                        "ALMOST_SOLD_OUT",
                        "NOTHING_NEARBY",
                        "NOT_LIVE_HERE",
                    ],
                },
                {
                    type: "ITEM",
                    display_types: [
                        "CATEGORY",
                        "CLASSIC",
                        "FAVORITES",
                        "RECOMMENDATIONS",
                        "PREFERENCES",
                        "CHARITY",
                        "VERTICAL",
                    ],
                },
                {
                    type: "STORE",
                    display_types: ["LOGO_ONLY"],
                },
            ],
            origin: {
                longitude,
                latitude,
            },
            radius,
        },
        {
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "accept-language": "en-CA",
                "user-agent":
                    "TooGoodToGo/23.5.0 (9843) (iPhone/iPhone 11; iOS 16.0.2; Scale/2.00/iOS)",
                cookie,
                authorization,
            },
        }
    );
    return response.data;
}
