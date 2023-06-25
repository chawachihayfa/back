const Category=require("../models/category.model");
const Product = require("../models/product.model");
exports.create = (req, res) => {
  // Validate request
  if (!req.body.titles) {
    return res.status(400).send({ message: "Le titre ne peut pas être vide !" });
  }

  // Check if category with the same title already exists
  Category.findOne({ titles: req.body.titles })
    .then(existingCategory => {
      if (existingCategory) {
        return res.status(400).send({ message: "Une catégorie avec le même titre existe déjà." });
      }

      // Create a new category
      const category = new Category({
        titles: req.body.titles,
        description: req.body.description,
        published: req.body.published ? req.body.published : false,
        produits: req.body.produits ? req.body.produits : []
      });

      // Save category in the database
      category.save()
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Une erreur s'est produite lors de la création de la catégorie."
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur s'est produite lors de la recherche de la catégorie existante."
      });
    });
};
// Retrieve all category
exports.getAllCategorys = (req, res) => {
  Category.find()
    .then(categorys => {
      res.send(categorys);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving categorys."
      });
    });
};
// Retrieve a single Category by ID
exports.getCategoryById = (req, res) => {
  const categoryId = req.params.id;

  Category.findById(categoryId)
    .then(category => {
      if (!category) {
        return res.status(404).send({
          message: "category not found with id: " + categoryId
        });
      }
      res.send(category);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving category with id: " + categoryId
      });
    });
};

exports.updateCategory = (req, res) => {
  const categoryId = req.params.id;

  // Update category in the database
  Category.findByIdAndUpdate(categoryId, req.body, { new: true })
    .then(category => {
      if (!category) {
        return res.status(404).send({
          message: "Category not found with id: " + categoryId
        });
      }

      // Update the produits if they are provided in the request body
      if (req.body.produits) {
        category.produits = req.body.produits;
      }

      // Save the updated category
      category.save()
        .then(updatedCategory => {
          res.send(updatedCategory);
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Error updating category with id: " + categoryId
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating category with id: " + categoryId
      });
    });
};
//delete category
exports.deleteCategory = (req, res) => {
  const categoryId = req.params.id;

  Category.findByIdAndRemove(categoryId)
    .then(category => {
      if (!category) {
        return res.status(404).send({
          message: "Category not found with id: " + categoryId
        });
      }

      // Delete the associated produits
      // Suppose you have a separate "Product" model/schema
      Product.deleteMany({ category: categoryId })
        .then(() => {
          res.send({ message: "Category and associated products deleted successfully!" });
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Error deleting associated products for category with id: " + categoryId
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error deleting category with id: " + categoryId
      });
    });
};