require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
// ========================================
// DESCOP POSTGRESQL DATABASE CONNECTION
// ========================================

const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000
    })
    : null;

if (pool) {
    pool.on("error", (error) => {
        console.error(
            "DESCOP database connection error:",
            error.message
        );
    });

    console.log("DESCOP database connection configured.");
} else {
    console.log(
        "DESCOP database not configured. DATABASE_URL is missing."
    );
}
// ========================================
// DESCOP USER DATABASE INITIALIZATION
// ========================================

async function initializeDatabase() {
    if (!pool) {
        console.log(
            "User database initialization skipped: DATABASE_URL is missing."
        );
        return;
    }

    try {
        await pool.query(`
CREATE TABLE IF NOT EXISTS users (
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
name VARCHAR(100) NOT NULL,
username VARCHAR(30),
email VARCHAR(254) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS username VARCHAR(30);

        CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique
        ON users (LOWER(username))
        WHERE username IS NOT NULL;
    `);

        console.log(
            "DESCOP users table initialized successfully."
        );

    } catch (error) {
        console.error(
            "DESCOP database initialization failed:",
            error.message
        );
    }
}

initializeDatabase();
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || true
}));

app.use(express.json());
// ========================================
// DESCOP API UTILITIES
// ========================================

async function fetchExternalJSON(url, options = {}) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 15000);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        if (!response.ok) {
            const error = new Error(
                `External provider returned HTTP ${response.status}`
            );

            error.status = response.status;
            throw error;
        }

        return await response.json();

    } finally {
        clearTimeout(timeout);
    }
}
// ========================================
// DESCOP BACKEND HOME
// ========================================

app.get("/", (req, res) => {
    res.json({
        name: "DESCOP Intelligence Network",
        status: "online",
        message: "DESCOP backend is running."
    });
});

// ========================================
// DESCOP HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        service: "DESCOP API"
    });
});

// ========================================
// DESCOP REAL NEWS API
// ========================================

app.get("/api/news", async (req, res) => {
    try {
        const query = String(
            req.query.q || "world news"
        ).trim();

        if (!query) {
            return res.status(400).json({
                success: false,
                error: "A search query is required."
            });
        }

        if (!process.env.GNEWS_API_KEY) {
            return res.status(500).json({
                success: false,
                error: "News API key is not configured."
            });
        }

        const newsURL = new URL(
            "https://gnews.io/api/v4/search"
        );

        newsURL.searchParams.set("q", query);
        newsURL.searchParams.set("lang", "en");
        newsURL.searchParams.set("max", "10");
        newsURL.searchParams.set(
            "apikey",
            process.env.GNEWS_API_KEY
        );

        const response = await fetch(newsURL);

        if (!response.ok) {
            console.error(
                "GNews API error:",
                response.status
            );

            return res.status(502).json({
                success: false,
                error: "The news provider could not fulfil the request.",
                providerStatus: response.status
            });
        }

        const data = await response.json();

        const articles = (data.articles || []).map(article => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
            source: article.source?.name || "Unknown source"
        }));

        return res.json({
            success: true,
            provider: "GNews",
            query,
            totalArticles: data.totalArticles || 0,
            returnedArticles: articles.length,
            fetchedAt: new Date().toISOString(),
            articles
        });

    } catch (error) {
        console.error(
            "DESCOP news request failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: "Unable to retrieve news at this time."
        });
    }
});
// ========================================
// DESCOP FINANCIAL SYMBOL SEARCH
// ========================================

