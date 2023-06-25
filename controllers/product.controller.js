const Product=require("../models/product.model")
const Image = require("../models/image.model");
const excel = require('exceljs');
const fs = require('fs');
const path = require("path");

exports.create = (req, res) => {
  // Validate request
  if (!req.body.titles) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a product
  const product = new Product({
    titles: req.body.titles,
    description: req.body.description,
    price:req.body.price,
    quantityStock:req.body.quantityStock,
    published: req.body.published ? req.body.published : false,
    images: req.body.images ? req.body.images : [],
    categories:req.body.categories ? req.body.categories : [],
    rating:req.body.rating
  });

  // Save test in the database
  product
    .save(product)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the product."
      });
    });
};
// Retrieve all products
exports.getAllProducts = (req, res) => {
  Product.find()
    .then(products => {
      res.send(products);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving products."
      });
    });
};
// Retrieve a single product by ID
exports.getProductById = (req, res) => {
  const productId = req.params.id;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.status(404).send({
          message: "Product not found with id: " + productId
        });
      }
      res.send(product);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving product with id: " + productId
      });
    });
};

// Update a product by ID
exports.updateProduct = (req, res) => {
  const productId = req.params.id;

  Product.findByIdAndUpdate(productId, req.body, { new: true })
    .then(product => {
      if (!product) {
        return res.status(404).send({
          message: "Product not found with id: " + productId
        });
      }
      res.send(product);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating product with id: " + productId
      });
    });
};

// Delete a product by ID
exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  Product.findByIdAndRemove(productId)
    .then(product => {
      if (!product) {
        return res.status(404).send({
          message: "Product not found with id: " + productId
        });
      }
      res.send({ message: "Product deleted successfully!" });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error deleting product with id: " + productId
      });
    });
};

exports.searchInput = (req, res) => {
  const searchTerm = req.params.term; // Récupérer le terme de recherche depuis les paramètres de la requête

  // Utiliser une expression régulière pour effectuer une recherche insensible à la casse
  const regex = new RegExp(searchTerm, "i");

  // Utiliser la méthode find du modèle Product pour rechercher les produits correspondants
  Product.find({ $or: [{ titles: regex }, { description: regex }] })
    .then(products => {
      res.send(products);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur s'est produite lors de la recherche des produits.",
      });
    });
};
//Ajouter une image à un produit
exports.addImageToProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send({ message: "Le produit n'a pas été trouvé." });
    }
    // Créer une nouvelle image
    const image = new Image({
      filename: req.body.filename,
      path: req.body.path,
      contentType: req.body.contentType,
      size: req.body.size,
      published: req.body.published ? req.body.published : false,
      
    });
    // Enregistrer l'image dans la base de données
    await image.save();

    // Ajouter l'image au produit
    product.images.push(image);
    await product.save();

    res.status(200).send({ message: "L'image a été ajoutée au produit avec succès." });
  } catch (error) {
    res.status(500).send({ message: "Une erreur s'est produite lors de l'ajout de l'image au produit." });
  }
};
/*
// Mise à jour image d'un produit
exports.updateImage = async (req, res) => {
  try {
    const imageId = req.params.imageId; // ID de l'image à mettre à jour
    const productId = req.params.productId; // ID du produit associé

    // Récupérer l'image à mettre à jour
    const image = await Image.findByIdAndUpdate(imageId, {
      filename: req.body.filename,
      path: req.body.path,
      contentType: req.body.contentType,
      size: req.body.size,
      published: req.body.published ? req.body.published : false
    }, { new: true });

    if (!image) {
      return res.status(404).send({ message: "L'image n'a pas été trouvée." });
    }

    // Mettre à jour le produit avec la référence de l'image mise à jour
    const product = await Product.findByIdAndUpdate(productId, {
      image: image._id // Modifier le champ "image" avec l'ID de la nouvelle image
    }, { new: true });

    if (!product) {
      return res.status(404).send({ message: "Le produit n'a pas été trouvé." });
    }

    res.status(200).send({ message: "L'image a été mise à jour avec succès dans le produit." });
  } catch (error) {
    res.status(500).send({ message: "Une erreur s'est produite lors de la mise à jour de l'image du produit." });
  }
};*/
/////////////////////////////////////////
/*exports.updateImage = async (req, res) => {
  try {
    const imageId = req.params.imageId; // ID de l'image à mettre à jour
    const productId = req.params.productId; // ID du produit associé

    // Récupérer l'image à mettre à jour
    const image = await Image.findByIdAndUpdate(imageId, {
      filename: req.body.filename,
      path: req.body.path,
      contentType: req.body.contentType,
      size: req.body.size,
      published: req.body.published ? req.body.published : false
    }, { new: true });

    if (!image) {
      return res.status(404).send({ message: "L'image n'a pas été trouvée." });
    }

    // Enregistrer l'image dans la collection d'images si elle n'existe pas déjà
    const savedImage = await image.save();

    // Mettre à jour le produit avec la référence de l'image mise à jour
    const product = await Product.findByIdAndUpdate(productId, {
      $addToSet: { images: savedImage._id } // Ajouter l'ID de l'image à la liste des images du produit
    }, { new: true });

    if (!product) {
      return res.status(404).send({ message: "Le produit n'a pas été trouvé." });
    }

    res.status(200).send({ message: "L'image a été mise à jour avec succès dans le produit." });
  } catch (error) {
    res.status(500).send({ message: "Une erreur s'est produite lors de la mise à jour de l'image du produit." });
  }
};*/



