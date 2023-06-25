const { authJwt } = require("../middlewares");
const controller = require("../controllers/image.controller");

module.exports = function(app) {
  // il faut la mettre pour chaque route (access)
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

// Créer une nouvelle image
app.post("/api/images", [authJwt.verifyToken], controller.create);

  // Récupérer toute les images
  app.get("/api/images", [authJwt.verifyToken], controller.getAllImages);

  // Récupérer une image par son ID
  app.get("/api/images/:id", [authJwt.verifyToken], controller.getImageById);

  app.delete("/api/image/:imageId", [authJwt.verifyToken], controller.deleteImage);
};