app.get("/api/market-search", async (req, res) => {
    try {
        const keywords = String(
            req.query.q || ""
        ).trim();

        if (!keywords) {
            return res.status(400).json({
                success: false,
                error: "Enter a company name or ticker symbol."
            });
        }

        if (keywords.length > 100) {
            return res.status(400).json({
                success: false,
                error: "Search query is too long."
            });
        }

        if (!process.env.ALPHA_VANTAGE_API_KEY) {
            return res.status(503).json({
                success: false,
                error: "Financial search API key is not configured."
            });
        }

        const searchURL = new URL(
            "https://www.alphavantage.co/query"
        );

        searchURL.searchParams.set(
            "function",
            "SYMBOL_SEARCH"
        );

        searchURL.searchParams.set(
            "keywords",
            keywords
        );

        searchURL.searchParams.set(
            "apikey",
            process.env.ALPHA_VANTAGE_API_KEY
        );

        const data = await fetchExternalJSON(searchURL);

        if (
            data["Error Message"] ||
            data["Information"] ||
            data["Note"]
        ) {
            return res.status(502).json({
                success: false,
                error: "Financial provider returned an error or usage limit notice."
            });
        }

        const matches = (data.bestMatches || []).map(item => ({
            symbol: item["1. symbol"],
            name: item["2. name"],
            type: item["3. type"],
            region: item["4. region"],
            currency: item["8. currency"],
            matchScore: Number(item["9. matchScore"])
        }));

        return res.json({
            success: true,
            provider: "Alpha Vantage",
            query: keywords,
            resultCount: matches.length,
            fetchedAt: new Date().toISOString(),
            results: matches
        });

    } catch (error) {
        console.error(
            "DESCOP market search failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve financial search results."
        });
    }
});
// ========================================
// DESCOP STOCK PRICE API
// ========================================

app.get("/api/stocks", async (req, res) => {
    try {
        const symbol = String(
            req.query.symbol || ""
        ).trim().toUpperCase();

        if (!symbol) {
            return res.status(400).json({
                success: false,
                error: "A stock symbol is required. Example: IBM"
            });
        }

        if (!/^[A-Z0-9.-]{1,20}$/.test(symbol)) {
            return res.status(400).json({
                success: false,
                error: "Invalid stock symbol."
            });
        }

        if (!process.env.ALPHA_VANTAGE_API_KEY) {
            return res.status(503).json({
                success: false,
                error: "Stock API key is not configured."
            });
        }

        const stockURL = new URL(
            "https://www.alphavantage.co/query"
        );

        stockURL.searchParams.set(
            "function",
            "GLOBAL_QUOTE"
        );

        stockURL.searchParams.set("symbol", symbol);

        stockURL.searchParams.set(
            "apikey",
            process.env.ALPHA_VANTAGE_API_KEY
        );

        const data = await fetchExternalJSON(stockURL);

        if (
            data["Error Message"] ||
            data["Information"] ||
            data["Note"]
        ) {
            return res.status(502).json({
                success: false,
                error: "The stock provider returned an error or usage limit notice."
            });
        }

        const quote = data["Global Quote"];

        if (!quote || !quote["05. price"]) {
            return res.status(404).json({
                success: false,
                error: "No stock quote was returned for this symbol.",
                symbol
            });
        }

        return res.json({
            success: true,
            provider: "Alpha Vantage",
            symbol: quote["01. symbol"],
            price: Number(quote["05. price"]),
            change: Number(quote["09. change"]),
            changePercent: quote["10. change percent"],
            volume: Number(quote["06. volume"]),
            latestTradingDay: quote["07. latest trading day"],
            fetchedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error(
            "DESCOP stock request failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve the stock quote."
        });
    }
});
// ========================================
// DESCOP CRYPTOCURRENCY API
// ========================================

app.get("/api/crypto", async (req, res) => {
    try {
        const ids = String(
            req.query.ids || "bitcoin,ethereum"
        )
            .trim()
            .toLowerCase();

        const currency = String(
            req.query.currency || "usd"
        )
            .trim()
            .toLowerCase();

        if (!ids || ids.length > 500) {
            return res.status(400).json({
                success: false,
                error: "Provide valid cryptocurrency IDs."
            });
        }

        if (!/^[a-z]{3,5}$/.test(currency)) {
            return res.status(400).json({
                success: false,
                error: "Invalid currency code."
            });
        }

        const coinIds = ids.split(",");

        if (
            coinIds.length > 50 ||
            coinIds.some(id => !/^[a-z0-9-]+$/.test(id))
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid cryptocurrency IDs."
            });
        }

        const cryptoURL = new URL(
            "https://api.coingecko.com/api/v3/simple/price"
        );

        cryptoURL.searchParams.set(
            "ids",
            coinIds.join(",")
        );

        cryptoURL.searchParams.set(
            "vs_currencies",
            currency
        );

        cryptoURL.searchParams.set(
            "include_24hr_change",
            "true"
        );

        cryptoURL.searchParams.set(
            "include_market_cap",
            "true"
        );

        cryptoURL.searchParams.set(
            "include_24hr_vol",
            "true"
        );

        const data = await fetchExternalJSON(cryptoURL);

        return res.json({
            success: true,
            provider: "CoinGecko",
            currency,
            fetchedAt: new Date().toISOString(),
            data
        });

    } catch (error) {
        console.error(
            "DESCOP crypto request failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve cryptocurrency market data."
        });
    }
});
// ========================================
// DESCOP FOREX EXCHANGE RATE API
// ========================================

