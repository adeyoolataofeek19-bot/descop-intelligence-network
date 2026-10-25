/* =========================================
   DESCOP ADVANCED TERMINAL
   PART 1 — LIVE CRYPTO MARKET DATA
========================================= */

"use strict";

const TerminalApp = {
    api: "https://api.coingecko.com/api/v3",

    assets: {
        bitcoin: {
            symbol: "BTC",
            name: "Bitcoin"
        },
        ethereum: {
            symbol: "ETH",
            name: "Ethereum"
        },
        solana: {
            symbol: "SOL",
            name: "Solana"
        }
    },

    selectedAsset: "bitcoin",
    marketData: null,
    prices: {},
    chartHistory: [],
    refreshTimer: null
};


/* =========================================
   DOM HELPERS
========================================= */

function terminalElement(id) {
    return document.getElementById(id);
}


function terminalText(id, value) {
    const element = terminalElement(id);

    if (element) {
        element.textContent = value;
    }
}


function terminalNumber(value, decimals = 2) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "--";
    }

    return number.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}


function terminalMoney(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "--";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: number >= 1000 ? 0 : 2
    }).format(number);
}


function terminalCompactMoney(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "--";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2
    }).format(number);
}


function terminalPercent(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "--";
    }

    return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}


/* =========================================
   CONNECTION STATUS
========================================= */

function setTerminalStatus(message, state = "loading") {
    terminalText("terminalConnectionStatus", message);

    const status = terminalElement("terminal-connection-status")
        || terminalElement("terminalConnectionStatus")?.parentElement;

    if (!status) {
        return;
    }

    status.classList.remove(
        "is-connected",
        "is-error",
        "is-loading"
    );

    status.classList.add(`is-${state}`);
}


/* =========================================
   FETCH WITH TIMEOUT
========================================= */

async function terminalFetch(url, timeout = 15000) {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeout);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(
                `Market API returned HTTP ${response.status}`
            );
        }

        return await response.json();

    } finally {
        clearTimeout(timeoutId);
    }
}


/* =========================================
   LOAD GLOBAL MARKET METRICS
========================================= */

async function loadTerminalGlobalMarket() {
    const url =
        `${TerminalApp.api}/global`;

    try {
        const response = await terminalFetch(url);
        const data = response.data;

        if (!data) {
            throw new Error("Global market data is unavailable.");
        }

        TerminalApp.marketData = data;

        terminalText(
            "terminalMarketCap",
            terminalCompactMoney(
                data.total_market_cap?.usd
            )
        );

        terminalText(
            "terminalMarketVolume",
            terminalCompactMoney(
                data.total_volume?.usd
            )
        );

        terminalText(
            "terminalBtcDominance",
            `${terminalNumber(data.market_cap_percentage?.btc, 2)}%`
        );

        terminalText(
            "terminalMarketCapChange",
            terminalPercent(
                data.market_cap_change_percentage_24h_usd
            ) + " in 24h"
        );

        terminalText(
            "overviewDataStatus",
            "LIVE DATA RECEIVED"
        );

    } catch (error) {
        console.error(
            "DESCOP global market error:",
            error
        );

        terminalText(
            "overviewDataStatus",
            "DATA UNAVAILABLE"
        );

        terminalText(
            "terminalMarketCap",
            "Unavailable"
        );

        terminalText(
            "terminalMarketVolume",
            "Unavailable"
        );

        terminalText(
            "terminalBtcDominance",
            "Unavailable"
        );

        terminalText(
            "terminalMarketCapChange",
            "Unable to retrieve data"
        );

        throw error;
    }
}


/* =========================================
   LOAD CRYPTOCURRENCY PRICES
========================================= */

async function loadTerminalPrices() {
    const url =
        `${TerminalApp.api}/simple/price` +
        "?ids=bitcoin,ethereum,solana" +
        "&vs_currencies=usd" +
        "&include_24hr_change=true" +
        "&include_24hr_vol=true" +
        "&include_market_cap=true";

    try {
        const data = await terminalFetch(url);

        if (!data.bitcoin || !data.ethereum || !data.solana) {
            throw new Error("Some cryptocurrency prices are missing.");
        }

        TerminalApp.prices = data;

        updateTerminalPriceCards();
        updateTerminalWatchlist();
        updateSelectedAssetPrice();

        return data;

    } catch (error) {
        console.error(
            "DESCOP crypto price error:",
            error
        );

        terminalText(
            "watchlistStatus",
            "Unable to retrieve prices. Please retry shortly."
        );

        throw error;
    }
}


/* =========================================
   UPDATE BTC OVERVIEW CARD
========================================= */

function updateTerminalPriceCards() {
    const btc = TerminalApp.prices.bitcoin;

    if (!btc) {
        return;
    }

    terminalText(
        "terminalBtcPrice",
        terminalMoney(btc.usd)
    );

    terminalText(
        "terminalBtcChange",
        terminalPercent(btc.usd_24h_change) + " in 24h"
    );

    setTerminalChangeColor(
        "terminalBtcChange",
        btc.usd_24h_change
    );
}


/* =========================================
   UPDATE WATCHLIST
========================================= */

function updateTerminalWatchlist() {
    const watchlist = [
        {
            id: "bitcoin",
            priceId: "watchBTCPrice",
            changeId: "watchBTCChange"
        },
        {
            id: "ethereum",
            priceId: "watchETHPrice",
            changeId: "watchETHChange"
        },
        {
            id: "solana",
            priceId: "watchSOLPrice",
            changeId: "watchSOLChange"
        }
    ];

    watchlist.forEach((asset) => {
        const data = TerminalApp.prices[asset.id];

        if (!data) {
            return;
        }

        terminalText(
            asset.priceId,
            terminalMoney(data.usd)
        );

        terminalText(
            asset.changeId,
            terminalPercent(data.usd_24h_change)
        );

        setTerminalChangeColor(
            asset.changeId,
            data.usd_24h_change
        );
    });

    terminalText(
        "watchlistStatus",
        "Prices supplied by CoinGecko. Values may be delayed."
    );
}


/* =========================================
   UPDATE PRICE CHANGE COLORS
========================================= */

function setTerminalChangeColor(id, change) {
    const element = terminalElement(id);

    if (!element) {
        return;
    }

    element.classList.remove(
        "signal-positive",
        "signal-negative",
        "signal-neutral"
    );

    const value = Number(change);

    if (!Number.isFinite(value)) {
        element.classList.add("signal-neutral");
    } else if (value > 0) {
        element.classList.add("signal-positive");
    } else if (value < 0) {
        element.classList.add("signal-negative");
    } else {
        element.classList.add("signal-neutral");
    }
}


/* =========================================
   SELECTED ASSET PRICE
========================================= */

