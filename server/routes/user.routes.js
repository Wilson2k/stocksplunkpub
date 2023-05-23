const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/api/", controller.allAccess);
  app.get("/api/user", [authJwt.verifyToken], controller.userBoard);
  app.get("/api/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);
  app.get("/api/user/profile", [authJwt.verifyToken], controller.userProfile);
  app.put("/api/user/profile", [authJwt.verifyToken], controller.updatePortfolio);
  app.put("/api/user/add", [authJwt.verifyToken], controller.userAddFunds);
  app.put("/api/user/remove", [authJwt.verifyToken], controller.userRemoveFunds);
  app.put("/api/user/buy/:ticker", [authJwt.verifyToken], controller.userAddStock);
  app.put("/api/user/sell/:ticker", [authJwt.verifyToken], controller.userSellStock);
};