exports.uploadProductImage = async (req, res) => {
  try {
    const productId = req.params.productId; // ID du produit associé
    const { filename, path: filePath, contentType, size, published } = req.file;

    // Créer une nouvelle instance de l'image
    const newImage = new Image({
      filename,
      path: filePath,
      contentType,
      size,
      published,
    });

    // Enregistrer l'image dans la collection d'images
    const savedImage = await newImage.save();

    // Mettre à jour le produit avec l'ID de l'image
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $addToSet: { images: savedImage._id }, // Ajouter l'ID de l'image à la liste des images du produit
      },
      { new: true }
    );

    if (!product) {
      // Supprimer l'image enregistrée si le produit n'est pas trouvé
      await savedImage.remove();

      return res
        .status(404)
        .send({ message: "Le produit n'a pas été trouvé." });
    }

    // Déplacer le fichier d'image vers le dossier public
    const publicFolderPath = path.join(__dirname, "../public/images");
    const newFilePath = path.join(publicFolderPath, savedImage.filename);

    fs.renameSync(req.file.path, newFilePath);

    res.status(200).send({
      message: "L'image a été téléchargée avec succès et associée au produit.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Une erreur s'est produite lors de l'upload de l'image.",
    });
  }
};




// Tri des produits par createdAt
exports.getProductsSortedByCreatedAt = (req, res) => {
  Product.find()
    .sort({ createdAt: -1 }) // Tri ascendant par createdAt (1 pour ascendant, -1 pour descendant)
    .then(products => {
      res.send(products);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur s'est produite lors de la récupération des produits triés par createdAt."
      });
    });
};
//Les 5 derniers produits ajoutés
exports.getRecentProducts = (req, res) => {
  Product.find()
    .sort({ createdAt: -1 }) // Tri par ordre décroissant de "createdAt"
    .limit(5) // Limite le nombre de résultats à 5
    .exec((err, products) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Une erreur s'est produite lors de la récupération des produits."
        });
      } else {
        res.send(products);
      }
    });
};
//Afficher les produits par categories
exports.getProductsByCategory = (req, res) => {
  const categoryId = req.params.categoryId;

  Product.find({ category: categoryId })
    .populate("category") // Si vous souhaitez également inclure les détails de la catégorie dans la réponse
    .then(products => {
      res.send(products);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur s'est produite lors de la récupération des produits par catégorie."
      });
    });
};
//filtre multicritère par prix et par catégorie

