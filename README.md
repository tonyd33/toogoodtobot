# TooGoodToBot

Script to check for newly available items on TooGoodToGo.

# Installation/Usage

## Create IFTTT applet for notifications

- Download IFTTT on your phone
- Create an applet:
  - If: Webhooks -> Receive a web request
    - Event Name: `toogoodtobot`
  - Then: Notifications -> Send a rich notification from the IFTTT app
    - Message: Add Ingredient -> `Value1`
    - Image URL: Add Ingredient -> `Value2`
    - Everything else: Up to you
- Create and find your IFTTT webhook key from the [IFTTT site](https://ifttt.com/maker_webhooks) and copy it down

## Install and run the script

Copy the `config.sample.ts` file to a `config.ts` file in the same directory
and fill in with your desired preferences. The IFTTT key will be the key you
received in the last step.

```sh
npm i
npx tsc
node dist/index.js
```

You will receive a test notification to check whether you configured IFTTT
correctly followed by an email from TooGoodToGo to confirm your login.

# Features
- ✅ Check when item is newly available
- ✅ Send notification when item is newly available
- ✅ Get and refresh credentials without usage of a phone/proxy
