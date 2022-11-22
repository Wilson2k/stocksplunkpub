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
  app.get("/", controller.allAccess);
  app.get("/user", [authJwt.verifyToken], controller.userBoard);
  app.get("/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);
  app.get("/user/profile", [authJwt.verifyToken], controller.userProfile);
  app.put("/user/profile", [authJwt.verifyToken], controller.updatePortfolio);
  app.put("/user/add", [authJwt.verifyToken], controller.userAddFunds);
  app.put("/user/remove", [authJwt.verifyToken], controller.userRemoveFunds);
  app.put("/user/buy/:ticker", [authJwt.verifyToken], controller.userAddStock);
  app.put("/user/sell/:ticker", [authJwt.verifyToken], controller.userSellStock);
};