app.get("/api/forex", async (req, res) => {
    try {
        const base = String(
            req.query.base || "USD"
        ).trim().toUpperCase();

        const symbols = String(
            req.query.symbols || "EUR,GBP,NGN"
        ).trim().toUpperCase();

        if (!/^[A-Z]{3}$/.test(base)) {
            return res.status(400).json({
                success: false,
                error: "Base currency must be a three-letter currency code."
            });
        }

        const currencies = symbols
            .split(",")
            .map(code => code.trim());

        if (
            currencies.length > 30 ||
            currencies.some(code => !/^[A-Z]{3}$/.test(code))
        ) {
            return res.status(400).json({
                success: false,
                error: "Provide valid currency codes."
            });
        }

        const forexURL = new URL(
            `https://api.frankfurter.dev/v2/rates`
        );

        forexURL.searchParams.set("base", base);
        forexURL.searchParams.set(
            "quotes",
            currencies.join(",")
        );

        const data = await fetchExternalJSON(forexURL);

        const rates = {};

        for (const item of data) {
            rates[item.quote] = item.rate;
        }

        return res.json({
            success: true,
            provider: "Frankfurter",
            rateType: "Reference exchange rates, not live trading quotes",
            base,
            rates,
            fetchedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error(
            "DESCOP forex request failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve exchange rates."
        });
    }
});
// ========================================
// DESCOP HISTORICAL TRADING DATA API
// ========================================

app.get("/api/trading", async (req, res) => {
    try {
        const symbol = String(
            req.query.symbol || ""
        ).trim().toUpperCase();

        if (!symbol) {
            return res.status(400).json({
                success: false,
                error: "A stock symbol is required."
            });
        }

        if (!/^[A-Z0-9.-]{1,20}$/.test(symbol)) {
            return res.status(400).json({
                success: false,
                error: "Invalid stock symbol."
            });
        }

        if (!process.env.ALPHA_VANTAGE_API_KEY) {
            return res.status(503).json({
                success: false,
                error: "Financial API key is not configured."
            });
        }

        const tradingURL = new URL(
            "https://www.alphavantage.co/query"
        );

        tradingURL.searchParams.set(
            "function",
            "TIME_SERIES_DAILY"
        );

        tradingURL.searchParams.set(
            "symbol",
            symbol
        );

        tradingURL.searchParams.set(
            "outputsize",
            "compact"
        );

        tradingURL.searchParams.set(
            "apikey",
            process.env.ALPHA_VANTAGE_API_KEY
        );

        const data = await fetchExternalJSON(tradingURL);

        if (
            data["Error Message"] ||
            data["Information"] ||
            data["Note"]
        ) {
            return res.status(502).json({
                success: false,
                error: "The financial provider returned an error or usage limit notice."
            });
        }

        const series = data["Time Series (Daily)"];

        if (!series) {
            return res.status(502).json({
                success: false,
                error: "Historical trading data is unavailable for this symbol."
            });
        }

        const candles = Object.entries(series).map(
            ([date, values]) => ({
                date,
                open: Number(values["1. open"]),
                high: Number(values["2. high"]),
                low: Number(values["3. low"]),
                close: Number(values["4. close"]),
                volume: Number(values["5. volume"])
            })
        );

        return res.json({
            success: true,
            provider: "Alpha Vantage",
            symbol,
            interval: "1day",
            dataType: "Historical daily OHLCV",
            latestTradingDay: candles[0]?.date || null,
            returnedCandles: candles.length,
            fetchedAt: new Date().toISOString(),
            candles
        });

    } catch (error) {
        console.error(
            "DESCOP trading data request failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve historical trading data."
        });
    }
});
// ========================================
// DESCOP ECONOMIC DATA API
// ========================================

