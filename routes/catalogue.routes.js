const { authJwt } = require("../middlewares");
const catalogue = require("../controllers/catalogue.controller");


module.exports = function(app) {
  // il faut la mettre pour chaque route (access)
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

// Create a new catalogue
app.post("/api/catalogue", [authJwt.verifyToken], catalogue.create);

//find all the list catalogue 

 app.get("/api/listCatalogues",[authJwt.verifyToken], catalogue.findAllCatalogue);

//find Catalogue by Id 
app.get("/api/catalogueID/:id",[authJwt.verifyToken], catalogue.findByIdCatalogue);

//update Catalogue 
app.put("/api/UpdateCatalogues/:id", [authJwt.verifyToken], catalogue.updateCatalogue);

//delete by ID 

app.delete("/api/DeleteCatalogues/:id", [authJwt.verifyToken], catalogue.deleteCatalogue); 

app.put('/catalogues/:id/add-image',[authJwt.verifyToken], catalogue.addImageToCatalogue);

// Export catalogue  PDF
app.post("/api/:id/export/pdf",[authJwt.verifyToken], catalogue.exportCatalogueAsPDF);




};
