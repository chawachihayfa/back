const { authJwt } = require("../middlewares");
const controller = require("../controllers/test.controller");

module.exports = function(app) {
  // il faut la mettre pour chaque route (access)
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

// Create a new test
app.post("/api/melek", [authJwt.verifyToken], controller.create);



};