exports.getFilteredProducts = (req, res) => {
  const { category, minPrice, maxPrice } = req.query;

  let filter = {};

  if (category) {
    filter.category = category;
  }

  if (minPrice && maxPrice) {
    filter.price = { $gte: minPrice, $lte: maxPrice };
  } else if (minPrice) {
    filter.price = { $gte: minPrice };
  } else if (maxPrice) {
    filter.price = { $lte: maxPrice };
  }

  Product.find(filter)
    .populate("categories")
    .then(products => {
      res.send(products);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur s'est produite lors de la récupération des produits avec le filtre multicritère."
      });
    });
};
// Recommandation des produits de la même catégorie lors de l'affichage d'un produit
exports.getProductSimilaire = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Récupérer le produit demandé
    const prod = await Product.findById(productId).populate('categories');

    if (!prod) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    // Extraire la catégorie du produit
    const categoryId = prod.categories[0]._id;

    // Trouver d'autres produits de la même catégorie
    const similarProducts = await Product.find({
      categories: categoryId,
      _id: { $ne: productId } // Exclure le produit actuel
    }).limit(5).populate('categories'); // Limiter le nombre de produits similaires à afficher et peupler les données de catégorie

    res.status(200).json({
      prod: prod,
      similarProducts: similarProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération du produit.' });
  }
};
// Statistique des produits ajoutés par mois
exports.getProductStatsByMonth = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Grouper par mois de création
          products: {
            $push: {
              title: "$titles",
              quantityStock: "$quantityStock"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                months: [
                  "",
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "Décember"
                ]
              },
              in: {
                $arrayElemAt: ["$$months", "$_id"]
              }
            }
          },
          products: 1
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Une erreur s'est produite lors de la récupération des statistiques des produits." });
  }
};

//Statistique Nombre de produits par catégorie
exports.getProductCountByCategory = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$categories", // Grouper par catégorie
          count: { $sum: 1 } // Compter le nombre de produits par catégorie
        }
      },
      {
        $lookup: {
          from: "categories", // Nom de la collection des catégories
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $project: {
          _id: 0,
          category: {
            $arrayElemAt: ["$category.titles", 0] // Récupérer le titles de la catégorie
          },
          count: 1
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Une erreur s'est produite lors de la récupération des statistiques des produits par catégorie." });
  }
};
//Rating par produit
exports.updateProductRating = async (req, res) => {
  try {
    const productId = req.params.productId;
    const rating = req.body.rating;

    // Vérifier si le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    // Mettre à jour le champ rating du produit
    product.rating = rating;
    const updatedProduct = await product.save();

    res.status(200).json({ message: 'Évaluation du produit mise à jour avec succès.', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour de l\'évaluation du produit.' });
  }
};
//Pareto des rating par produit
exports.getParetoRatings = async (req, res) => {
  try {
    const paretoRatings = await Product.aggregate([
      {
        $group: {
          _id: { id: "$_id", title: "$titles" }, // Grouper par ID de produit et titre de produit
          count: { $sum: 1 }, // Compter le nombre de produits par ID de produit et titre de produit
          ratings: { $sum: "$rating" } // Somme des ratings par ID de produit et titre de produit
        }
      },
      {
        $sort: {
          ratings: -1 // Trier par ordre décroissant des rating
        }
      }
    ]);

    res.status(200).json(paretoRatings);
  } catch (error) {
    res.status(500).json({ message: "Une erreur s'est produite lors de la récupération du Pareto des ratings des produits." });
  }
};



exports.exportProductsToExcel = async (req, res) => {
  try {
    // Récupérer les produits à exporter
    const products = await Product.find().populate('images');

    // Créer un nouveau classeur Excel
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Produits');

    // Définir les en-têtes de colonne
    worksheet.columns = [
      { header: 'Titre', key: 'titles', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Prix', key: 'price', width: 10 },
      { header: 'Quantité en stock', key: 'quantityStock', width: 15 },
      { header: 'Publié', key: 'published', width: 10 },
      { header: 'Image', key: 'image', width: 30 },
    ];

    // Ajouter les données des produits
    products.forEach((product) => {
      const imageUrls = product.images.map((image) => image.url).join(', ');
      worksheet.addRow([
        product.titles,
        product.description,
        product.price,
        product.quantityStock,
        product.published ? 'Oui' : 'Non',
        imageUrls,
      ]);
    });

    // Générer les données binaires du fichier Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Définir les en-têtes de la réponse HTTP pour le téléchargement
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=produits.xlsx');

    // Envoyer les données binaires du fichier Excel dans la réponse HTTP
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Une erreur s\'est produite lors de l\'exportation des produits.' });
  }
};
