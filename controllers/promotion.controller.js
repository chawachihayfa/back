const { promotion } = require("../models");
const Promotion = require("../models/promotion.model");

// create

exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    return res.status(400).send({ message: "Le titre ne peut pas être vide !" });
  }

  // Check if promotion with the same title already exists
  Promotion.findOne({ title: req.body.title })
    .then(existingPromotion => {
      if (existingPromotion) {
        return res.status(400).send({ message: "Une promotion avec le même titre existe déjà." });
      }

      // Create a new promotion
      const promotion = new Promotion({
        title: req.body.title,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        percentage: req.body.percentage,
        description: req.body.description,
        promotionStatus: req.body.promotionStatus ? req.body.published : false,
        produits: req.body.produits ? req.body.produits : [],
        image: req.body.image ? req.body.image : []
      });

      // Save promotion in the database
      promotion.save()
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Une erreur s'est produite lors de la création de la promotion."
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur s'est produite lors de la recherche de la promotion existante."
      });
    });
};




//find all promotion

exports.findAllPromotion = (req, res) => {
  Promotion.find()
    .then(promotion => {
      res.send(promotion);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving promotion."
      });
    });
};



//find promotion by ID 

exports.findByIdPromotion  = (req, res) => {
  const promotionId = req.params.id;

  Promotion.findById(promotionId)
    .then(promotion => {
      if (!promotion) {
        return res.status(404).send({
          message: "promotion not found with id: " + promotionId
        });
      }
      res.send(promotion);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving promotion with id: " + promotionId
      });
    });
};





// Update a promotion by ID
exports.updatePromo = (req, res) => {
  const promotionId = req.params.id;

  Promotion.findByIdAndUpdate(promotionId, req.body, { new: true })
    .then(promotion => {
      if (!promotion) {
        return res.status(404).send({
          message: "Promotion not found with id: " + promotionId
        });
      }
      res.send(promotion);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating promotion with id: " + promotionId
      });
    });
};

// Delete a product by ID
exports.deletePromo = (req, res) => {
  const promotionId = req.params.id;

  Promotion.findByIdAndRemove(promotionId)
    .then(promotion => {
      if (!promotion) {
        return res.status(404).send({
          message: "promotion not found with id: " + promotionId
        });
      }
      res.send({ message: "promotion deleted successfully!" });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error deleting promotion with id: " + promotionId
      });
    });
};



// Search promotion by title
exports.searchPromotion = (req, res) => {
  const searchQuery = req.query.q;

  Promotion.find({ title: { $regex: searchQuery, $options: "i" } })
    .then(promotions => {
      res.send(promotions);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error occurred while searching for promotions."
      });
    });
};

 //trie les promotions par ordre décroissant de leur date de création (dernière date de création en premier)
exports.sortPromotionsByDateCreated = (req, res) => {
  Promotion.find()
    .sort({ createdAt: -1 }) // Trie par ordre décroissant de la propriété 'createdAt'
    .then(promotions => {
      res.send(promotions);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur s'est produite lors du tri des promotions."
      });
    });
};

//filtrage par pourcentage de plus min jusqu'au plus max 

exports.filterPromotionsByPercentage = (req, res) => {
  const minPercentage = req.query.min;
  const maxPercentage = req.query.max;

  Promotion.find({
    percentage: {
      $gte: minPercentage, // Filtre pourcentage supérieur ou égal à minPercentage
      $lte: maxPercentage  // Filtre pourcentage inférieur ou égal à maxPercentage
    }
  })
    .then(promotions => {
      res.send(promotions);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur s'est produite lors du filtrage des promotions."
      });
    });
};

// Ajouter une image à une promotion
exports.addImageToPromotion = (req, res) => {
  const promotionId = req.params.id;
  const imageId = req.body.imageId;

  // Vérifier si la promotion existe
  Promotion.findById(promotionId)
    .then(promotion => {
      if (!promotion) {
        return res.status(404).send({
          message: "Promotion not found with id: " + promotionId
        });
      }

      // Mettre à jour la promotion avec l'ID de l'image
      promotion.image = imageId;

      promotion.save()
        .then(updatedPromotion => {
          res.send(updatedPromotion);
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Error updating promotion with id: " + promotionId
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving promotion with id: " + promotionId
      });
    });
};





