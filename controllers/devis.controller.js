const Devis = require("../models/devis.model");
const nodemailer = require("nodemailer");
const { PDFDocument } = require("pdf-lib");
const User = require("../models/user.model");

// Create a devis
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }

  // Create a devis
  const devis = new Devis({
    user: req.user._id,
    title: req.body.title,
    date: req.body.date,
    customer: req.body.customer,
    total: req.body.total,
    description: req.body.description,
    status: req.body.status || "draft",
    published: req.body.published || false
    
  });

  // Save devis in the database
  devis
    .save()
    .then((data) => {
      // Send notification email
      const email = req.user.email;
      console.log(email)
      const message = `A new devis "${data.title}" has been created.`;
      sendNotificationEmail(email, message);

      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the devis.",
      });
    });
};

// Retrieve a single devis by ID
exports.getDevisById = (req, res) => {
  const devisId = req.params.id;

  Devis.findById(devisId)
    .then((devis) => {
      if (!devis) {
        return res.status(404).send({
          message: "Devis not found with id: " + devisId,
        });
      }
      res.send(devis);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving devis with id: " + devisId,
      });
    });
};

/// Update a devis by ID
exports.updateDevis = (req, res) => {
  const devisId = req.params.id;

  Devis.findByIdAndUpdate(devisId, req.body, { new: true })
    .then((devis) => {
      if (!devis) {
        return res.status(404).send({
          message: "Devis not found with id: " + devisId,
        });
      }

      // Retrieve the user associated with the devis
      User.findById(devis.userId)
        .then((user) => {
          if (!user) {
            // Handle case when user is not found
            return res.status(404).send({
              message: "User not found with id: " + devis.userId,
            });
          }

          // Send notification email to the user
          const email = user.email;
          const message = `The devis "${devis.title}" has been updated.`;
          sendNotificationEmail(email, message);
        })
        .catch((err) => {
          // Handle error when retrieving user
          res.status(500).send({
            message: err.message || "Error retrieving user with id: " + devis.userId,
          });
        });

      res.send(devis);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error updating devis with id: " + devisId,
      });
    });
};

// Delete a devis by ID
exports.deleteDevis = (req, res) => {
  const devisId = req.params.id;

  Devis.findByIdAndRemove(devisId)
    .then((devis) => {
      if (!devis) {
        return res.status(404).send({
          message: "Devis not found with id: " + devisId,
        });
      }

      // Retrieve the user associated with the devis
      User.findById(devis.userId)
        .then((user) => {
          if (!user) {
            // Handle case when user is not found
            return res.status(404).send({
              message: "User not found with id: " + devis.userId,
            });
          }

          // Send notification email to the user
          const email = user.email;
          const message = `The devis "${devis.title}" has been deleted.`;
          sendNotificationEmail(email, message);
        })
        .catch((err) => {
          // Handle error when retrieving user
          res.status(500).send({
            message: err.message || "Error retrieving user with id: " + devis.userId,
          });
        });

      res.send({ message: "Devis deleted successfully!" });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error deleting devis with id: " + devisId,
      });
    });
};


// Mettre à jour le statut d'un devis par ID
exports.updateDevisStatus = (req, res) => {
  const devisId = req.params.id;
  const { status } = req.body;

  Devis.findByIdAndUpdate(
    devisId,
    { status },
    { new: true }
  )
    .then((devis) => {
      if (!devis) {
        return res.status(404).send({
          message: "Devis non trouvé avec l'ID : " + devisId,
        });
      }
      res.send(devis);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Erreur lors de la mise à jour du statut du devis avec l'ID : " + devisId,
      });
    });
};

// Obtenir les statistiques des statuts des devis
exports.getDevisStatusStats = (req, res) => {
  Devis.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ])
    .then((stats) => {
      res.send(stats);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Une erreur s'est produite lors de la récupération des statistiques des statuts des devis.",
      });
    });
};


// Search for devis by title or description
exports.searchInput = (req, res) => {
  const searchTerm = req.params.term;

  const regex = new RegExp(searchTerm, "i");

  Devis.find({ $or: [{ title: regex }, { description: regex }] })
    .then((devis) => {
      res.send(devis);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "An error occurred while searching for devis.",
      });
    });
};

// Save a devis as PDF
exports.saveDevisAsPDF = async (req, res) => {
  const devisId = req.params.id;

  try {
    const devis = await Devis.findById(devisId);
    if (!devis) {
      return res.status(404).send({
        message: "Devis not found with id: " + devisId,
      });
    }

    const doc = await PDFDocument.create();
    const page = doc.addPage();

    page.drawText(`Devis Title: ${devis.title}`, {
      x: 50,
      y: page.getHeight() - 50,
    });

    const pdfBytes = await doc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${devis.title}.pdf"`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error retrieving devis or generating PDF with id: " + devisId,
    });
  }
};

// Send notification email
const sendNotificationEmail = (email, message) => {

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "melekbarhoumiesprit@gmail.com",
    pass: "kkzjahgrdszzxjad",
  },
});

const mailOptions = {
  from: "melekbarhoumiesprit@gmail.com",
  to: "hantousyacin@gmail.com",
  subject: "Devis Notification",
  text: "Your devis has been created",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("Error occurred while sending notification email:", error);
  } else {
    console.log("Notification email sent successfully:", info.response);
  }
});
};
// Statistique des produits ajoutés par mois
exports.getDevisStatsByMonth = async (req, res) => {
  try {
    const stats = await Devis.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Grouper par mois de création
          devis: {
            $push: {
              title: "$title",
              status: "$status"
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
          devis: 1
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Une erreur s'est produite lors de la récupération des statistiques des devis." });
  }
};

// Send a devis by email
exports.sendDevisByEmail = async (req, res) => {
  const devisId = req.params.id;

  try {
    const devis = await Devis.findById(devisId);
    if (!devis) {
      return res.status(404).send({
        message: "Devis not found with id: " + devisId,
      });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: 'melekbarhoumiesprit@gmail.com', // Replace with your email address
        pass: 'kkzjahgrdszzxjad' // Replace with your email password or app password for Gmail
      },
    });

    const doc = await PDFDocument.create();
    const page = doc.addPage();

    page.drawText(`Devis Title: ${devis.title}`, {
      x: 50,
      y: page.getHeight() - 50,
    });

    const pdfBytes = await doc.save();

    const mailOptions = {
      from: "melekbarhoumiesprit@gmail.com", // Replace with your email address
      to: "hantousyacin@gmail.com", // Replace with the recipient's email address
      subject: "Devis",
      text: "Please find attached the devis PDF file.",
      attachments: [
        {
          filename: `${devis.title}.pdf`,
          content: pdfBytes,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred while sending email:", error);
        res.status(500).send({
          message:
            "Error occurred while sending email for devis with id: " + devisId,
        });
      } else {
        console.log("Email sent successfully:", info.response);
        res.send({ message: "Devis sent by email successfully!" });
      }
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error retrieving devis or generating PDF with id: " + devisId,
    });
  }
};