const pseudoRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const symbolSeed = (symbol) =>
  symbol.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);

export const buildDailySeries = (symbol, days = 120) => {
  const rand = pseudoRandom(symbolSeed(symbol));
  const base = 200 + rand() * 2800;
  const series = [];
  let close = base;
  let totalVolume = 0;

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const drift = (rand() - 0.5) * 0.03;
    close = Math.max(20, close * (1 + drift));
    const volume = Math.floor(300000 + rand() * 2500000);
    totalVolume += volume;

    series.push({
      date: date.toISOString().slice(0, 10),
      close: Number(close.toFixed(2)),
      volume
    });
  }

  return { series, averageVolume: Math.round(totalVolume / days) };
};

export const computeFnOAnalysis = (series, averageVolume) => {
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const monthStart = series[Math.max(0, series.length - 21)];
  const weekStart = series[Math.max(0, series.length - 6)];

  const dailyReturn = ((latest.close - previous.close) / previous.close) * 100;
  const weeklyReturn = ((latest.close - weekStart.close) / weekStart.close) * 100;
  const monthlyReturn = ((latest.close - monthStart.close) / monthStart.close) * 100;

  const realizedVol = Math.sqrt(
    series
      .slice(-30)
      .map((item, index, arr) => {
        if (index === 0) return 0;
        return ((item.close - arr[index - 1].close) / arr[index - 1].close) ** 2;
      })
      .reduce((acc, value) => acc + value, 0) *
      (252 / 30)
  ) * 100;

  const oiChange = Number((dailyReturn * 1.8 + weeklyReturn * 0.7).toFixed(2));
  const pcr = Number(Math.max(0.5, Math.min(1.5, 1 - weeklyReturn / 25)).toFixed(2));

  let buildUp = "Neutral Build-up";
  if (dailyReturn > 0.8 && oiChange > 1) buildUp = "Long Build-up";
  if (dailyReturn < -0.8 && oiChange > 1) buildUp = "Short Build-up";
  if (dailyReturn > 0.8 && oiChange < -1) buildUp = "Short Covering";
  if (dailyReturn < -0.8 && oiChange < -1) buildUp = "Long Unwinding";

  const bias =
    monthlyReturn > 6 && pcr > 0.95
      ? "Bullish swing bias"
      : monthlyReturn < -6 && pcr < 0.9
      ? "Bearish swing bias"
      : "Range-bound / wait for breakout";

  const riskLevel = realizedVol > 36 ? "High" : realizedVol > 24 ? "Medium" : "Low";

  return {
    dailyReturn: dailyReturn.toFixed(2),
    weeklyReturn: weeklyReturn.toFixed(2),
    monthlyReturn: monthlyReturn.toFixed(2),
    realizedVol: realizedVol.toFixed(2),
    oiChange: oiChange.toFixed(2),
    pcr: pcr.toFixed(2),
    buildUp,
    bias,
    riskLevel,
    latestVolume: latest.volume.toLocaleString("en-IN"),
    averageVolume: averageVolume.toLocaleString("en-IN")
  };
};
