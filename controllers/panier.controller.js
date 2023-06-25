const Cart = require("../models/panier.model");

// Créer un nouveau panier
exports.createCart = async (req, res) => {
  try {
    const { user, products } = req.body;

    const cart = new Cart({
      user,
      products,
    });

    const savedCart = await cart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer tous les paniers
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate("user products.product");
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un panier par son ID
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate("user products.product");
    if (!cart) {
      return res.status(404).json({ error: "Panier introuvable" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un panier
exports.updateCart = async (req, res) => {
  try {
    const { user, products } = req.body;

    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        user,
        products,
      },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ error: "Panier introuvable" });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un panier
exports.deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndRemove(req.params.id);
    if (!cart) {
      return res.status(404).json({ error: "Panier introuvable" });
    }
    res.json({ message: "Panier supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
