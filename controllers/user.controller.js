
const User = require('../models/user.model');
const Role = require('../models/role.model');


exports.findAllUser = (req, res) => {
  const username = req.query.username;
  var condition = username ? { username: { $regex: new RegExp(username), $options: "i" } } : {};

  User.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};
exports.getUserProfile = (req, res) => {
  const userId = req.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres de la requête

  User.findById(userId)
    .select('username email profile') // Sélectionner les champs du profil que vous souhaitez renvoyer
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    })
    .catch(err => {
      res.status(500).json({ message: err.message || "Some error occurred while retrieving user profile." });
    });
};


exports.updateUserProfile = (req, res) => {
  const userId = req.params.userId;
  const { username, email,  } = req.body;

  User.findByIdAndUpdate(userId, { username, email, }, { new: true })
    .then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    })
    .catch(err => {
      res.status(500).json({ message: err.message || 'Error updating user profile' });
    });
};


const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Vérifier si l'utilisateur existe avec l'e-mail fourni
    const user = await User.findOne({ email  });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Générer un jeton de réinitialisation du mot de passe
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Enregistrer le jeton de réinitialisation et sa date d'expiration dans la base de données
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Jeton valide pendant 1 heure
    await user.save();

    // Envoyer l'e-mail de réinitialisation du mot de passe avec le lien de réinitialisation
    const transporter = nodemailer.createTransport({
      // Configuration du service d'envoi d'e-mails (par exemple, Gmail)
      service: 'gmail',
      auth: {
        user: 'melekbarhoumiesprit@gmail.com',
        pass: 'kkzjahgrdszzxjad'
      }
    });

    const mailOptions = {
      from: 'melekbarhoumiesprit@gmail.com',
      to: email,
      subject: 'rest Password',
      html: `
        <p>Hello,</p>
        <p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste it into your browser to complete the process:</p>
        <p>http://localhost:8080/api/reset-password/${resetToken}</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent: ' + info.response);
      res.json({ message: 'Email sent successfully' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
const bcrypt = require('bcrypt');

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Chercher l'utilisateur avec le jeton de réinitialisation
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalid or expired' });
    }

    // Générer un nouveau hash de mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
}



exports.createUserFromGoogle = async (req, res) => {
  const { email } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà dans la base de données
    let user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Générer un nom d'utilisateur à partir de l'e-mail
    const username = email.split('@')[0]; // Utilisation de la partie avant le symbole @ comme nom d'utilisateur

    // Générer un mot de passe aléatoire pour l'utilisateur
    const randomPassword = Math.random().toString(36).slice(-8);

    // Créer un nouvel utilisateur avec les informations de Google
    user = new User({
      email,
      username,
      password: randomPassword // Vous pouvez utiliser un mot de passe aléatoire ou laisser le champ vide selon vos besoins
    });

    // Assigner le rôle "user" à l'utilisateur
    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      return res.status(500).json({ message: 'User role not found' });
    }
    user.roles = [userRole._id];

    // Définir l'état de l'utilisateur comme "nonConfirmé"
    user.statusUser = 'nonConfirmé';

    // Sauvegarder l'utilisateur dans la base de données
    await user.save();

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
      res.json({ message: 'User created successfully. Confirmation email sent to admin.' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating user' });
  }
};





exports.confirmUserByLink = async (req, res) => {
  const { userId } = req.params;

  try {
    // Vérifier si l'utilisateur existe dans la base de données
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérifier si l'utilisateur a déjà été confirmé
    if (user.statusUser === 'confirmé') {
      return res.status(400).json({ message: 'User already confirmed' });
    }

    // Mettre à jour l'état de l'utilisateur pour le marquer comme confirmé
    user.statusUser = 'confirmé';

    await user.save();

    // Envoyer l'e-mail de confirmation à l'utilisateur
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
      to: user.email, // Envoyer l'e-mail à l'utilisateur
      subject: 'Account Confirmation',
      html: `
        <p>Hello ${user.username},</p>
        <p>Your account has been confirmed successfully.</p>
        <p>Thank you for registering.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent: ' + info.response);
      res.json({ message: 'User confirmed successfully' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error confirming user' });
  }
};

// Bloquer un utilisateur
exports.blockUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Vérifier si l'utilisateur existe dans la base de données
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérifier si l'utilisateur est déjà bloqué
    if (user.statusCompte === 'bloqué') {
      return res.status(400).json({ message: 'User already blocked' });
    }

    // Mettre à jour l'état de l'utilisateur pour le bloquer
    user.statusCompte = 'bloqué';

    await user.save();

    // Envoyer l'e-mail de notification à l'utilisateur
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
      to: user.email, // Envoyer l'e-mail à l'utilisateur
      subject: 'Account Blocked',
      html: `
        <p>Hello ${user.username},</p>
        <p>Your account has been blocked.</p>
        <p>Please contact the administrator for further information.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent: ' + info.response);
      res.json({ message: 'User blocked successfully' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error blocking user' });
  }
};


// Débloquer un utilisateur
exports.unblockUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Vérifier si l'utilisateur existe dans la base de données
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérifier si l'utilisateur est déjà débloqué
    if (user.statusCompte === 'actif') {
      return res.status(400).json({ message: 'User already unblocked' });
    }

    // Mettre à jour l'état de l'utilisateur pour le débloquer
    user.statusCompte = 'actif';

    await user.save();

    // Envoyer l'e-mail de notification à l'utilisateur
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
      to: user.email, // Envoyer l'e-mail à l'utilisateur
      subject: 'Account Unblocked',
      html: `
        <p>Hello ${user.username},</p>
        <p>Your account has been unblocked.</p>
        <p>You can now access your account.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent: ' + info.response);
      res.json({ message: 'User unblocked successfully' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error unblocking user' });
  }
};

exports.getBlockedUserCount = async (req, res) => {
  try {
    // Compter le nombre d'utilisateurs avec le statut de compte "bloqué"
    const blockedUserCount = await User.countDocuments({ statusCompte: 'bloqué' });

    res.json({ blockedUserCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error retrieving blocked user count' });
  }
};

exports.getUnblockedUserCount = async (req, res) => {
  try {
    // Compter le nombre d'utilisateurs avec le statut de compte "actif"
    const unblockedUserCount = await User.countDocuments({ statusCompte: 'actif' });

    res.json({ unblockedUserCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error retrieving unblocked user count' });
  }
};


exports.getAllUsers = (req, res) => {
  User.find()
    .select('username email profile') // Sélectionner les champs du profil que vous souhaitez renvoyer
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.status(500).json({ message: err.message || "Some error occurred while retrieving users." });
    });
};

exports.updatePassword = async (req, res) => {
  const userId = req.params.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    // Vérifier l'utilisateur dans la base de données
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérifier si l'ancien mot de passe correspond à celui stocké en base de données
    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    // Mettre à jour le mot de passe de l'utilisateur
    user.password = bcrypt.hashSync(newPassword, 8);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating password' });
  }
};





