const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;
db.command=require("./command.model")
db.panier=require("./panier.model")
db.image=require("./image.model")
db.category = require("./category.model")
db.product = require("./product.model")
db.test = require("./test.model")
db.user = require("./user.model");
db.role = require("./role.model");
db.promotion = require("./promotion.model")
db.devis = require("./devis.model")
db.ROLES = ["user", "admin"];

module.exports = db;