app.get("/api/economic", async (req, res) => {
    try {
        const indicator = String(
            req.query.indicator || "REAL_GDP"
        ).trim().toUpperCase();

        const allowedIndicators = [
            "REAL_GDP",
            "CPI",
            "INFLATION",
            "UNEMPLOYMENT",
            "FEDERAL_FUNDS_RATE"
        ];

        if (!allowedIndicators.includes(indicator)) {
            return res.status(400).json({
                success: false,
                error: "Unsupported economic indicator.",
                supportedIndicators: allowedIndicators
            });
        }

        if (!process.env.ALPHA_VANTAGE_API_KEY) {
            return res.status(503).json({
                success: false,
                error: "Economic data API key is not configured."
            });
        }

        const economicURL = new URL(
            "https://www.alphavantage.co/query"
        );

        economicURL.searchParams.set(
            "function",
            indicator
        );

        economicURL.searchParams.set(
            "apikey",
            process.env.ALPHA_VANTAGE_API_KEY
        );

        const interval = String(
            req.query.interval || ""
        ).trim().toLowerCase();

        const supportedIntervals = {
            REAL_GDP: ["annual", "quarterly"],
            CPI: ["monthly", "semiannual"],
            FEDERAL_FUNDS_RATE: [
                "daily",
                "weekly",
                "monthly"
            ]
        };

        if (interval) {
            const allowedIntervals =
                supportedIntervals[indicator];

            if (
                !allowedIntervals ||
                !allowedIntervals.includes(interval)
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Unsupported interval for this indicator.",
                    supportedIntervals:
                        allowedIntervals || []
                });
            }

            economicURL.searchParams.set(
                "interval",
                interval
            );
        }

        const data = await fetchExternalJSON(economicURL);

        if (
            data["Error Message"] ||
            data["Information"] ||
            data["Note"]
        ) {
            return res.status(502).json({
                success: false,
                error: "The economic data provider returned an error or usage limit notice."
            });
        }

        if (!Array.isArray(data.data)) {
            return res.status(502).json({
                success: false,
                error: "The provider did not return economic observations."
            });
        }

        return res.json({
            success: true,
            provider: "Alpha Vantage",
            indicator,
            name: data.name || indicator,
            interval: data.interval || interval || null,
            unit: data.unit || null,
            observations: data.data,
            returnedObservations: data.data.length,
            fetchedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error(
            "DESCOP economic data request failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve economic data."
        });
    }
});
// ========================================
// DESCOP COMPANY FUNDAMENTALS API
// ========================================

