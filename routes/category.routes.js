const { authJwt } = require("../middlewares");
const controller = require("../controllers/category.controller");

module.exports = function(app) {
  // il faut la mettre pour chaque route (access)
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  // Créer une nouvelle catégorie
  app.post("/api/category", [authJwt.verifyToken], controller.create);

   // Récupérer toute les catégories
   app.get("/api/category", [authJwt.verifyToken], controller.getAllCategorys);

   // Récupérer une catégorie par son ID
   app.get("/api/category/:id", [authJwt.verifyToken], controller.getCategoryById);

   app.put("/api/category/:id", [authJwt.verifyToken], controller.updateCategory);
 /*
   // Mettre à jour une catégorie
   app.put("/api/category/:id", [authJwt.verifyToken], controller.updateCategory);*/
   app.put("/api/category/:id", [authJwt.verifyToken], controller.updateCategory);
 /*
   // Supprimer une catégorie
   app.delete("/api/category/:id", [authJwt.verifyToken], controller.deleteCategory);*/
   app.delete("/api/category/:id", [authJwt.verifyToken], controller.deleteCategory);
/*
   //Afficher les produits par catégorie
   app.get("/category/:categoryId/produits", [authJwt.verifyToken], controller.getProductsByCategory);
 */
   /*// Ajouter un produit à une catégorie
  app.post("/api/category/:categoryId/addProduct/:productId", [authJwt.verifyToken], controller.addProductToCategory);

  // Retirer un produit d'une catégorie
  app.delete("/api/category/:categoryId/removeProduct/:productId", [authJwt.verifyToken], controller.removeProductFromCategory);
*/
};