function updateSelectedAssetPrice() {
    const assetId = TerminalApp.selectedAsset;
    const asset = TerminalApp.assets[assetId];
    const data = TerminalApp.prices[assetId];

    if (!asset || !data) {
        return;
    }

    terminalText(
        "selectedAssetSymbol",
        `${asset.symbol} / USD`
    );

    terminalText(
        "selectedAssetPrice",
        terminalMoney(data.usd)
    );

    terminalText(
        "selectedAssetChange",
        terminalPercent(data.usd_24h_change) + " in 24h"
    );

    terminalText(
        "chartAssetTitle",
        `${asset.name.toUpperCase()} / USD`
    );

    setTerminalChangeColor(
        "selectedAssetChange",
        data.usd_24h_change
    );
}


/* =========================================
   REFRESH MARKET DATA
========================================= */

async function refreshTerminalMarketData() {
    setTerminalStatus("CONNECTING TO MARKET DATA", "loading");

    const results = await Promise.allSettled([
        loadTerminalGlobalMarket(),
        loadTerminalPrices()
    ]);

    const successCount = results.filter(
        result => result.status === "fulfilled"
    ).length;

    if (successCount === results.length) {
        setTerminalStatus("MARKET DATA CONNECTED", "connected");
    } else if (successCount > 0) {
        setTerminalStatus("PARTIAL MARKET DATA", "error");
    } else {
        setTerminalStatus("MARKET DATA UNAVAILABLE", "error");
    }
}


/* =========================================
   START TERMINAL DATA CONNECTION
========================================= */

function startTerminalMarketData() {
    refreshTerminalMarketData();

    if (TerminalApp.refreshTimer) {
        clearInterval(TerminalApp.refreshTimer);
    }

    // Refresh prices and global metrics every 60 seconds.
    TerminalApp.refreshTimer = setInterval(() => {
        refreshTerminalMarketData();
    }, 60000);

    // Display the current year automatically.
    terminalText(
        "terminalCurrentYear",
        new Date().getFullYear()
    );
}


/* =========================================
   INITIALIZE PART 1
========================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        startTerminalMarketData,
        { once: true }
    );
} else {
    startTerminalMarketData();
}
/* =========================================
   PART 2 — INTERACTIVE CRYPTO CHART ENGINE
========================================= */

const TerminalCharts = {
    mainChart: null,
    candleSeries: null,
    lineSeries: null,
    activeSeries: null,
    candles: [],
    prices: [],
    volumes: [],
    timeframe: 1,
    mode: "candles",
    loading: false,
    requestId: 0
};


/* =========================================
   CHART CONFIGURATION
========================================= */

function terminalChartOptions(element) {
    return {
        width: element.clientWidth,
        height: element.clientHeight,

        layout: {
            background: {
                type: "solid",
                color: "#100b18"
            },
            textColor: "#b7adc5",
            attributionLogo: false
        },

        grid: {
            vertLines: {
                color: "rgba(216,173,98,0.07)"
            },
            horzLines: {
                color: "rgba(216,173,98,0.07)"
            }
        },

        crosshair: {
            mode: 0
        },

        rightPriceScale: {
            borderColor: "rgba(216,173,98,0.18)"
        },

        timeScale: {
            borderColor: "rgba(216,173,98,0.18)",
            timeVisible: true,
            secondsVisible: false
        },

        handleScroll: true,
        handleScale: true
    };
}


/* =========================================
   CREATE MAIN PRICE CHART
========================================= */