app.get("/api/company", async (req, res) => {
    try {
        const symbol = String(
            req.query.symbol || ""
        ).trim().toUpperCase();

        if (!symbol) {
            return res.status(400).json({
                success: false,
                error: "A company ticker symbol is required."
            });
        }

        if (!/^[A-Z0-9.-]{1,20}$/.test(symbol)) {
            return res.status(400).json({
                success: false,
                error: "Invalid company ticker symbol."
            });
        }

        if (!process.env.ALPHA_VANTAGE_API_KEY) {
            return res.status(503).json({
                success: false,
                error: "Company data API key is not configured."
            });
        }

        const companyURL = new URL(
            "https://www.alphavantage.co/query"
        );

        companyURL.searchParams.set(
            "function",
            "OVERVIEW"
        );

        companyURL.searchParams.set(
            "symbol",
            symbol
        );

        companyURL.searchParams.set(
            "apikey",
            process.env.ALPHA_VANTAGE_API_KEY
        );

        const data = await fetchExternalJSON(companyURL);

        if (
            data["Error Message"] ||
            data["Information"] ||
            data["Note"]
        ) {
            return res.status(502).json({
                success: false,
                error: "The company data provider returned an error or usage limit notice."
            });
        }

        if (!data.Symbol || !data.Name) {
            return res.status(404).json({
                success: false,
                error: "Company information was not returned for this symbol.",
                symbol
            });
        }

        return res.json({
            success: true,
            provider: "Alpha Vantage",
            fetchedAt: new Date().toISOString(),
            company: {
                symbol: data.Symbol,
                name: data.Name,
                description: data.Description,
                exchange: data.Exchange,
                currency: data.Currency,
                country: data.Country,
                sector: data.Sector,
                industry: data.Industry,
                marketCapitalization:
                    data.MarketCapitalization || null,
                peRatio: data.PERatio || null,
                eps: data.EPS || null,
                revenueTTM: data.RevenueTTM || null,
                profitMargin: data.ProfitMargin || null,
                dividendYield: data.DividendYield || null,
                analystTargetPrice:
                    data.AnalystTargetPrice || null,
                fiscalYearEnd: data.FiscalYearEnd || null,
                latestQuarter: data.LatestQuarter || null
            }
        });

    } catch (error) {
        console.error(
            "DESCOP company data request failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve company information."
        });
    }
});
// ========================================
// DESCOP REAL WEATHER API
// ========================================

app.get("/api/weather", async (req, res) => {
    try {
        const city = String(
            req.query.city || ""
        ).trim();

        if (!city) {
            return res.status(400).json({
                success: false,
                error: "Provide a city name. Example: Abuja"
            });
        }

        if (city.length > 100) {
            return res.status(400).json({
                success: false,
                error: "City name is too long."
            });
        }

        // Find the requested location.
        const geocodingURL = new URL(
            "https://geocoding-api.open-meteo.com/v1/search"
        );

        geocodingURL.searchParams.set("name", city);
        geocodingURL.searchParams.set("count", "1");
        geocodingURL.searchParams.set("language", "en");
        geocodingURL.searchParams.set("format", "json");

        const geoData = await fetchExternalJSON(geocodingURL);

        const location = geoData.results?.[0];

        if (!location) {
            return res.status(404).json({
                success: false,
                error: "Location not found.",
                city
            });
        }

        // Retrieve actual weather observations/conditions.
        const weatherURL = new URL(
            "https://api.open-meteo.com/v1/forecast"
        );

        weatherURL.searchParams.set(
            "latitude",
            String(location.latitude)
        );

        weatherURL.searchParams.set(
            "longitude",
            String(location.longitude)
        );

        weatherURL.searchParams.set(
            "current",
            [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "weather_code",
                "wind_speed_10m"
            ].join(",")
        );

        weatherURL.searchParams.set(
            "timezone",
            "auto"
        );

        const weatherData = await fetchExternalJSON(weatherURL);

        if (!weatherData.current) {
            return res.status(502).json({
                success: false,
                error: "Current weather data is unavailable."
            });
        }

        return res.json({
            success: true,
            provider: "Open-Meteo",
            location: {
                name: location.name,
                country: location.country,
                latitude: location.latitude,
                longitude: location.longitude,
                timezone: weatherData.timezone
            },
            current: weatherData.current,
            units: weatherData.current_units,
            fetchedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error(
            "DESCOP weather request failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve weather data."
        });
    }
});
// ========================================
// DESCOP REAL NEWS SEARCH API
// ========================================

app.get("/api/search", async (req, res) => {
    try {
        const query = String(req.query.q || "").trim();

        if (!query) {
            return res.status(400).json({
                success: false,
                error: "Enter a search query."
            });
        }

        if (query.length > 200) {
            return res.status(400).json({
                success: false,
                error: "Search query is too long."
            });
        }

        if (!process.env.GNEWS_API_KEY) {
            return res.status(500).json({
                success: false,
                error: "News API key is not configured."
            });
        }

        const searchURL = new URL(
            "https://gnews.io/api/v4/search"
        );

        searchURL.searchParams.set("q", query);
        searchURL.searchParams.set("lang", "en");
        searchURL.searchParams.set("max", "10");
        searchURL.searchParams.set(
            "apikey",
            process.env.GNEWS_API_KEY
        );

        const data = await fetchExternalJSON(searchURL);

        const articles = (data.articles || []).map(article => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
            source: article.source?.name || "Unknown source"
        }));

        return res.json({
            success: true,
            provider: "GNews",
            query,
            totalArticles: data.totalArticles || 0,
            returnedArticles: articles.length,
            fetchedAt: new Date().toISOString(),
            articles
        });

    } catch (error) {
        console.error(
            "DESCOP search failed:",
            error.message
        );

        return res.status(502).json({
            success: false,
            error: "Unable to retrieve search results."
        });
    }
});
// ========================================
// DESCOP USER REGISTRATION API
// ========================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.post("/api/auth/register", async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({
                success: false,
                error: "User database is not configured."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({
                success: false,
                error: "Authentication is not configured."
            });
        }

        const name = String(req.body.name || "").trim();
        const username = String(req.body.username || "").trim();
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();
        const password = req.body.password;

        if (!name || name.length > 100) {
            return res.status(400).json({
                success: false,
                error: "Enter a valid name of up to 100 characters."
            });
        }

        if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
            return res.status(400).json({
                success: false,
                error: "Username must contain 3–30 letters, numbers, or underscores."
            });
        }
        if (
            !email ||
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                success: false,
                error: "Enter a valid email address."
            });
        }
        if (
            typeof password !== "string" ||
            password.length < 8 ||
            password.length > 72
        ) {
            return res.status(400).json({
                success: false,
                error: "Password must be between 8 and 72 characters."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            "INSERT INTO users (name, username, email, password_hash) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id, name, username, email, created_at",
            [name, username, email, passwordHash]
        );
        if (result.rows.length === 0) {
            return res.status(409).json({
                success: false,
                error: "An account with this email or username already exists."
            });
        }

        const user = result.rows[0];

        const token = jwt.sign(
            { sub: String(user.id) },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user,
            token
        });

    } catch (error) {
        console.error(
            "DESCOP registration failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: "Registration could not be completed."
        });
    }
});
// ========================================
// DESCOP USER LOGIN API
// ========================================

