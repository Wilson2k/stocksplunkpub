const alphaVantage = require("../avapi/apiClient");

// Call Alpha Vantage API and return list of stocks that best matches user input
exports.stockSearch = async (req, res) => {
    const SEARCH = req.query.stock;
    const data = alphaVantage.alphaSearch(SEARCH);
    await data.then((result) => {
        if (Array.isArray(result) && result !== null) {
            res.status(200).send(result);
        } else if (typeof result === 'string' || result instanceof String) {
            res.status(400).send({ message: result });
        } else {
            res.status(400).send({ message: "Error getting API data" });
        }
    })
        .catch((error) => {
            res.status(400).send({ message: "Error getting stock search data"});
        });
}

// Call Alpha Vantage API and get most recent quote for stock
exports.stockQuote = async (req, res) => {
    const STOCK = req.query.stock;
    const data = alphaVantage.alphaQuote(STOCK);
    await data.then((result) => {
        if (typeof result === 'object' && result !== null) {
            res.status(200).send(result);
        } else if (typeof result === 'string' || result instanceof String) {
            res.status(400).send({ message: result });
        } else {
            res.status(400).send({ message: "Error getting API data" });
        }
    })
        .catch((error) => {
            res.status(400).send({ message: "Error getting stock quote"});
        })
}

// Call Alpha Vantage API and get stock description and information
exports.stockInfo = async (req, res) => {
    const STOCK = req.query.stock;
    const data = alphaVantage.alphaInfo(STOCK);
    await data.then((result) => {
        if (typeof result === 'object' && result !== null) {
            res.status(200).send(result);
        } else if (typeof result === 'string' || result instanceof String) {
            res.status(400).send({ message: result });
        } else {
            res.status(400).send({ message: "Error getting API data" });
        }
    })
        .catch((error) => {
            res.status(400).send({ message: "Error getting stock quote"});
        })
}