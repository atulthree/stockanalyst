import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { buildDailySeries, computeFnOAnalysis } from "./analytics";
import { nseStocks, stockCountLabel } from "./nseStocks";
import "./styles.css";

function App() {
  const [query, setQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(nseStocks[0].symbol);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return nseStocks;
    return nseStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(normalized) || stock.name.toLowerCase().includes(normalized)
    );
  }, [query]);

  const selectedStock = nseStocks.find((stock) => stock.symbol === selectedSymbol) ?? nseStocks[0];

  const marketData = useMemo(() => {
    const { series, averageVolume } = buildDailySeries(selectedStock.symbol);
    const fno = computeFnOAnalysis(series, averageVolume);
    return { series, fno };
  }, [selectedStock.symbol]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>NSE Stock Universe</h1>
        <p className="subtle">{stockCountLabel}</p>
        <input
          className="search"
          placeholder="Search by symbol or company"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="stock-list">
          {filtered.map((stock) => (
            <button
              key={stock.symbol}
              className={`stock-item ${stock.symbol === selectedStock.symbol ? "active" : ""}`}
              onClick={() => setSelectedSymbol(stock.symbol)}
            >
              <strong>{stock.symbol}</strong>
              <span>{stock.name}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="content">
        <header>
          <h2>{selectedStock.symbol}</h2>
          <p>{selectedStock.name}</p>
        </header>

        <section className="chart-card">
          <h3>Daily Price Chart (120 sessions)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={marketData.series} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5d8e2" />
              <XAxis dataKey="date" minTickGap={32} />
              <YAxis domain={["auto", "auto"]} width={80} />
              <Tooltip />
              <Line type="monotone" dataKey="close" stroke="#2563eb" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="analysis-grid">
          <article className="metric-card">
            <h4>F&O Build-up</h4>
            <p>{marketData.fno.buildUp}</p>
          </article>
          <article className="metric-card">
            <h4>Directional Bias</h4>
            <p>{marketData.fno.bias}</p>
          </article>
          <article className="metric-card">
            <h4>Put-Call Ratio (est.)</h4>
            <p>{marketData.fno.pcr}</p>
          </article>
          <article className="metric-card">
            <h4>OI Change (est.)</h4>
            <p>{marketData.fno.oiChange}%</p>
          </article>
          <article className="metric-card">
            <h4>Daily / Weekly Return</h4>
            <p>
              {marketData.fno.dailyReturn}% / {marketData.fno.weeklyReturn}%
            </p>
          </article>
          <article className="metric-card">
            <h4>Monthly Return</h4>
            <p>{marketData.fno.monthlyReturn}%</p>
          </article>
          <article className="metric-card">
            <h4>Realized Volatility (30D)</h4>
            <p>
              {marketData.fno.realizedVol}% ({marketData.fno.riskLevel} risk)
            </p>
          </article>
          <article className="metric-card">
            <h4>Volume Snapshot</h4>
            <p>
              {marketData.fno.latestVolume} vs avg {marketData.fno.averageVolume}
            </p>
          </article>
        </section>

        <p className="footnote">
          Analysis is model-generated from chart behavior to demonstrate F&O interpretation workflows.
        </p>
      </main>
    </div>
  );
}

export default App;
