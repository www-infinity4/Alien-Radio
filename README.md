# 👾 Alien Radio

Deep Space Transmissions · Channel Scanner · GP Suite AI Dashboard

Alien Radio is a responsive science-fiction radio interface with 12 real internet-radio channels, spectrum visualization, GP Suite agents, a live no-key metals board, and a verified repository commit feed.

## Real data feeds

### Live metals board — no signup and no key

The banner embeds the official free [Metal Sentinel widgets](https://metal-sentinel.com/widgets) for gold, silver, platinum, palladium, copper, nickel, aluminum, zinc, and lead in USD.

- The widgets publish real market quotes and refresh independently.
- No API key, account, prompt, placeholder price, or invented fallback is used.
- Every quote remains visibly attributed to its provider.

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