function createTerminalPriceChart() {
    const container = terminalElement("terminalPriceChart");

    if (!container) {
        return;
    }

    if (!window.LightweightCharts) {
        terminalText(
            "terminalChartStatus",
            "Chart library unavailable. Check your internet connection."
        );
        return;
    }

    if (TerminalCharts.mainChart) {
        TerminalCharts.mainChart.remove();
    }

    TerminalCharts.mainChart =
        LightweightCharts.createChart(
            container,
            terminalChartOptions(container)
        );

    TerminalCharts.candleSeries =
        TerminalCharts.mainChart.addSeries(
            LightweightCharts.CandlestickSeries,
            {
                upColor: "#4bd6a0",
                downColor: "#ff7185",
                borderUpColor: "#4bd6a0",
                borderDownColor: "#ff7185",
                wickUpColor: "#4bd6a0",
                wickDownColor: "#ff7185",
                priceLineVisible: true
            }
        );

    TerminalCharts.lineSeries =
        TerminalCharts.mainChart.addSeries(
            LightweightCharts.LineSeries,
            {
                color: "#d8ad62",
                lineWidth: 2,
                priceLineVisible: true,
                crosshairMarkerRadius: 4
            }
        );

    TerminalCharts.activeSeries =
        TerminalCharts.candleSeries;

    TerminalCharts.lineSeries.applyOptions({
        visible: false
    });

    // Automatically resize the chart when its container changes.
    if (window.ResizeObserver) {
        const observer = new ResizeObserver(() => {
            if (TerminalCharts.mainChart && container.clientWidth > 0) {
                TerminalCharts.mainChart.applyOptions({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }
        });

        observer.observe(container);
    }

    loadTerminalHistoricalData();
}


/* =========================================
   FETCH HISTORICAL CANDLE DATA
========================================= */

async function fetchTerminalCandles(assetId, days, requestId) {
    const url =
        `${TerminalApp.api}/coins/${assetId}/ohlc` +
        `?vs_currency=usd&days=${days}`;

    const response = await terminalFetch(url, 20000);

    if (!Array.isArray(response)) {
        throw new Error("Invalid historical candle response.");
    }

    if (requestId !== TerminalCharts.requestId) {
        return [];
    }

    const candles = response
        .filter(row =>
            Array.isArray(row) &&
            row.length >= 5 &&
            row.slice(0, 5).every(value => Number.isFinite(Number(value)))
        )
        .map(row => ({
            time: Math.floor(Number(row[0]) / 1000),
            open: Number(row[1]),
            high: Number(row[2]),
            low: Number(row[3]),
            close: Number(row[4])
        }))
        .sort((a, b) => a.time - b.time);

    // Remove duplicate timestamps.
    return candles.filter((candle, index, array) =>
        index === 0 || candle.time > array[index - 1].time
    );
}


/* =========================================
   FETCH HISTORICAL PRICE DATA
========================================= */

async function fetchTerminalPriceHistory(assetId, days, requestId) {
    const interval = days <= 1 ? "hourly" : "daily";

    const url =
        `${TerminalApp.api}/coins/${assetId}/market_chart` +
        `?vs_currency=usd&days=${days}&interval=${interval}`;

    const response = await terminalFetch(url, 20000);

    if (requestId !== TerminalCharts.requestId) {
        return [];
    }

    if (!Array.isArray(response.prices)) {
        throw new Error("Historical prices are unavailable.");
    }

    return response.prices
        .filter(row =>
            Array.isArray(row) &&
            row.length >= 2 &&
            Number.isFinite(Number(row[0])) &&
            Number.isFinite(Number(row[1]))
        )
        .map(row => ({
            time: Math.floor(Number(row[0]) / 1000),
            value: Number(row[1])
        }))
        .sort((a, b) => a.time - b.time)
        .filter((point, index, array) =>
            index === 0 || point.time > array[index - 1].time
        );
}


/* =========================================
   LOAD HISTORICAL DATA
========================================= */

async function loadTerminalHistoricalData() {
if (!TerminalCharts.mainChart) {
return;
}

if (TerminalCharts.loading) {
    TerminalCharts.requestId++;
    TerminalCharts.loading = false;
}

const requestId = ++TerminalCharts.requestId;
const assetId = TerminalApp.selectedAsset;
const days = TerminalCharts.timeframe;

TerminalCharts.loading = true;

terminalText(
    "terminalChartStatus",
    "Loading historical market data..."
);

try {
    // Load price data independently of volume data.
    const [candleResult, priceResult, volumeResult] =
        await Promise.allSettled([
            fetchTerminalCandles(assetId, days, requestId),
            fetchTerminalPriceHistory(assetId, days, requestId),
            fetchTerminalVolumeHistory(assetId, days, requestId)
        ]);

    if (requestId !== TerminalCharts.requestId) {
        return;
    }

    const candles =
        candleResult.status === "fulfilled"
            ? candleResult.value
            : [];

    const prices =
        priceResult.status === "fulfilled"
            ? priceResult.value
            : [];

    const volumes =
        volumeResult.status === "fulfilled"
            ? volumeResult.value
            : [];

    if (!candles.length && !prices.length) {
        throw new Error(
            "Both historical candle and price requests failed."
        );
    }

    TerminalCharts.candles = candles;
    TerminalCharts.prices = prices;
    TerminalCharts.volumes = volumes;

    // Update the main chart.
    if (candles.length && TerminalCharts.candleSeries) {
        TerminalCharts.candleSeries.setData(candles);
    }

    if (prices.length && TerminalCharts.lineSeries) {
        TerminalCharts.lineSeries.setData(prices);
    }

    applyTerminalChartMode();

    TerminalCharts.mainChart.timeScale().fitContent();

    // Refresh the technical indicators.
    if (typeof updateTerminalEMA === "function") {
        updateTerminalEMA();
    }

    if (typeof updateTerminalVolumeChart === "function") {
        updateTerminalVolumeChart();
    }

    if (typeof updateTerminalRSIChart === "function") {
        updateTerminalRSIChart();
    }

    if (typeof updateTerminalMACDChart === "function") {
        updateTerminalMACDChart();
    }

    if (typeof updateTerminalMarketSignals === "function") {
        updateTerminalMarketSignals();
    }

    // Report volume problems without breaking price charts.
    if (volumeResult.status === "rejected") {
        console.error(
            "DESCOP volume data error:",
            volumeResult.reason
        );

        terminalText(
            "terminalVolumeStatus",
            "Volume data unavailable. Please try refreshing."
        );
    }

    terminalText(
        "terminalChartStatus",
        `Historical data loaded for ${assetId.toUpperCase()}.`
    );

} catch (error) {
    if (requestId !== TerminalCharts.requestId) {
        return;
    }

    console.error("DESCOP chart error:", error);

    terminalText(
        "terminalChartStatus",
        "Historical data unavailable. Check your connection or try again later."
    );

} finally {
    if (requestId === TerminalCharts.requestId) {
        TerminalCharts.loading = false;
    }
}

}




/* =========================================
   SWITCH CANDLE / LINE MODE
========================================= */

function applyTerminalChartMode() {
    if (!TerminalCharts.mainChart) {
        return;
    }

    const useCandles = TerminalCharts.mode === "candles";

    TerminalCharts.candleSeries.applyOptions({
        visible: useCandles
    });

    TerminalCharts.lineSeries.applyOptions({
        visible: !useCandles
    });

    TerminalCharts.activeSeries = useCandles
        ? TerminalCharts.candleSeries
        : TerminalCharts.lineSeries;

    document.querySelectorAll("[data-chart-mode]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.chartMode === TerminalCharts.mode
        );
    });
}


/* =========================================
   CHART EVENT LISTENERS
========================================= */

function initializeTerminalChartControls() {
    const assetSelect = terminalElement("terminalAssetSelect");

    if (assetSelect) {
        assetSelect.addEventListener("change", () => {
            const assetId = assetSelect.value;

            if (!TerminalApp.assets[assetId]) {
                return;
            }

            TerminalApp.selectedAsset = assetId;

            updateSelectedAssetPrice();
            loadTerminalHistoricalData();
        });
    }

    document.querySelectorAll("[data-timeframe]").forEach(button => {
        button.addEventListener("click", () => {
            const days = Number(button.dataset.timeframe);

            if (![1, 7, 30, 90].includes(days)) {
                return;
            }

            TerminalCharts.timeframe = days;

            document.querySelectorAll("[data-timeframe]").forEach(item => {
                item.classList.toggle("active", item === button);
            });

            loadTerminalHistoricalData();
        });
    });

    document.querySelectorAll("[data-chart-mode]").forEach(button => {
        button.addEventListener("click", () => {
            TerminalCharts.mode = button.dataset.chartMode;
            applyTerminalChartMode();
        });
    });
}


/* =========================================
   INITIALIZE CHART ENGINE
========================================= */

function initializeTerminalChartEngine() {
    initializeTerminalChartControls();
    createTerminalPriceChart();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeTerminalChartEngine,
        { once: true }
    );
} else {
    initializeTerminalChartEngine();
}
/* =========================================
   PART 3 — TECHNICAL ANALYSIS ENGINE
========================================= */

const TerminalIndicators = {
    ema20Series: null,
    ema50Series: null,
    volumeChart: null,
    volumeSeries: null
};


/* =========================================
   EXPONENTIAL MOVING AVERAGE
========================================= */

function calculateTerminalEMA(values, period) {
    if (!Array.isArray(values) || values.length < period) {
        return [];
    }

    const multiplier = 2 / (period + 1);
    const results = [];

    // Initialize using the first period's simple average.
    let previousEMA = values
        .slice(0, period)
        .reduce((sum, item) => sum + item.value, 0) / period;

    results.push({
        time: values[period - 1].time,
        value: previousEMA
    });

    for (let index = period; index < values.length; index++) {
        const currentValue = values[index].value;

        previousEMA =
            (currentValue - previousEMA) * multiplier + previousEMA;

        results.push({
            time: values[index].time,
            value: previousEMA
        });
    }

    return results;
}


/* =========================================
   CREATE EMA SERIES
========================================= */

function createTerminalEMASeries() {
    if (!TerminalCharts.mainChart || !window.LightweightCharts) {
        return;
    }

    if (!TerminalIndicators.ema20Series) {
        TerminalIndicators.ema20Series =
            TerminalCharts.mainChart.addSeries(
                LightweightCharts.LineSeries,
                {
                    color: "#56a8ff",
                    lineWidth: 2,
                    priceLineVisible: false,
                    lastValueVisible: true,
                    title: "EMA 20"
                }
            );
    }

    if (!TerminalIndicators.ema50Series) {
        TerminalIndicators.ema50Series =
            TerminalCharts.mainChart.addSeries(
                LightweightCharts.LineSeries,
                {
                    color: "#d8ad62",
                    lineWidth: 2,
                    priceLineVisible: false,
                    lastValueVisible: true,
                    title: "EMA 50"
                }
            );
    }

    updateTerminalEMA();
}