app.post("/api/auth/login", async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({
                success: false,
                error: "User database is not configured."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({
                success: false,
                error: "Authentication is not configured."
            });
        }

        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const password = req.body.password;

        if (
            !email ||
            email.length > 254 ||
            typeof password !== "string" ||
            password.length === 0 ||
            password.length > 72
        ) {
            return res.status(400).json({
                success: false,
                error: "Enter a valid email and password."
            });
        }

        const result = await pool.query(
            `SELECT id, name, email, password_hash, created_at
             FROM users
             WHERE email = $1
             LIMIT 1`,
            [email]
        );

        const user = result.rows[0];

        if (
            !user ||
            !(await bcrypt.compare(password, user.password_hash))
        ) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { sub: String(user.id) },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.json({
            success: true,
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            },
            token
        });

    } catch (error) {
        console.error(
            "DESCOP login failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: "Login could not be completed."
        });
    }
});
// ========================================
// DESCOP AUTHENTICATED USER PROFILE API
// ========================================

app.get("/api/auth/me", async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({
                success: false,
                error: "User database is not configured."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({
                success: false,
                error: "Authentication is not configured."
            });
        }

        const authorization = req.headers.authorization || "";
        const parts = authorization.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer" ||
            !parts[1]
        ) {
            return res.status(401).json({
                success: false,
                error: "Authentication token is required."
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                parts[1],
                process.env.JWT_SECRET
            );
        } catch {
            return res.status(401).json({
                success: false,
                error: "Your session is invalid or has expired. Please log in again."
            });
        }

        const result = await pool.query(
            `SELECT id, name, email, created_at
             FROM users
             WHERE id = $1
             LIMIT 1`,
            [decoded.sub]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "User account not found."
            });
        }

        return res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error(
            "DESCOP profile request failed:",
            error.message
        );

        return res.status(500).json({
            success: false,
            error: "Unable to retrieve your profile."
        });
    }
});
// ========================================
// START DESCOP SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `DESCOP backend running on port ${PORT}`
    );
});
