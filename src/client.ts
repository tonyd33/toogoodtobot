import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { DiscoverResults } from "./types.js";
import { sleep } from "./utils.js";

const baseURL = "https://apptoogoodtogo.com/api/";

const defaults = {
    maxPollingRetries: 20,
    pollingTimeoutSeconds: 5, // About default for TGTG app
    deviceType: "IOS",
};

interface TGTGClientOpts {
    email: string;
    deviceType: string;
    maxPollingRetries: number;
    pollingTimeoutSeconds: number;
}

export class TGTGClient implements TGTGClientOpts {
    // === TGTGClientOpts ===
    email: string;
    deviceType: string;
    maxPollingRetries: number;
    pollingTimeoutSeconds: number;
    // ======================

    accessToken: string | null;
    refreshToken: string | null;
    userId: string | null;
    lastRefreshedTimeMs: number;
    nextRefreshTimeMs: number;

    client: AxiosInstance;

    constructor(
        opts: {
            email: string;
        } & Partial<Exclude<TGTGClientOpts, "email">>
    ) {
        this.email = opts.email;

        this.deviceType = opts.deviceType ?? defaults.deviceType;
        this.maxPollingRetries =
            opts.maxPollingRetries ?? defaults.maxPollingRetries;
        this.pollingTimeoutSeconds =
            opts.pollingTimeoutSeconds ?? defaults.pollingTimeoutSeconds;

        this.accessToken = null;
        this.refreshToken = null;
        this.userId = null;
        this.lastRefreshedTimeMs = 0;
        this.nextRefreshTimeMs = 0;

        this.client = wrapper(
            axios.create({
                jar: new CookieJar(),
                baseURL,
                headers: {
                    "Accept-Language": "en-CA",
                    "User-Agent":
                        "TooGoodToGo/23.5.0 (9843) (iPhone/iPhone 11; iOS 16.0.2; Scale/2.00/iOS)",
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            })
        );
    }

    async waitForEmail(pollingId: string) {
        const failedError = new Error(
            "Unexpected error while waiting for email confirmation."
        );
        for (let i = 0; i < defaults.maxPollingRetries; i++) {
            const response = await this.client.post(
                "auth/v3/authByRequestPollingId",
                {
                    device_type: this.deviceType,
                    email: this.email,
                    request_polling_id: pollingId,
                }
            );
            if (response.status === 200) {
                this.setTokens(response.data);
                return;
            } else if (response.status === 202) {
                console.log("Waiting to confirm email...");
                await sleep(this.pollingTimeoutSeconds * 1000);
                continue;
            } else {
                throw failedError;
            }
        }

        throw failedError;
    }

    get isLoggedIn() {
        return !!this.userId && !!this.accessToken;
    }

    setTokens({
        access_token,
        access_token_ttl_seconds,
        refresh_token,
    }: {
        access_token: string;
        access_token_ttl_seconds: number;
        refresh_token: string;
    }) {
        this.accessToken = access_token;
        this.refreshToken = refresh_token;
        this.lastRefreshedTimeMs = Date.now();
        this.nextRefreshTimeMs =
            this.lastRefreshedTimeMs + access_token_ttl_seconds * 1000;

        this.client.defaults.headers.common[
            "Authorization"
        ] = `Bearer ${access_token}`;
    }

    /*
     * Refresh token if TTL has expired
     */
    async tryRefreshToken() {
        if (Date.now() < this.nextRefreshTimeMs) {
            return;
        }
        const response = await this.client.post("auth/v3/token/refresh", {
            device_type: this.deviceType,
            email: this.email,
        });
        this.setTokens(response.data);
    }

    public async login() {
        // Not first time logging in. Just refresh token
        if (this.isLoggedIn) {
            this.tryRefreshToken();
            return;
        }

        // Otherwise log in and grab credentials.
        const authByEmailResponse = await this.client.post(
            "auth/v3/authByEmail",
            {
                device_type: this.deviceType,
                email: this.email,
            }
        );
        if (authByEmailResponse.data.state !== "WAIT") {
            throw new Error("Email not activated.");
        }
        await this.waitForEmail(authByEmailResponse.data.polling_id);

        const startupResponse = await this.client.post("app/v1/onStartup", {});
        this.userId = startupResponse.data.user.user_id;
    }

    public async discover(opts: {
        longitude: number;
        latitude: number;
        radius: number;
    }): Promise<DiscoverResults> {
        await this.login();
        const response = await this.client.post("discover/v1", {
            user_id: this.userId,
            experimental_group: "Default",
            debug_mode: false,
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
                longitude: opts.longitude,
                latitude: opts.latitude,
            },
            radius: opts.radius,
        });
        return response.data;
    }
}
