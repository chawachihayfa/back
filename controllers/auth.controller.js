const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const nodemailer = require('nodemailer');

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà dans la base de données
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.statusCompte === 'bloqué') {
        return res.status(409).json({ message: 'Account is blocked. Contact administrator for assistance.' });
      }
      return res.status(409).json({ message: 'User already exists' });
    }

    // Créer un nouvel utilisateur avec les informations fournies
    const user = new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    });
    user.statusUser = 'nonConfirmé';
    user.statusCompte = 'actif';

    // Sauvegarder l'utilisateur dans la base de données
    await user.save();

    // Vérifier les rôles
    Role.find({ name: { $in: req.body.roles } }, (err, roles) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Error finding roles' });
      }

      // Assigner les rôles à l'utilisateur
      user.roles = roles.map(role => role._id);
      user.save(err => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: 'Error assigning roles to user' });
        }

        // Envoyer l'e-mail de confirmation à l'administrateur
        const transporter = nodemailer.createTransport({
          // Configuration du service d'envoi d'e-mails (par exemple, Gmail)
          service: 'gmail',
          auth: {
            user: 'melekbarhoumiesprit@gmail.com',
            pass: 'kkzjahgrdszzxjad'
          },
        });

        const mailOptions = {
          from: 'melekbarhoumiesprit@gmail.com',
          to: 'melekbarhoumiesprit@gmail.com',
          subject: 'New User Registration',
          html: `
            <p>Hello Admin,</p>
            <p>A new user has registered:</p>
            <p>Username: ${username}</p>
            <p>Email: ${email}</p>
            <p>Please confirm the user registration by clicking on the following link:</p>
            <p>http://localhost:8080/api/confirm-user/${user._id}</p>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Error sending email' });
          }
          console.log('Email sent: ' + info.response);
          res.json({ message: 'User registration successful. Confirmation email sent to admin.' });
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error registering user' });
  }
};


exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      if (user.statusUser == "nonConfirmé") {
        return res.status(401).send({ message: "Account not confirmed yet." });
      }
      if (user.statusCompte == "bloqué") {
        return res.status(401).send({ message: "Account is bloque yet." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      req.session.token = token;

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        token: token,
      });
    });
};


exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};
