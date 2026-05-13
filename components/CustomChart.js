import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_OVERLAYS = { ema20: true, ema50: true, rsi: true, atr: true };
const TIMEFRAMES = [
  { label: "1A", range: "1mo", interval: "1d" },
  { label: "3A", range: "3mo", interval: "1d" },
  { label: "6A", range: "6mo", interval: "1d" },
  { label: "1Y", range: "1y", interval: "1d" },
  { label: "5Y", range: "5y", interval: "1wk" }
];

export const CHART_OVERLAYS = [
  {
    key: "ema20",
    label: "EMA20",
    priceScaleId: "right",
    color: "#a7f3d0",
    buildData: (candles) => calculateEMA(candles, 20),
    seriesOptions: {
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false
    }
  },
  {
    key: "ema50",
    label: "EMA50",
    priceScaleId: "right",
    color: "#38bdf8",
    buildData: (candles) => calculateEMA(candles, 50),
    seriesOptions: {
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false
    }
  },
  {
    key: "rsi",
    label: "RSI",
    priceScaleId: "rsi",
    color: "#34d399",
    buildData: (candles) => calculateRSI(candles, 14),
    scaleOptions: { visible: false, scaleMargins: { top: 0.72, bottom: 0.1 } },
    seriesOptions: {
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: { type: "custom", formatter: (value) => `RSI ${Math.round(value)}` }
    }
  },
  {
    key: "atr",
    label: "ATR",
    priceScaleId: "atr",
    color: "#fbbf24",
    buildData: (candles) => calculateATR(candles, 14),
    scaleOptions: { visible: false, scaleMargins: { top: 0.84, bottom: 0.02 } },
    seriesOptions: {
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: { type: "custom", formatter: (value) => `ATR ${Number(value).toFixed(2)}` }
    }
  }
];

