const mongoose = require("mongoose");
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    balance: mongoose.Schema.Types.Number,
    cash: mongoose.Schema.Types.Number,
    portfolioValue: mongoose.Schema.Types.Number,
    portfolio: [{
      ticker: {
        type: String
      },
      shares: {
        type: mongoose.Schema.Types.Number
      },
      value: {
        type: mongoose.Schema.Types.Number
      }
    }],
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
);
module.exports = User;