# TooGoodToBot

Script to check for newly available items on TooGoodToGo.

# Installation/Usage

## Install proxy and get credentials

As I currently don't know a way to refresh authorization without manual usage
of the app, you must also install
[mitmproxy](https://docs.mitmproxy.org/stable/overview-installation/) (or any
other proxy tool) on your computer and [Wireguard](https://www.wireguard.com/)
on your phone so you can read http requests.

- Run `mitmweb -m wireguard` on your computer. A browser window should open with
a QR code
- Open the Wireguard app on your phone, scan the QR code and activate the VPN
- Open the TooGoodToGo app
- On mitmweb, you should be able to find entries with a URL with
  `https://app.toogoodtogo.com/api/discover`. Click on any of these entries and copy down
  the following fields:
  - cookie, in the request header
  - authorization, in the request header
  - user_id, in the request body (under the JSON field in mitmweb)
  - (Optional) longitude, latitude, radius, in the request body

Don't forget to turn off Wireguard on your phone once you're done this.

## Install and run the script

```sh
cd toogoodtobot
npm i
npx tsc
```

Create a file `.env` in the root directory of this project with the following
fields and fill it in with the information you got from the earlier step.

```
USER_ID="<your user_id>"
LONGITUDE="<your longitude>"
LATITUDE="<your latitude>"
RADIUS="<your radius>"
AUTH="<your authorization token>"
COOKIE="<your cookie>"
```

Run `node dist/index.js`.

# Features
- ✅ Check when item is newly available
- 🚧 Send notification when item is newly available
- 🚧 Get and refresh credentials without usage of a phone/proxy