export default function CustomChart({ symbol, height = 520, overlays = DEFAULT_OVERLAYS, onMetaChange }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enabledOverlays, setEnabledOverlays] = useState(overlays);
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[2]);
  const [activeCandle, setActiveCandle] = useState(null);

  useEffect(() => {
    setEnabledOverlays(overlays);
  }, [overlays]);

  useEffect(() => {
    let cancelled = false;
    let firstLoad = true;

    async function loadChart() {
      try {
        if (firstLoad) setLoading(true);
        setError("");
        const response = await fetch(
          `/api/chart?symbol=${encodeURIComponent(symbol)}&range=${timeframe.range}&interval=${timeframe.interval}`
        );
        const data = await response.json();
        if (!cancelled) {
          setPayload(data);
          setActiveCandle(data.candles?.at(-1) || null);
          onMetaChange?.(data);
        }
      } catch (chartError) {
        if (!cancelled) setError(chartError.message || "Grafik verisi alinamadi");
      } finally {
        if (!cancelled) setLoading(false);
        firstLoad = false;
      }
    }

    loadChart();
    const timer = window.setInterval(loadChart, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [symbol, timeframe, onMetaChange]);

  const candles = useMemo(() => payload?.candles || [], [payload]);
  const previousClose = payload?.previousClose;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !candles.length) return undefined;
    let removed = false;
    let resizeObserver;

    async function buildChart() {
      const { CandlestickSeries, ColorType, CrosshairMode, HistogramSeries, LineSeries, LineStyle, createChart } = await import(
        "lightweight-charts"
      );
      if (removed || !containerRef.current) return;

      chartRef.current?.remove();
      chartRef.current = null;
      const candleByTime = new Map(candles.map((candle) => [String(candle.time), candle]));

      const chart = createChart(container, {
        width: container.clientWidth,
        height,
        layout: {
          background: { type: ColorType.Solid, color: "#081011" },
          textColor: "rgba(226, 232, 240, 0.72)",
          fontFamily: "Inter, system-ui, sans-serif"
        },
        grid: {
          vertLines: { color: "rgba(148, 163, 184, 0.08)" },
          horzLines: { color: "rgba(148, 163, 184, 0.08)" }
        },
        rightPriceScale: {
          borderColor: "rgba(148, 163, 184, 0.18)",
          scaleMargins: { top: 0.08, bottom: 0.22 }
        },
        timeScale: {
          borderColor: "rgba(148, 163, 184, 0.18)",
          barSpacing: 9,
          minBarSpacing: 3,
          rightOffset: 8,
          timeVisible: true,
          secondsVisible: false
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: "rgba(52, 211, 153, 0.34)", labelBackgroundColor: "#059669" },
          horzLine: { color: "rgba(52, 211, 153, 0.34)", labelBackgroundColor: "#059669" }
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: false
        },
        localization: {
          locale: "tr-TR",
          priceFormatter: (price) =>
            Number(price).toLocaleString("tr-TR", {
              maximumFractionDigits: symbol === "BIST100" ? 2 : 2,
              minimumFractionDigits: 2
            })
        }
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#ef6a4c",
        borderUpColor: "#65f4c2",
        borderDownColor: "#ff8b6b",
        wickUpColor: "#7fffd4",
        wickDownColor: "#ff9b7b",
        priceLineColor: "#34d399",
        lastValueVisible: true,
        priceLineVisible: true
      });
      candleSeries.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
      if (Number.isFinite(Number(previousClose))) {
        candleSeries.createPriceLine({
          price: Number(previousClose),
          color: "rgba(226, 232, 240, 0.38)",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: "Onceki"
        });
      }

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceScaleId: "volume",
        priceFormat: { type: "volume" },
        priceLineVisible: false,
        lastValueVisible: false
      });
      volumeSeries.setData(
        candles.map((item) => ({
          time: item.time,
          value: item.volume || 0,
          color: item.close >= item.open ? "rgba(0, 208, 156, 0.24)" : "rgba(239, 106, 76, 0.24)"
        }))
      );
      chart.priceScale("volume").applyOptions({ visible: false, scaleMargins: { top: 0.82, bottom: 0 } });

      CHART_OVERLAYS.forEach((definition) => {
        if (!enabledOverlays[definition.key]) return;
        const indicatorData = definition.buildData(candles);
        if (!indicatorData.length) return;
        const series = chart.addSeries(LineSeries, {
          ...definition.seriesOptions,
          priceScaleId: definition.priceScaleId,
          color: definition.color
        });
        series.setData(indicatorData);
        if (definition.scaleOptions) {
          chart.priceScale(definition.priceScaleId).applyOptions(definition.scaleOptions);
        }
      });

      chart.subscribeCrosshairMove((param) => {
        const crosshairCandle = param.seriesData?.get(candleSeries);
        setActiveCandle(
          crosshairCandle?.time ? candleByTime.get(String(crosshairCandle.time)) || crosshairCandle : candles.at(-1) || null
        );
      });
      chart.timeScale().fitContent();
      chartRef.current = chart;
      resizeObserver = new ResizeObserver(() => {
        chart.applyOptions({ width: container.clientWidth, height });
      });
      resizeObserver.observe(container);
    }

    buildChart();
    return () => {
      removed = true;
      resizeObserver?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, [candles, enabledOverlays, height, previousClose, symbol]);

  const displayCandle = activeCandle || candles.at(-1) || null;
  const lastPrice = payload?.lastPrice;
  const changePercent = payload?.changePercent;

  return (
    <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[#081011]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-ticker text-[10px] uppercase tracking-wider text-white/40">
            {payload?.isLive ? "Canli veri" : "Yedek veri"} / {payload?.yahooSymbol || symbol}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="font-display text-xl font-bold text-white">{formatPrice(lastPrice)}</span>
            <span className={Number(changePercent) >= 0 ? "font-ticker text-sm text-emerald-300" : "font-ticker text-sm text-red-300"}>
              {formatChange(changePercent)}
            </span>
            {displayCandle && (
              <span className="font-ticker text-xs text-white/60">
                O {formatPrice(displayCandle.open)} H {formatPrice(displayCandle.high)} L {formatPrice(displayCandle.low)} C{" "}
                {formatPrice(displayCandle.close)} V {formatVolume(displayCandle.volume)}
              </span>
            )}
            <span className="font-ticker text-xs text-white/40">{formatUpdated(payload?.updatedAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="mr-1 flex rounded-md border border-white/10 bg-white/[0.03] p-1">
            {TIMEFRAMES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setTimeframe(item)}
                className={`rounded px-2.5 py-1 font-ticker text-xs transition ${
                  item.label === timeframe.label ? "bg-emerald-400/[0.18] text-emerald-100" : "text-white/50 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {CHART_OVERLAYS.map((overlay) => (
            <button
              key={overlay.key}
              type="button"
              onClick={() => setEnabledOverlays((current) => ({ ...current, [overlay.key]: !current[overlay.key] }))}
              className={`rounded-md border px-3 py-1.5 font-ticker text-xs transition ${
                enabledOverlays[overlay.key]
                  ? "border-emerald-400/40 bg-emerald-400/[0.12] text-emerald-200"
                  : "border-white/10 bg-white/[0.03] text-white/50"
              }`}
            >
              {overlay.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="w-full" style={{ height }} />
      {(loading || error || !candles.length) && (
        <div className="absolute inset-x-0 bottom-0 top-[68px] grid place-items-center bg-[#081011]/70 text-sm text-white/60">
          {error || (loading ? "Grafik verisi yukleniyor" : "Grafik verisi bekleniyor")}
        </div>
      )}
    </section>
  );
}

function calculateRSI(candles, period) {
  if (candles.length <= period) return [];
  let gain = 0;
  let loss = 0;
  const result = [];

  for (let index = 1; index < candles.length; index += 1) {
    const delta = candles[index].close - candles[index - 1].close;
    const up = Math.max(delta, 0);
    const down = Math.max(-delta, 0);

    if (index <= period) {
      gain += up;
      loss += down;
      if (index === period) {
        gain /= period;
        loss /= period;
      } else {
        continue;
      }
    } else {
      gain = (gain * (period - 1) + up) / period;
      loss = (loss * (period - 1) + down) / period;
    }

    const rs = loss === 0 ? 100 : gain / loss;
    result.push({ time: candles[index].time, value: Math.round((100 - 100 / (1 + rs)) * 100) / 100 });
  }

  return result;
}

function calculateEMA(candles, period) {
  if (candles.length < period) return [];
  const multiplier = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((sum, candle) => sum + candle.close, 0) / period;
  const result = [{ time: candles[period - 1].time, value: Math.round(ema * 100) / 100 }];

  for (let index = period; index < candles.length; index += 1) {
    ema = (candles[index].close - ema) * multiplier + ema;
    result.push({ time: candles[index].time, value: Math.round(ema * 100) / 100 });
  }

  return result;
}

function calculateATR(candles, period) {
  if (candles.length <= period) return [];
  const result = [];
  let atr = 0;

  for (let index = 1; index < candles.length; index += 1) {
    const current = candles[index];
    const previous = candles[index - 1];
    const trueRange = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    if (index <= period) {
      atr += trueRange;
      if (index === period) {
        atr /= period;
      } else {
        continue;
      }
    } else {
      atr = (atr * (period - 1) + trueRange) / period;
    }

    result.push({ time: current.time, value: Math.round(atr * 100) / 100 });
  }

  return result;
}

function formatPrice(value) {
  if (!Number.isFinite(Number(value))) return "-";
  return Number(value).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChange(value) {
  if (!Number.isFinite(Number(value))) return "0.00%";
  return `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}%`;
}

function formatVolume(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  if (number >= 1000000000) return `${(number / 1000000000).toFixed(1)}B`;
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return String(Math.round(number));
}

function formatUpdated(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}
