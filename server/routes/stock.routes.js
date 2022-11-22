const { authJwt } = require("../middleware");
const controller = require("../controllers/stock.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/stock/search", [authJwt.verifyToken], controller.stockSearch);
  app.get("/stock/quote", [authJwt.verifyToken], controller.stockQuote);
  app.get("/stock/info", [authJwt.verifyToken], controller.stockInfo);
};