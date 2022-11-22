const db = require("../models");
const User = db.user;
const alphaVantage = require("../avapi/apiClient");

// Home page data
exports.allAccess = (req, res) => {
    res.status(200).send("Welcome to my stock app.");
};
// Stock page that only users can see
exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};
// Admin page data
exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

// Return users info to display on profile page
exports.userProfile = async (req, res) => {
    const userId = req.userId;
    try {
        // Only get relevant profile information
        const data = await User.findById(userId);
        if (data == null) {
            return res.status(400).send({ message: "User not found in database" });
        }
        const user = { balance: data.balance, cash: data.cash, email: data.email, fname: data.fname, lname: data.lname, portfolio: data.portfolio, portfolioValue: data.portfolioValue };
        return res.status(200).send(user);
    } catch (err) {
        return res.status(400).send({ message: "Error getting portfolio" });
    }
}

// Update portfolio stock values based on latest API data
exports.updatePortfolio = async (req, res) => {
    const userId = req.userId;
    try {
        // Only get update portfolio and balance information
        let data = await User.findById(userId);
        if (data == null) {
            return res.status(400).send({ message: "User not found in database" });
        }
        let { portfolio, cash, balance } = data;
        let totalPortfolioValue = 0;
        // Pull latest API data to get value of portfolio
        if (Array.isArray(portfolio) && portfolio.length) {
            for (const stock of portfolio) {
                const data = alphaVantage.alphaQuote(stock.ticker);
                let pulledLatest = false;
                let currentValue = stock.value;
                await data.then((result) => {
                    if (typeof result === 'object' && !Array.isArray(result) && result !== null) {
                        currentValue = result['05. price'];
                        pulledLatest = true;
                    }
                })
                if (pulledLatest) {
                    stock.value = currentValue * stock.shares;
                }
                totalPortfolioValue += stock.value;
            }
        }
        // Update portfolio and balance values to reflect latest API values
        balance = totalPortfolioValue + cash;
        await User.findByIdAndUpdate(userId, { portfolio: portfolio, balance: balance, portfolioValue: totalPortfolioValue }, { new: true }).then((data, err) => {
            if (err) {
                return res.status(400).send({ message: "Error updating data" });
            }
            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(400).send({ message: "Error updating portfolio" });
    }
}

// Add a stock to user's portfolio
exports.userAddStock = async (req, res) => {
    const userId = req.userId;
    const addTicker = req.params.ticker.toUpperCase();
    const numShares = parseInt(req.query.volume);
    if (numShares <= 0 || numShares == null) {
        return res.status(400).send({ message: "Invalid number of shares" });
    }
    // Get user info
    const data = await User.findById(userId);
    if (data == null) {
        return res.status(400).send({ message: "User not found in database" });
    }
    let { cash, portfolio } = data;
    const currentInvestment = portfolio.find(({ ticker }) => ticker === addTicker);
    let currentShares = 0;
    if (currentInvestment) {
        currentShares = currentInvestment.shares;
    }
    // Get current price per share from Alpha Vantage API
    const apiData = alphaVantage.alphaQuote(addTicker);
    await apiData.then((result) => {
        if (typeof result === 'object' && result !== null) {
            const currentPrice = result['05. price'];
            // Check if user can buy stock
            const totalPrice = currentPrice * numShares;
            if (totalPrice <= cash) {
                const newCash = cash - totalPrice;
                const newShares = currentShares + numShares;
                const newValue = newShares * currentPrice;
                // If user doesnt own any shares add to portfolio
                if (currentShares === 0) {
                    const newStock = { ticker: addTicker, shares: newShares, value: newValue };
                    User.findByIdAndUpdate(userId, { $set: { "cash": newCash}, $push: { portfolio: newStock } }).then((data, err) => {
                        if (err) {
                            return res.status(400).send({ message: "Error updating data" });
                        }
                        return res.status(200).send(data);
                    });
                } else {
                    // Update user cash and portfolio if already own shares
                    User.findByIdAndUpdate(userId, {
                        $set: {
                            "portfolio.$[el].shares": newShares,
                            "portfolio.$[el].value": newValue,
                            "cash": newCash
                        }
                    },
                        { arrayFilters: [{ "el.ticker": addTicker }], new: true }).then((data, err) => {
                            if (err) {
                                return res.status(400).send({ message: "Error updating data" });
                            }
                            return res.status(200).send(data);
                        });
                }
            } else {
                return res.status(400).send({ message: "Insufficient funds!" });
            }
        } else if (typeof result === 'string' || result instanceof String) {
            return res.status(400).send({ message: result });
        } else {
            return res.status(400).send({ message: "Error getting API data" });
        }
    })
        .catch((error) => {
            return res.status(400).send({ message: "Error buying stock" });
        })
};

// Sell a stock from the user's portfolio
exports.userSellStock = async (req, res) => {
    const userId = req.userId;
    const sellTicker = req.params.ticker.toUpperCase();
    const numShares = parseInt(req.query.volume);
    // Check for selling negative number of shares
    if (numShares <= 0 || numShares == null) {
        return res.status(400).send({ message: "Invalid number of shares" });
    }
    // Get user info from server
    const data = await User.findById(userId);
    if (data == null) {
        return res.status(400).send({ message: "User not found in database" });
    }
    let { cash, portfolio } = data;
    const currentInvestment = portfolio.find(({ ticker }) => ticker === sellTicker);
    // Check that user has shares to sell
    let currentShares = 0;
    if (currentInvestment) {
        currentShares = currentInvestment.shares;
    } else {
        return res.status(400).send({ message: "User doesn't own any shares to sell" });
    }
    // Get current price per share from Alpha Vantage API
    const apiData = alphaVantage.alphaQuote(sellTicker);
    await apiData.then((result) => {
        if (typeof result === 'object' && result !== null) {
            const currentPrice = result['05. price'];
            const totalPrice = currentPrice * numShares;
            // Check if owns enough shares to sell
            if (currentShares >= numShares) {
                const newCash = cash + totalPrice;
                const newShares = currentShares - numShares;
                const newValue = newShares * currentPrice;
                // If user is selling all shares, remove entire stock from portfolio
                if (currentShares === numShares) {
                    User.findByIdAndUpdate(userId, { $set: { "cash": newCash}, $pull: { portfolio: { ticker: sellTicker } } }).then((data, err) => {
                        if (err) {
                            return res.status(400).send({ message: "Error updating data" });
                        }
                        return res.status(200).send(data);
                    });
                } else {
                    // Update user cash and portfolio if selling some shares
                    User.findByIdAndUpdate(userId, {
                        $set: {
                            "portfolio.$[el].shares": newShares,
                            "portfolio.$[el].value": newValue,
                            "cash": newCash
                        }
                    },
                        { arrayFilters: [{ "el.ticker": sellTicker }], new: true }).then((data, err) => {
                            if (err) {
                                return res.status(400).send({ message: "Error updating data" });
                            }
                            return res.status(200).send(data);
                        });
                }
            } else {
                return res.status(400).send({ message: "Insufficient shares owned!" });
            }
        } else if (typeof result === 'string' || result instanceof String) {
            return res.status(400).send({ message: result });
        } else {
            return res.status(400).send({ message: "Error getting API data" });
        }
    })
        .catch((error) => {
            return res.status(400).send({ message: "Error selling stock" });
        })
};

// Add funds to user's account
exports.userAddFunds = async (req, res) => {
    const userId = req.userId;
    const amount = req.query.amount;
    try {
        // Only get relevant profile information
        const { cash } = await User.findById(userId);
        if (cash == null) {
            return res.status(400).send({ message: "User not found in database" });
        }
        if(parseFloat(amount) < 0){
            return res.status(400).send({ message: "Cannot add negative amount" });
        }
        const newAmount = (parseFloat(cash) + parseFloat(amount)).toFixed(2);
        await User.findByIdAndUpdate(userId, { cash: newAmount }, { new: true }).then((data, err) => {
            if (err) {
                return res.status(400).send({ message: "Error updating data" });
            }
            return res.status(200).send({ credited: amount});
        });
    } catch (error) {
        return res.status(400).send({ message: "Error adding funds" });
    }
};

// Remove funds from user's account
exports.userRemoveFunds = async (req, res) => {
    const userId = req.userId;
    const amount = req.query.amount;
    try {
        // Only get relevant profile information
        const { cash } = await User.findById(userId);
        if (cash == null) {
            return res.status(400).send({ message: "User not found in database" });
        }
        if(parseFloat(amount) < 0){
            return res.status(400).send({ message: "Cannot remove negative amount" });
        }
        const newAmount = (parseFloat(cash) - parseFloat(amount)).toFixed(2);
        if(newAmount < 0){
            return res.status(400).send({ message: "Insufficient funds!" });
        }
        await User.findByIdAndUpdate(userId, { cash: newAmount }, { new: true }).then((data, err) => {
            if (err) {
                return res.status(400).send({ message: "Error updating data" });
            }
            return res.status(200).send({ removed: amount});
        });
    } catch (error) {
        return res.status(400).send({ message: "Error removing funds" });
    }
};