const { authJwt } = require("../middlewares");
const controller = require("../controllers/panier.controller");
module.exports = function(app) {
    // il faut la mettre pour chaque route (access)
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, Content-Type, Accept"
      );
      next();
    });
    // Créer un nouveau panier
app.post("/api/cart", [authJwt.verifyToken], controller.createCart);

// Récupérer tous les paniers
app.get("/api/cart", [authJwt.verifyToken], controller.getAllCarts);

// Récupérer un panier par son ID
app.get("/api/cart/:id", [authJwt.verifyToken], controller.getCartById);

// Mettre à jour un panier
app.put("/api/cart/:id", [authJwt.verifyToken], controller.updateCart);

// Supprimer un panier
app.delete("/api/cart/:id", [authJwt.verifyToken], controller.deleteCart);


  };
  