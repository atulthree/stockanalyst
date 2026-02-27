# NSE Stock Analytics (React)

A React + Vite project that shows a searchable NSE stock list. Clicking a symbol updates:

- 120-session daily price chart
- F&O style analytics (build-up, OI change estimate, PCR estimate, trend bias, risk)

## Run locally

```bash
npm install
npm run dev
```

## Notes

- This project ships with a preloaded NSE symbol universe for UI demo.
- The chart and F&O analytics are generated deterministically from symbol seed logic so the app works offline.
- Replace `src/nseStocks.js` and `src/analytics.js` with live data adapters to connect real NSE/Broker APIs.
