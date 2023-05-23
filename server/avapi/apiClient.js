// Import axios for Alpha Vantage 3rd party API calls
const axios = require('axios').default;
const ALPHA_KEY = process.env.ALPHA_KEY;

const redis = require("redis");

let redisClient;

// Connect to local redis client on port 6379
(async () => {
    redisClient = redis.createClient({
        url: 'redis://redis:6379'
    });
    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect();
})();

// Create axios instance
const alphaClient = axios.create({
    baseURL: 'https://www.alphavantage.co/',
    headers: { 'User-Agent': 'request' }
});

// Intercept error codes for alpha vantage api calls
alphaClient.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        let res = error.response;
        window.location.href = "/";
        console.error("Error status code: " + res.status);
        return Promise.reject(error);
    }
);

// Use Alpha Vantage API search endpoint
exports.alphaSearch = async (stock) => {
    const errorMessage = "Error getting API data from client";
    const errorMax = "Maximum API calls reached, please try again later"
    try {
        // Check redis before calling api
        const cacheResults = await redisClient.lRange(`SEARCH:${stock}`, 0, -1);
        if (cacheResults && cacheResults.length != 0) {
            results = cacheResults.map(stockData => JSON.parse(stockData));
            return results
        }
        const data = await alphaClient.get(`query?function=SYMBOL_SEARCH&keywords=${stock}&apikey=${ALPHA_KEY}`)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
        // Catch error if invalid API call
        if (data['Error Message'] || !data) {
            return errorMessage;
        }
        else {
            // If exceeded max number of API calls return note
            if (data['Note']) {
                return errorMax;
            }
            // Filter US stocks and ETFS only
            const filterUS = data.bestMatches.filter(ticker => ticker['8. currency'] === 'USD' && (ticker['3. type'] === 'Equity' || ticker['3. type'] === 'ETF'));
            // Extract ticker and name only
            const result = filterUS.map(ticker => ({ symbol: ticker['1. symbol'], name: ticker['2. name'] }));
            for (const stockData of result) {
                await redisClient.RPUSH(`SEARCH:${stock}`, JSON.stringify(stockData));
            }
            return result;
        }
    } catch (err) {
        console.error(err);
        return errorMessage;
    }
}

// Use Alpha Vantage API quote endpoint
exports.alphaQuote = async (stock) => {
    const errorMessage = "Error getting API data from client";
    const errorMax = "Maximum API calls reached, please try again later";
    try {
        // Check redis before calling api
        const cacheResults = await redisClient.get(`QUOTE:${stock}`);
        if (cacheResults) {
            results = JSON.parse(cacheResults);
            return results
        }
        const data = await alphaClient.get(`query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${ALPHA_KEY}`)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
        // Catch error if invalid API call
        if (data['Error Message'] || !data) {
            return errorMessage;
        }
        else {
            // If exceeded max number of API calls return note
            if (data['Note']) {
                return errorMax;
            }
            // Extract ticker, name and current market price and return object
            const result = data['Global Quote'];
            // Cache stock quote price into redis cache, expires in 300 seconds (5 minutes)
            await redisClient.set(`QUOTE:${stock}`, JSON.stringify(result), {
                EX: 300
            });
            return result;
        }
    } catch (err) {
        console.error(err);
        return errorMessage;
    }
}

// Use Alpha Vantage API quote endpoint
exports.alphaInfo = async (stock) => {
    const errorMessage = "Error getting API data from client";
    const errorMax = "Maximum API calls reached, please try again later";
    try {
        // Check redis before calling api
        const cacheResults = await redisClient.get(`INFO:${stock}`);
        if (cacheResults) {
            results = JSON.parse(cacheResults);
            return results
        }
        const data = await alphaClient.get(`query?function=OVERVIEW&symbol=${stock}&apikey=${ALPHA_KEY}`)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
        // Catch error if invalid API call
        if (data['Error Message'] || !data) {
            return errorMessage;
        }
        else {
            // If exceeded max number of API calls return note
            if (data['Note']) {
                return errorMax;
            }
            // Extract ticker, name and current market price and return object
            const result = data;
            // Cache stock info into redis cache
            await redisClient.set(`INFO:${stock}`, JSON.stringify(result));
            return result;
        }
    } catch (err) {
        console.error(err);
        return errorMessage;
    }
}