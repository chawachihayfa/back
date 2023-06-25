const Command = require("../models/command.model");

// Méthode pour créer une nouvelle commande
exports.createCommand = async (req, res) => {
  try {
    const command = new Command({
      user: req.body.user,
      dateCommand: req.body.dateCommand,
      TotalPriceCommmand: req.body.TotalPriceCommmand,
      statusCommand: req.body.statusCommand,
      addressDelivry: req.body.addressDelivry,
      produits: req.body.produits ? req.body.produits : []
    });

    const savedCommand = await command.save();
    res.status(201).json(savedCommand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Méthode pour récupérer toutes les commandes
exports.getAllCommands = async (req, res) => {
  try {
    const commands = await Command.find();
    res.json(commands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Méthode pour récupérer une commande par son ID
exports.getCommandById = async (req, res) => {
  try {
    const command = await Command.findById(req.params.id);
    if (!command) {
      return res.status(404).json({ error: "Command not found" });
    }
    res.json(command);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Méthode pour mettre à jour une commande
exports.updateCommand = async (req, res) => {
  try {
    const command = await Command.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!command) {
      return res.status(404).json({ error: "Command not found" });
    }
    res.json(command);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Méthode pour supprimer une commande
exports.deleteCommand = async (req, res) => {
  try {
    const command = await Command.findByIdAndRemove(req.params.id);
    if (!command) {
      return res.status(404).json({ error: "Command not found" });
    }
    res.json({ message: "Command deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};