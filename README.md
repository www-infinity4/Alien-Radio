# 👾 Alien Radio

Deep Space Transmissions · Channel Scanner · GP Suite AI Dashboard

Alien Radio is a responsive science-fiction radio interface with 12 real internet-radio channels, spectrum visualization, GP Suite agents, a daily metals banner, and a verified repository commit feed.

## Real data feeds

### Daily metals banner

The banner displays gold, silver, platinum, palladium, copper, nickel, aluminum, zinc, and lead prices from [Metals.Dev](https://metals.dev/docs).

- Create a free Metals.Dev key and select **Set Free Metals API Key** on Alien Radio.
- The key is saved only in that browser's local storage. Never commit an API key to this repository.
- Alien Radio makes at most one metals request per browser every 24 hours and reuses the cached response between updates.
- Precious metals are displayed in USD per troy ounce. Industrial metals are converted from the API's troy-ounce response to USD per pound.
- Missing or failed data is labeled unavailable or stale; the site does not invent replacement prices.

### Repository commit feed

The right-side feed retrieves actual commits from the public GitHub API for `www-infinity4/Alien-Radio`. Commit SHA, first message line, author, date, and GitHub link come from the API and are cached for 24 hours.

## Other features retained

- 12-channel radio scanner with real streams and local audio fallback
- Spectrum analyzer with bars, wave, and orbital modes
- GP Suite AI agent dashboard
- Quick tools, local account, Infinity-token wallet, and research interfaces
- Responsive three-column HUD

## Verification

```bash
node market-feed.test.js
node --check market-feed.js
node --check app.js
node --check auth.js
```

The project remains pure HTML, CSS, and JavaScript with no build dependency.
