// Import axios for Alpha Vantage 3rd party API calls
const axios = require('axios').default;
const ALPHA_KEY= process.env.ALPHA_KEY;

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
            if(data['Note']){
                return errorMax;
            }
            // Filter US stocks and ETFS only
            const filterUS = data.bestMatches.filter(ticker => ticker['8. currency'] === 'USD' && (ticker['3. type'] === 'Equity' || ticker['3. type'] === 'ETF'));
            // Extract ticker and name only
            const result = filterUS.map(ticker => ({ symbol: ticker['1. symbol'], name: ticker['2. name'] }));
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
            if(data['Note']){
                return errorMax;
            }
            // Extract ticker, name and current market price and return object
            const result = data['Global Quote'];
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
            if(data['Note']){
                return errorMax;
            }
            // Extract ticker, name and current market price and return object
            const result = data;
            return result;
        }
    } catch (err) {
        console.error(err);
        return errorMessage;
    }
}