/* =========================================
   UPDATE EMA DATA
========================================= */

function updateTerminalEMA() {
    if (
        !TerminalIndicators.ema20Series ||
        !TerminalIndicators.ema50Series
    ) {
        return;
    }

    const candleData = TerminalCharts.candles;

    const closeValues = candleData.map(candle => ({
        time: candle.time,
        value: candle.close
    }));

    const ema20 = calculateTerminalEMA(closeValues, 20);
    const ema50 = calculateTerminalEMA(closeValues, 50);

    TerminalIndicators.ema20Series.setData(ema20);
    TerminalIndicators.ema50Series.setData(ema50);

    const ema20Toggle = terminalElement("toggleEMA20");
    const ema50Toggle = terminalElement("toggleEMA50");

    TerminalIndicators.ema20Series.applyOptions({
        visible: Boolean(ema20Toggle?.checked)
    });

    TerminalIndicators.ema50Series.applyOptions({
        visible: Boolean(ema50Toggle?.checked)
    });
}


/* =========================================
   EMA TOGGLE CONTROLS
========================================= */

function initializeTerminalEMAToggles() {
    const ema20Toggle = terminalElement("toggleEMA20");
    const ema50Toggle = terminalElement("toggleEMA50");

    if (ema20Toggle) {
        ema20Toggle.addEventListener("change", () => {
            if (TerminalIndicators.ema20Series) {
                TerminalIndicators.ema20Series.applyOptions({
                    visible: ema20Toggle.checked
                });
            }
        });
    }

    if (ema50Toggle) {
        ema50Toggle.addEventListener("change", () => {
            if (TerminalIndicators.ema50Series) {
                TerminalIndicators.ema50Series.applyOptions({
                    visible: ema50Toggle.checked
                });
            }
        });
    }
}


/* =========================================
   CREATE VOLUME CHART
========================================= */

function createTerminalVolumeChart() {
    const container = terminalElement("terminalVolumeChart");

    if (!container || !window.LightweightCharts) {
        return;
    }

    if (TerminalIndicators.volumeChart) {
        TerminalIndicators.volumeChart.remove();
    }

    TerminalIndicators.volumeChart =
        LightweightCharts.createChart(
            container,
            {
                ...terminalChartOptions(container),

                height: container.clientHeight || 230,

                rightPriceScale: {
                    visible: true,
                    borderColor: "rgba(216,173,98,0.18)"
                },

                timeScale: {
                    borderColor: "rgba(216,173,98,0.18)",
                    timeVisible: true
                }
            }
        );

    TerminalIndicators.volumeSeries =
        TerminalIndicators.volumeChart.addSeries(
            LightweightCharts.HistogramSeries,
            {
                priceFormat: {
                    type: "volume"
                },

                priceScaleId: "right",

                lastValueVisible: false,
                priceLineVisible: false
            }
        );

    // Keep the volume chart responsive.
    if (window.ResizeObserver) {
        const observer = new ResizeObserver(() => {
            if (
                TerminalIndicators.volumeChart &&
                container.clientWidth > 0
            ) {
                TerminalIndicators.volumeChart.applyOptions({
                    width: container.clientWidth,
                    height: container.clientHeight
                });
            }
        });

        observer.observe(container);
    }

    updateTerminalVolumeChart();
}


/* =========================================
   UPDATE VOLUME CHART
========================================= */

function updateTerminalVolumeChart() {
  function updateTerminalVolumeChart() {
    const chart = TerminalIndicators.volumeChart;
    const series = TerminalIndicators.volumeSeries;
    const volumes = TerminalCharts.volumes || [];

    if (!chart || !series) {
        terminalText(
            "terminalVolumeStatus",
            "Volume chart is initializing..."
        );
        return;
    }

    if (volumes.length === 0) {
        series.setData([]);

        terminalText(
            "terminalVolumeStatus",
            "Waiting for historical volume data..."
        );
        return;
    }

    try {
        const validVolumes = volumes
            .filter(item =>
                Number.isFinite(item.time) &&
                Number.isFinite(item.value) &&
                item.value >= 0
            )
            .sort((a, b) => a.time - b.time)
            .filter((item, index, array) =>
                index === 0 ||
                item.time !== array[index - 1].time
            );

        if (validVolumes.length === 0) {
            series.setData([]);

            terminalText(
                "terminalVolumeStatus",
                "No valid volume readings available."
            );
            return;
        }

        series.setData(
            validVolumes.map(item => ({
                time: item.time,
                value: item.value,
                color: "#d8ad62"
            }))
        );

        chart.timeScale().fitContent();

        terminalText(
            "terminalVolumeStatus",
            `${validVolumes.length} historical volume readings loaded.`
        );

    } catch (error) {
        console.error("Trading volume chart error:", error);

        terminalText(
            "terminalVolumeStatus",
            "Unable to render volume data. Please refresh."
        );
    }
}
    /*
       Historical OHLC candles do not contain volume.
       This chart therefore uses actual volume values only
       if a compatible volume dataset is supplied later.
    */

    const volumeData = TerminalCharts.volumes || [];

    if (!volumeData.length) {
        TerminalIndicators.volumeSeries.setData([]);

        terminalText(
            "terminalVolumeStatus",
            "Price history loaded. A compatible volume data source is needed for historical trading volume."
        );

        return;
    }

    TerminalIndicators.volumeSeries.setData(volumeData);

    TerminalIndicators.volumeChart.timeScale().fitContent();

    terminalText(
        "terminalVolumeStatus",
        "Historical volume data loaded."
    );
}


/* =========================================
   VOLUME TOGGLE
========================================= */

function initializeTerminalVolumeToggle() {
    const toggle = terminalElement("toggleVolume");

    if (!toggle) {
        return;
    }

    toggle.addEventListener("change", () => {
        const container = terminalElement("terminalVolumeChart");

        if (container) {
            container.style.display = toggle.checked ? "block" : "none";
        }

        if (
            toggle.checked &&
            TerminalIndicators.volumeChart &&
            container
        ) {
            TerminalIndicators.volumeChart.applyOptions({
                width: container.clientWidth,
                height: container.clientHeight
            });
        }
    });
}


/* =========================================
   INTEGRATE INDICATORS WITH PRICE CHART
========================================= */

function initializeTerminalIndicators() {
    createTerminalEMASeries();
    createTerminalVolumeChart();

    initializeTerminalEMAToggles();
    initializeTerminalVolumeToggle();
}


