const { authJwt } = require("../middlewares");
const promotion = require("../controllers/promotion.controller");


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
app.post("/api/promotion", [authJwt.verifyToken], promotion.create);

//find all the list promotion 

app.get("/api/listPromotion",[authJwt.verifyToken], promotion.findAllPromotion);

//find promotion by Id 
app.get("/api/promotionID/:id",[authJwt.verifyToken], promotion.findByIdPromotion);

//update Promotion 
app.put("/api/UpdatePromotion/:id", [authJwt.verifyToken], promotion.updatePromo);

//delete by ID 

app.delete("/api/DeletePromotion/:id", [authJwt.verifyToken], promotion.deletePromo);

//search by title
app.get("/api/searchPromotion", [authJwt.verifyToken], promotion.searchPromotion);

//tri promotion par dernier 
app.get("/api/sortPromotionsByDateCreated",[authJwt.verifyToken], promotion.sortPromotionsByDateCreated);

//filtrage par pourcentage min /max
app.get("/api/filterPromotionsByPercentage",[authJwt.verifyToken], promotion.filterPromotionsByPercentage);

//ajout image pour promotion

app.put("/api/promotions/:id/addImage", [authJwt.verifyToken], promotion.addImageToPromotion);


};
