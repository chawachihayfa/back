const Catalogue = require("../models/catalogue.model");
// create
const Product = require('../models/product.model');
const Promotion = require("../models/promotion.model");
const PDFDocument = require("pdfkit");


exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a catalogue
  const catalogue = new Catalogue({
    title: req.body.title,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    promotions: req.body.promotions ? req.body.promotions : [],
    image: req.body.image ? req.body.image : []
  });

  // Get the 5 recent products
  Product.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .exec((err, products) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Une erreur s'est produite lors de la récupération des produits."
        });
      } else {
        catalogue.produits = products.map(product => product._id); // Ajoute les ID des produits au catalogue
        // Save catalogue in the database
        catalogue.save()
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message: err.message || "Some error occurred while creating the catalogue."
            });
          });
      }
    });
};



//find all promotion

exports.findAllCatalogue = (req, res) => {
  Catalogue.find()
    .then(catalogue => {
      res.send(catalogue);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving catalogue."
      });
    });
};


//find Catalogue by ID 

exports.findByIdCatalogue  = (req, res) => {
  const catalogueId = req.params.id;

  Catalogue.findById(catalogueId)
    .then(catalogue => {
      if (!catalogue) {
        return res.status(404).send({
          message: "catalogue not found with id: " + catalogueId
        });
      }
      res.send(catalogue);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving catalogue with id: " + catalogueId
      });
    });
};
// update 

exports.updateCatalogue = (req, res) => {
  const catalogueyId = req.params.id;

  // Update catalogue in the database
  Catalogue.findByIdAndUpdate(catalogueyId, req.body, { new: true })
    .then(catalogue => {
      if (!catalogue) {
        return res.status(404).send({
          message: "catalogue not found with id: " + catalogueyId
        });
      }

      // Update the produits if they are provided in the request body
      if (req.body.produits) {
        // Get the 5 recent products
        Product.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .exec((err, products) => {
            if (err) {
              return res.status(500).send({
                message: err.message || "Une erreur s'est produite lors de la récupération des produits."
              });
            } else {
              catalogue.produits = products.map(product => product._id); // Assign the IDs of the products to the category
              // Save the updated category
              catalogue.save()
                .then(updateCatalogue => {
                  res.send(updateCatalogue);
                })
                .catch(err => {
                  res.status(500).send({
                    message: err.message || "Error updating catalogue with id: " + catalogueyId
                  });
                });
            }
          });
      } else {
        res.send(catalogue);
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating category with id: " + catalogueyId
      });
    });
};



//delete Catalogue
exports.deleteCatalogue = (req, res) => {
  const catalogueId = req.params.id;

  Catalogue.findByIdAndRemove(catalogueId)
    .then(catalogue => {
      if (!catalogue) {
        return res.status(404).send({
          message: "Catalogue not found with id: " + catalogueId
        });
      }

      // Delete the associated products
      Product.deleteMany({ catalogue: catalogueId })
        .then(() => {
          // Delete the associated promotions
          Promotion.deleteMany({ catalogue: catalogueId })
            .then(() => {
              res.send({ message: "Catalogue and associated products and promotions deleted successfully!" });
            })
            .catch(err => {
              res.status(500).send({
                message: err.message || "Error deleting associated promotions for catalogue with id: " + catalogueId
              });
            });
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Error deleting associated products for catalogue with id: " + catalogueId
          });
        });

    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error deleting catalogue with id: " + catalogueId
      });
    });
};

// Ajouter une image à un catalogue
exports.addImageToCatalogue = (req, res) => {
  const catalogueId = req.params.id;
  const imageId = req.body.imageId;

  // Vérifier si le catalogue existe
  Catalogue.findById(catalogueId)
    .then(catalogue => {
      if (!catalogue) {
        return res.status(404).send({
          message: "Catalogue not found with id: " + catalogueId
        });
      }

      // Mettre à jour le catalogue avec l'ID de l'image
      catalogue.image = imageId;

      catalogue.save()
        .then(updatedCatalogue => {
          res.send(updatedCatalogue);
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Error updating catalogue with id: " + catalogueId
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving catalogue with id: " + catalogueId
      });
    });
};




//export PDF

exports.exportCatalogueAsPDF = (req, res) => {
  const catalogueId = req.params.id;

  Catalogue.findById(catalogueId)
    .populate("promotions")
    .populate("produits")
    .then((catalogue) => {
      if (!catalogue) {
        return res.status(404).send({
          message: "Catalogue not found with id: " + catalogueId,
        });
      }
       // Create a new PDF document
       const doc = new PDFDocument();

       // Set response headers for PDF download
       res.setHeader("Content-Type", "application/pdf");
       res.setHeader(
         "Content-Disposition",
         `attachment; filename=${catalogue.title}.pdf`
       );
 
       // Pipe the PDF document to the response
       doc.pipe(res);
 
       // Add content to the PDF
       doc.fontSize(24).text(catalogue.title, { align: "center" });
       doc.fontSize(16).text("Promotions:");
       doc.list([...catalogue.promotions.map((promotion) => promotion.title)]);
       doc.fontSize(16).text("Produits:");
       doc.list([...catalogue.produits.map((produit) => produit.titles)]);
 
       // Finalize the PDF and end the response
       doc.end();
     })
     .catch((err) => {
       res.status(500).send({
         message: err.message || "Error retrieving catalogue for PDF export.",
       });
     });
 };








