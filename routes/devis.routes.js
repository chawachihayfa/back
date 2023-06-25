const { authJwt } = require("../middlewares");
const controller = require("../controllers/devis.controller");

module.exports = function(app) {
  // il faut la mettre pour chaque route (access)
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

// Create devis
app.post("/api/devis", [authJwt.verifyToken], controller.create);

// Get devis with ID
app.get("/api/devis/:id", [authJwt.verifyToken], controller.getDevisById);

// Update devis
app.put("/api/devis/:id", [authJwt.verifyToken], controller.updateDevis);

// Delete devis
app.delete("/api/devis/:id", [authJwt.verifyToken], controller.deleteDevis);

// Search devis
app.get("/api/devis/search/:term",  [authJwt.verifyToken], controller.searchInput);

//Save devis as PDF
app.get("/api/devis/:id/pdf",[authJwt.verifyToken], controller.saveDevisAsPDF);

// Send mail
app.post("/api/devis/:id/email",[authJwt.verifyToken], controller.sendDevisByEmail);

// Mettre à jour le statut d'un devis par ID
app.put("/api/devis/:id/status",[authJwt.verifyToken], controller.updateDevisStatus);

// Obtenir les statistiques des statuts des devis
app.get("/api/devis/stats/status",[authJwt.verifyToken], controller.getDevisStatusStats);

// Obtenir les statistiques  des devis selon mois
app.get("/api/devis/stats/month",[authJwt.verifyToken], controller.getDevisStatsByMonth);


};