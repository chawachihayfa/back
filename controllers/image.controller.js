const Image=require("../models/image.model")
exports.create = (req, res) => {
  // Validate request
  if (!req.file) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const { filename, path: filePath, contentType, size } = req.file;
  // Create an image
  const image = new Image({
    filename,
    path: filePath,
    contentType,
    size,
    published: req.body.published ? req.body.published : false
  });

  // Save image in the database
  image
    .save(image)
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
// Retrieve all Images
exports.getAllImages = (req, res) => {
  Image.find()
    .then(images => {
      res.send(images);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving image."
      });
    });
};
// Retrieve a single image by ID
exports.getImageById = (req, res) => {
  const imageId = req.params.id;

  Image.findById(imageId)
    .then(image => {
      if (!image) {
        return res.status(404).send({
          message: "Image not found with id: " + imageId
        });
      }
      res.send(image);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving product with id: " + productId
      });
    });
};


// Delete Picture
exports.deleteImage = async (req, res) => {
  try {
    const imageId = req.params.imageId;

    // Vérifier si l'image existe
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).send({ message: "L'image n'a pas été trouvée." });
    }

    // Supprimer l'image de la base de données
    await Image.findByIdAndDelete(imageId);

    res.status(200).send({ message: "L'image a été supprimée avec succès." });
  } catch (error) {
    res.status(500).send({ message: "Une erreur s'est produite lors de la suppression de l'image." });
  }
};
