const { authJwt } = require("../middlewares");
const controller = require("../controllers/command.controller");

module.exports = function(app) {
  // il faut la mettre pour chaque route (access)
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

// Créer une nouvelle commande
app.post("/commands", [authJwt.verifyToken],controller.createCommand);

// Récupérer toutes les commandes
app.get("/commands", [authJwt.verifyToken],controller.getAllCommands);

// Récupérer une commande par son ID
app.get("/commands/:id", [authJwt.verifyToken],controller.getCommandById);

// Mettre à jour une commande
app.put("/commands/:id", [authJwt.verifyToken],controller.updateCommand);

//Supprimer commande
app.delete("/commands/:id", [authJwt.verifyToken],controller.deleteCommand);



};
