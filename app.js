const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const dbConfig = require("./config/db.config");

const app = express();

var corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 200,
  credentials: true  // Mettez ici l'origine à partir de laquelle vous souhaitez accéder
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "projectPi-session",
    secret: "COOKIE_SECRET", // Utilisez une valeur secrète sécurisée ici, de préférence à partir d'une variable d'environnement
    httpOnly: true
  })
);

const db = require("./models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

// routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/test.routes")(app);
require("./routes/promotion.routes")(app);
require("./routes/product.routes")(app);
require("./routes/category.routes")(app);
require("./routes/image.routes")(app);
require("./routes/devis.routes")(app);
require("./routes/command.routes")(app);
require("./routes/panier.routes")(app);
require("./routes/catalogue.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