/* =========================================
   INITIALIZE PART 3
========================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeTerminalIndicators,
        { once: true }
    );
} else {
    initializeTerminalIndicators();
}
// ==========================================
// PART 4: RSI — RELATIVE STRENGTH INDEX
// ==========================================

const TerminalRSI = {
    chart: null,
    series: null,
    period: 14
};


// Calculate RSI using Wilder's smoothing method
function calculateTerminalRSI(candles, period = 14) {
    if (!Array.isArray(candles) || candles.length <= period) {
        return [];
    }

    const results = [];
    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
        const change = candles[i].close - candles[i - 1].close;

        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    let averageGain = gains / period;
    let averageLoss = losses / period;

    function getRSI(avgGain, avgLoss) {
        if (avgLoss === 0 && avgGain === 0) return 50;
        if (avgLoss === 0) return 100;

        const relativeStrength = avgGain / avgLoss;
        return 100 - (100 / (1 + relativeStrength));
    }

    results.push({
        time: candles[period].time,
        value: getRSI(averageGain, averageLoss)
    });

    // Continue with Wilder's smoothing
    for (let i = period + 1; i < candles.length; i++) {
        const change = candles[i].close - candles[i - 1].close;
        const gain = Math.max(change, 0);
        const loss = Math.max(-change, 0);

        averageGain =
            ((averageGain * (period - 1)) + gain) / period;

        averageLoss =
            ((averageLoss * (period - 1)) + loss) / period;

        results.push({
            time: candles[i].time,
            value: getRSI(averageGain, averageLoss)
        });
    }

    return results;
}


// Create the RSI chart
function createTerminalRSIChart() {
    const container = terminalElement("terminalRSIChart");

    if (!container || !window.LightweightCharts) {
        terminalText("terminalRSIValue", "--");
        terminalText(
            "terminalRSISignal",
            "Chart library unavailable"
        );
        return;
    }

    if (TerminalRSI.chart) return;

    TerminalRSI.chart = LightweightCharts.createChart(
        container,
        {
            ...terminalChartOptions(container),

            rightPriceScale: {
                visible: true,
                borderColor: "#382b45",
                scaleMargins: {
                    top: 0.08,
                    bottom: 0.08
                }
            },

            timeScale: {
                borderColor: "#382b45",
                timeVisible: true,
                secondsVisible: false
            }
        }
    );

    TerminalRSI.series = TerminalRSI.chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#d8ad62",
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            crosshairMarkerVisible: true
        }
    );

    // Overbought reference level
    TerminalRSI.series.createPriceLine({
        price: 70,
        color: "#ff7185",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: "70"
    });

    // Oversold reference level
    TerminalRSI.series.createPriceLine({
        price: 30,
        color: "#4bd6a0",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: "30"
    });

    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(() => {
            if (!TerminalRSI.chart) return;

            TerminalRSI.chart.applyOptions({
                width: container.clientWidth,
                height: container.clientHeight
            });
        });

        observer.observe(container);
    }

    updateTerminalRSIChart();
}


// Update RSI using loaded historical candles
function updateTerminalRSIChart() {
    if (!TerminalRSI.series) return;

    const candles = TerminalCharts.candles;

    if (!Array.isArray(candles) || candles.length <= TerminalRSI.period) {
        TerminalRSI.series.setData([]);

        terminalText("terminalRSIValue", "--");
        terminalText(
            "terminalRSISignal",
            "Not enough historical data"
        );

        terminalText(
            "analysisRSI",
            "--"
        );

        terminalText(
            "analysisRSIDescription",
            "More price history is needed to calculate RSI."
        );

        terminalText(
            "terminalVolumeStatus",
            "RSI needs more historical candles."
        );

        return;
    }

    const rsiData = calculateTerminalRSI(
        candles,
        TerminalRSI.period
    );

    if (!rsiData.length) return;

    TerminalRSI.series.setData(rsiData);

    const latestRSI = rsiData[rsiData.length - 1].value;
    const roundedRSI = latestRSI.toFixed(2);

    terminalText("terminalRSIValue", roundedRSI);
    terminalText("analysisRSI", roundedRSI);

    let signal;
    let description;

    if (latestRSI >= 70) {
        signal = "Overbought zone";
        description =
            "RSI is at or above 70. Momentum is strong, but a pullback is possible.";
    } else if (latestRSI <= 30) {
        signal = "Oversold zone";
        description =
            "RSI is at or below 30. Selling pressure is strong, but a rebound is possible.";
    } else if (latestRSI >= 50) {
        signal = "Bullish momentum";
        description =
            "RSI is above 50, suggesting positive momentum.";
    } else {
        signal = "Bearish momentum";
        description =
            "RSI is below 50, suggesting negative momentum.";
    }

    terminalText("terminalRSISignal", signal);
    terminalText("analysisRSIDescription", description);

    const rsiElement = terminalElement("terminalRSIValue");

    if (rsiElement) {
        rsiElement.classList.remove(
            "signal-positive",
            "signal-negative",
            "signal-neutral"
        );

        if (latestRSI >= 70) {
            rsiElement.classList.add("signal-negative");
        } else if (latestRSI <= 30) {
            rsiElement.classList.add("signal-positive");
        } else {
            rsiElement.classList.add("signal-neutral");
        }
    }

    if (TerminalRSI.chart) {
        TerminalRSI.chart.timeScale().fitContent();
    }
}


// Initialize RSI after the page loads
document.addEventListener("DOMContentLoaded", function () {
    createTerminalRSIChart();
});
// ==========================================
// PART 5: MACD INDICATOR
// ==========================================

const TerminalMACD = {
    chart: null,
    macdSeries: null,
    signalSeries: null,
    histogramSeries: null
};


// Calculate an EMA from closing prices
function calculateTerminalPriceEMA(candles, period) {
    if (!candles || candles.length < period) {
        return [];
    }

    const multiplier = 2 / (period + 1);
    const results = [];

    let ema = 0;

    // Initialize with a simple moving average
    for (let i = 0; i < period; i++) {
        ema += candles[i].close;
    }

    ema /= period;

    results.push({
        time: candles[period - 1].time,
        value: ema
    });

    for (let i = period; i < candles.length; i++) {
        ema =
            (candles[i].close - ema) * multiplier + ema;

        results.push({
            time: candles[i].time,
            value: ema
        });
    }

    return results;
}


// Calculate MACD, signal line, and histogram
function calculateTerminalMACD(candles) {
    if (!candles || candles.length < 35) {
        return null;
    }

    const fastEMA = calculateTerminalPriceEMA(candles, 12);
    const slowEMA = calculateTerminalPriceEMA(candles, 26);

    if (!fastEMA.length || !slowEMA.length) {
        return null;
    }

    const fastByTime = new Map(
        fastEMA.map(item => [item.time, item.value])
    );

    const macdLine = [];

    slowEMA.forEach(item => {
        const fastValue = fastByTime.get(item.time);

        if (fastValue !== undefined) {
            macdLine.push({
                time: item.time,
                value: fastValue - item.value
            });
        }
    });

    if (macdLine.length < 9) {
        return null;
    }

    const multiplier = 2 / (9 + 1);
    const signalLine = [];

    let signal = 0;

    for (let i = 0; i < 9; i++) {
        signal += macdLine[i].value;
    }

    signal /= 9;

    signalLine.push({
        time: macdLine[8].time,
        value: signal
    });

    const histogram = [];

    histogram.push({
        time: macdLine[8].time,
        value: macdLine[8].value - signal
    });

    for (let i = 9; i < macdLine.length; i++) {
        signal =
            (macdLine[i].value - signal) * multiplier + signal;

        signalLine.push({
            time: macdLine[i].time,
            value: signal
        });

        histogram.push({
            time: macdLine[i].time,
            value: macdLine[i].value - signal
        });
    }

    return {
        macd: macdLine,
        signal: signalLine,
        histogram
    };
}


// Create the MACD chart
function createTerminalMACDChart() {
    const container = terminalElement("terminalMACDChart");

    if (!container || !window.LightweightCharts) {
        terminalText("terminalMACDValue", "--");
        terminalText("terminalMACDSignal", "Chart library unavailable");
        return;
    }

    if (TerminalMACD.chart) return;

    TerminalMACD.chart = LightweightCharts.createChart(
        container,
        {
            ...terminalChartOptions(container),

            rightPriceScale: {
                visible: true,
                borderColor: "#382b45"
            },

            timeScale: {
                borderColor: "#382b45",
                timeVisible: true,
                secondsVisible: false
            }
        }
    );

    TerminalMACD.macdSeries = TerminalMACD.chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#d8ad62",
            lineWidth: 2,
            title: "MACD"
        }
    );

    TerminalMACD.signalSeries = TerminalMACD.chart.addSeries(
        LightweightCharts.LineSeries,
        {
            color: "#9b8aff",
            lineWidth: 2,
            title: "Signal"
        }
    );

    TerminalMACD.histogramSeries = TerminalMACD.chart.addSeries(
        LightweightCharts.HistogramSeries,
        {
            priceFormat: {
                type: "price",
                precision: 4,
                minMove: 0.0001
            },
            title: "Histogram"
        }
    );

    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(() => {
            if (!TerminalMACD.chart) return;

            TerminalMACD.chart.applyOptions({
                width: container.clientWidth,
                height: container.clientHeight
            });
        });

        observer.observe(container);
    }

    updateTerminalMACDChart();
}


// Refresh MACD with the latest historical candles
function updateTerminalMACDChart() {
    if (!TerminalMACD.macdSeries) return;

    const result = calculateTerminalMACD(TerminalCharts.candles);

    if (!result) {
        TerminalMACD.macdSeries.setData([]);
        TerminalMACD.signalSeries.setData([]);
        TerminalMACD.histogramSeries.setData([]);

        terminalText("terminalMACDValue", "--");
        terminalText("terminalMACDSignal", "Not enough historical data");

        return;
    }

    TerminalMACD.macdSeries.setData(result.macd);
    TerminalMACD.signalSeries.setData(result.signal);
    TerminalMACD.histogramSeries.setData(
        result.histogram.map(item => ({
            time: item.time,
            value: item.value,
            color: item.value >= 0 ? "#4bd6a0" : "#ff7185"
        }))
    );

    const latestMACD = result.macd[result.macd.length - 1];
    const latestSignal = result.signal[result.signal.length - 1];
    const latestHistogram =
        result.histogram[result.histogram.length - 1];

    const macdValue = latestMACD.value;
    const signalValue = latestSignal.value;

    terminalText(
        "terminalMACDValue",
        macdValue.toFixed(4)
    );

    let description;

    if (latestHistogram.value > 0 && macdValue > signalValue) {
        description = "Bullish momentum: MACD is above its signal line.";
    } else if (
        latestHistogram.value < 0 &&
        macdValue < signalValue
    ) {
        description = "Bearish momentum: MACD is below its signal line.";
    } else {
        description = "Mixed momentum: monitor for confirmation.";
    }

    terminalText("terminalMACDSignal", description);

    if (TerminalMACD.chart) {
        TerminalMACD.chart.timeScale().fitContent();
    }
}


// Initialize MACD
document.addEventListener("DOMContentLoaded", function () {
    createTerminalMACDChart();
});
// ==========================================
// PART 7: ADVANCED MARKET SIGNALS
// ==========================================

function calculateTerminalMarketSignals() {
    const candles = TerminalCharts.candles;

    if (!Array.isArray(candles) || candles.length < 35) {
        terminalText("analysisTrend", "Insufficient data");
        terminalText(
            "analysisTrendDescription",
            "More historical candles are required for a reliable technical summary."
        );
        return;
    }

    const rsiData = calculateTerminalRSI(candles, 14);
    const macdData = calculateTerminalMACD(candles);

    if (!rsiData.length || !macdData) {
        terminalText("analysisTrend", "Insufficient data");
        terminalText(
            "analysisTrendDescription",
            "Technical indicators are waiting for enough historical data."
        );
        return;
    }

    const latestRSI = rsiData[rsiData.length - 1].value;
    const latestMACD = macdData.macd[macdData.macd.length - 1];
    const latestSignal = macdData.signal[macdData.signal.length - 1];

    const latestClose = candles[candles.length - 1].close;

    // Calculate EMA values using the same historical candles
    const ema20Data = calculateTerminalPriceEMA(candles, 20);
    const ema50Data = calculateTerminalPriceEMA(candles, 50);

    let bullishPoints = 0;
    let bearishPoints = 0;
    const observations = [];

    // RSI momentum assessment
    if (latestRSI > 50 && latestRSI < 70) {
        bullishPoints++;
        observations.push("RSI shows positive momentum");
    } else if (latestRSI < 50 && latestRSI > 30) {
        bearishPoints++;
        observations.push("RSI shows negative momentum");
    } else if (latestRSI >= 70) {
        observations.push("RSI is in the overbought zone");
    } else if (latestRSI <= 30) {
        observations.push("RSI is in the oversold zone");
    }

    // MACD trend assessment
    if (latestMACD.value > latestSignal.value) {
        bullishPoints++;
        observations.push("MACD is above its signal line");
    } else {
        bearishPoints++;
        observations.push("MACD is below its signal line");
    }

    // EMA trend assessment, when enough candles exist
    if (ema20Data.length && ema50Data.length) {
        const ema20 = ema20Data[ema20Data.length - 1].value;
        const ema50 = ema50Data[ema50Data.length - 1].value;

        if (latestClose > ema20 && ema20 > ema50) {
            bullishPoints++;
            observations.push("Price and EMAs indicate an upward trend");
        } else if (latestClose < ema20 && ema20 < ema50) {
            bearishPoints++;
            observations.push("Price and EMAs indicate a downward trend");
        } else {
            observations.push("EMA trend is mixed");
        }
    }

    let trend;
    let trendClass;

    if (bullishPoints >= 2 && bullishPoints > bearishPoints) {
        trend = "Bullish bias";
        trendClass = "signal-positive";
    } else if (bearishPoints >= 2 && bearishPoints > bullishPoints) {
        trend = "Bearish bias";
        trendClass = "signal-negative";
    } else {
        trend = "Neutral / mixed";
        trendClass = "signal-neutral";
    }

    terminalText("analysisTrend", trend);

    terminalText(
        "analysisTrendDescription",
        observations.join(". ") + "."
    );

    const trendElement = terminalElement("analysisTrend");

    if (trendElement) {
        trendElement.classList.remove(
            "signal-positive",
            "signal-negative",
            "signal-neutral"
        );

        trendElement.classList.add(trendClass);
    }
}


// Refresh market signals whenever candles update
function updateTerminalMarketSignals() {
    calculateTerminalMarketSignals();
}


// Initialize the signal summary
document.addEventListener("DOMContentLoaded", function () {
    updateTerminalMarketSignals();
});// ==========================================
// PART 8: TECHNOLOGY MARKET ANALYSIS
// ==========================================

const TerminalTechnology = {
    chart: null,
    series: null,
    currentSymbol: "AAPL",
    currentPeriod: "1d",
    requestId: 0,

    stocks: {
        AAPL: "Apple",
        MSFT: "Microsoft",
        NVDA: "NVIDIA",
        GOOGL: "Alphabet"
    },

    periods: {
        "1D": { range: "1d", interval: "5m" },
        "5D": { range: "5d", interval: "30m" },
        "1M": { range: "1mo", interval: "1d" },
        "6M": { range: "6mo", interval: "1d" },
        "1Y": { range: "1y", interval: "1wk" }
    }
};


// Create technology stock chart
function createTerminalTechnologyChart() {
    const container = terminalElement("technologyMarketChart");

    if (!container || !window.LightweightCharts) {
        terminalText(
            "technologyChartStatus",
            "Chart library unavailable."
        );
        return;
    }

    if (TerminalTechnology.chart) return;

    TerminalTechnology.chart = LightweightCharts.createChart(
        container,
        {
            ...terminalChartOptions(container),

            rightPriceScale: {
                borderColor: "#382b45"
            },

            timeScale: {
                borderColor: "#382b45",
                timeVisible: true,
                secondsVisible: false
            }
        }
    );

    TerminalTechnology.series = TerminalTechnology.chart.addSeries(
        LightweightCharts.AreaSeries,
        {
            lineColor: "#d8ad62",
            topColor: "rgba(216, 173, 98, 0.30)",
            bottomColor: "rgba(216, 173, 98, 0.02)",
            lineWidth: 2,
            priceLineVisible: true
        }
    );

    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(() => {
            if (!TerminalTechnology.chart) return;

            TerminalTechnology.chart.applyOptions({
                width: container.clientWidth,
                height: container.clientHeight
            });
        });

        observer.observe(container);
    }

    loadTerminalTechnologyData();
}


// Fetch historical technology stock data
async function loadTerminalTechnologyData() {
    if (!TerminalTechnology.series) return;

    const requestId = ++TerminalTechnology.requestId;
    const symbol = TerminalTechnology.currentSymbol;
    const selectedPeriod = TerminalTechnology.currentPeriod;

    const period =
        TerminalTechnology.periods[selectedPeriod] ||
        TerminalTechnology.periods["1D"];

    terminalText(
        "technologyChartStatus",
        `Loading ${symbol} market data...`
    );

    try {
        const url =
            `https://query1.finance.yahoo.com/v8/finance/chart/` +
            `${encodeURIComponent(symbol)}` +
            `?range=${period.range}&interval=${period.interval}`;

        const result = await terminalFetch(url, 15000);

        if (requestId !== TerminalTechnology.requestId) return;

        const payload = result.chart?.result?.[0];

        if (!payload || !payload.timestamp?.length) {
            throw new Error("No historical market data returned.");
        }

        const quotes = payload.indicators?.quote?.[0];
        const timestamps = payload.timestamp;

        if (!quotes?.close) {
            throw new Error("Stock closing prices are unavailable.");
        }

        const chartData = [];

        timestamps.forEach((timestamp, index) => {
            const close = quotes.close[index];

            if (typeof close !== "number" || !Number.isFinite(close)) {
                return;
            }

            chartData.push({
                time: timestamp,
                value: close
            });
        });

        if (!chartData.length) {
            throw new Error("No valid stock prices were found.");
        }

        TerminalTechnology.series.setData(chartData);
        TerminalTechnology.chart.timeScale().fitContent();

        const firstClose = chartData[0].value;
        const lastClose = chartData[chartData.length - 1].value;

        const change = firstClose
            ? ((lastClose - firstClose) / firstClose) * 100
            : 0;

        terminalText(
            "technologyChartStatus",
            `${symbol} · ${selectedPeriod} · ${chartData.length} data points`
        );

        // Update selected stock's visible price and period change
        terminalText(
            `tech${symbol}`,
            terminalMoney(lastClose)
        );

        terminalText(
            `tech${symbol}Change`,
            terminalPercent(change)
        );

        setTerminalChangeColor(
            `tech${symbol}Change`,
            change
        );

    } catch (error) {
        if (requestId !== TerminalTechnology.requestId) return;

        console.error("Technology chart error:", error);

        terminalText(
            "technologyChartStatus",
            "Unable to load stock data. The data provider may be unavailable or blocking browser requests."
        );
    }
}


// Connect stock and timeframe selectors
function initializeTerminalTechnologyControls() {
    const assetSelect = terminalElement("technologyAssetSelect");
    const timeframeSelect = terminalElement("technologyTimeframe");

    if (assetSelect) {
        assetSelect.addEventListener("change", () => {
            const symbol = assetSelect.value.toUpperCase();

            if (!TerminalTechnology.stocks[symbol]) return;

            TerminalTechnology.currentSymbol = symbol;
            loadTerminalTechnologyData();
        });
    }

    if (timeframeSelect) {
        timeframeSelect.addEventListener("change", () => {
            TerminalTechnology.currentPeriod = timeframeSelect.value;
            loadTerminalTechnologyData();
        });
    }
}


// Initialize technology analysis
document.addEventListener("DOMContentLoaded", function () {
    initializeTerminalTechnologyControls();
    createTerminalTechnologyChart();
});
// ==========================================
// PART 9: TECHNOLOGY STOCK CARDS
// ==========================================

const TerminalTechnologyCards = {
    timer: null,
    requestId: 0,

    symbols: {
        AAPL: "Apple",
        MSFT: "Microsoft",
        NVDA: "NVIDIA",
        GOOGL: "Alphabet"
    }
};


// Load current stock quotes for all four cards
async function refreshTerminalTechnologyCards() {
    const requestId = ++TerminalTechnologyCards.requestId;

    const status = terminalElement("technologyChartStatus");

    if (status && !TerminalTechnology.chart) {
        status.textContent = "Loading technology market data...";
    }

    const symbols = Object.keys(TerminalTechnologyCards.symbols);

    const requests = symbols.map(async symbol => {
        const url =
            "https://query1.finance.yahoo.com/v8/finance/chart/" +
            encodeURIComponent(symbol) +
            "?range=5d&interval=1d";

        const response = await terminalFetch(url, 15000);
        const payload = response.chart?.result?.[0];

        if (!payload || !payload.timestamp?.length) {
            throw new Error(`No quote data for ${symbol}`);
        }

        const closes = payload.indicators?.quote?.[0]?.close || [];

        const validCloses = closes.filter(
            value => typeof value === "number" && Number.isFinite(value)
        );

        if (!validCloses.length) {
            throw new Error(`No valid closing prices for ${symbol}`);
        }

        const price = validCloses[validCloses.length - 1];

        const previousPrice =
            validCloses.length > 1
                ? validCloses[validCloses.length - 2]
                : price;

        const change = previousPrice
            ? ((price - previousPrice) / previousPrice) * 100
            : 0;

        return { symbol, price, change };
    });

    const results = await Promise.allSettled(requests);

    if (requestId !== TerminalTechnologyCards.requestId) return;

    let successCount = 0;

    results.forEach(result => {
        if (result.status !== "fulfilled") {
            console.warn(
                "A technology stock quote could not be loaded:",
                result.reason
            );
            return;
        }

        const { symbol, price, change } = result.value;

        terminalText(`tech${symbol}`, terminalMoney(price));
        terminalText(`tech${symbol}Change`, terminalPercent(change));

        setTerminalChangeColor(`tech${symbol}Change`, change);

        successCount++;
    });

    if (status && !TerminalTechnology.chart) {
        status.textContent = successCount
            ? `Technology quotes loaded: ${successCount}/${symbols.length}. Data may be delayed.`
            : "Technology quotes unavailable. Check the data provider connection.";
    }
}


// Start automatic quote refresh
function startTerminalTechnologyCards() {
    refreshTerminalTechnologyCards();

    if (TerminalTechnologyCards.timer) {
        clearInterval(TerminalTechnologyCards.timer);
    }

    // Refresh every 60 seconds
    TerminalTechnologyCards.timer = setInterval(
        refreshTerminalTechnologyCards,
        60000
    );
}


// Start after the page loads
document.addEventListener("DOMContentLoaded", function () {
    startTerminalTechnologyCards();
});
// ==========================================
// PART 10: TERMINAL CONTROLS
// ==========================================

const TerminalControls = {
    autoRefresh: true,
    timer: null,
    interval: 60000,
    lastUpdated: null
};


// Update the connection status timestamp
function updateTerminalTimestamp() {
    TerminalControls.lastUpdated = new Date();

    const timestamp = TerminalControls.lastUpdated.toLocaleTimeString(
        undefined,
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

    terminalText(
        "terminalLastUpdated",
        `Last updated: ${timestamp}`
    );
}


// Refresh all available market data
async function refreshTerminalEverything() {
    const button = terminalElement("terminalRefreshButton");

    if (button) {
        button.disabled = true;
        button.textContent = "Refreshing...";
    }

    try {
        const tasks = [
            refreshTerminalMarketData()
        ];

        if (typeof loadTerminalHistoricalData === "function") {
            tasks.push(loadTerminalHistoricalData());
        }

        if (typeof loadTerminalTechnologyData === "function") {
            tasks.push(loadTerminalTechnologyData());
        }

        if (typeof refreshTerminalTechnologyCards === "function") {
            tasks.push(refreshTerminalTechnologyCards());
        }

        const results = await Promise.allSettled(tasks);

        const successful = results.filter(
            result => result.status === "fulfilled"
        ).length;

        if (successful > 0) {
            updateTerminalTimestamp();
        }

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "↻ Refresh Data";
        }
    }
}


// Enable or disable automatic refresh
function setTerminalAutoRefresh(enabled) {
TerminalControls.autoRefresh = enabled;

if (TerminalControls.timer) {
    clearInterval(TerminalControls.timer);
    TerminalControls.timer = null;
}

if (enabled) {
    TerminalControls.timer = setInterval(async () => {
        if (document.hidden) return;

        await refreshTerminalMarketData();

        if (typeof refreshTerminalTechnologyCards === "function") {
            await refreshTerminalTechnologyCards();
        }
    }, TerminalControls.interval);
}

terminalText(
    "terminalAutoRefreshStatus",
    enabled ? "Auto-refresh ON" : "Auto-refresh OFF"
);

}


// Initialize controls
function initializeTerminalControls() {
    const refreshButton = terminalElement("terminalRefreshButton");
    const autoRefreshToggle = terminalElement("terminalAutoRefresh");

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            refreshTerminalEverything
        );
    }

    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener("change", () => {
            setTerminalAutoRefresh(autoRefreshToggle.checked);
        });
    }

    setTerminalAutoRefresh(true);
}


// Initialize after page loads
document.addEventListener("DOMContentLoaded", function () {
    initializeTerminalControls();
});
// ==========================================
// PART 14: TERMINAL MOBILE NAVIGATION
// ==========================================

function initializeTerminalNavigation() {
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (!menuToggle || !mainNav) return;

menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

}

document.addEventListener("DOMContentLoaded", function () {
initializeTerminalNavigation();
});
// ==========================================
// PART 15: TERMINAL DIAGNOSTICS
// ==========================================

function runTerminalDiagnostics() {
const checks = {
chartLibrary: Boolean(window.LightweightCharts),
mainChartContainer: Boolean(
document.getElementById("terminalPriceChart")
),
rsiChartContainer: Boolean(
document.getElementById("terminalRSIChart")
),
macdChartContainer: Boolean(
document.getElementById("terminalMACDChart")
),
technologyChartContainer: Boolean(
document.getElementById("technologyMarketChart")
)
};

console.table(checks);

const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

if (failedChecks.length) {
    console.warn(
        "DESCOP terminal checks need attention:",
        failedChecks
    );
} else {
    console.info(
        "DESCOP terminal: required chart containers detected."
    );
}

return checks;

}

document.addEventListener("DOMContentLoaded", function () {
runTerminalDiagnostics();
});
// ==========================================
// TRADING VOLUME DATA FIX
// ==========================================

async function fetchTerminalVolumeHistory(assetId, days, requestId) {
const url =
"${TerminalApp.api}/coins/${assetId}/market_chart" +
"?vs_currency=usd&days=${days}";

const data = await terminalFetch(url);

if (
    requestId !== undefined &&
    typeof TerminalCharts !== "undefined" &&
    requestId !== TerminalCharts.requestId
) {
    return [];
}

if (!data || !Array.isArray(data.total_volumes)) {
    throw new Error("Historical volume data is unavailable.");
}

return data.total_volumes
    .filter(point =>
        Array.isArray(point) &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1]) &&
        point[1] >= 0
    )
    .map(point => ({
        time: Math.floor(point[0] / 1000),
        value: point[1]
    }))
    .filter((point, index, points) =>
        index === 0 || point.time > points[index - 1].time
    );

}
