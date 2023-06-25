const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const authMiddleware = require('../middlewares/auth.middleware');

module.exports = function(app) {
  // il faut la mettre pour chaque route (access)
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/listUser",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findAllUser
  );
  // donner 
  app.get('/api/users/profiles/:id', [authJwt.verifyToken],controller.getUserProfile);
//donner 
  app.put('/api/users/profile/:userId', [authJwt.verifyToken],controller.updateUserProfile);
  app.put('/api/users/password/:userId', [authJwt.verifyToken],controller.updatePassword);

  //tester deja 
  app.post('/api/forgotPassword', controller.forgotPassword);
  app.post('/api/reset-password', controller.resetPassword);
  //ajouter with role user  donne 
  app.post('/api/auth/google', controller.createUserFromGoogle);
  //test 
  app.get('/api/confirm-user/:userId', controller.confirmUserByLink);
//email done + phone
  app.put('/api/block-user/:userId', [authJwt.verifyToken, authJwt.isAdmin],controller.blockUser);
  app.put('/api/unblock-user/:userId',[authJwt.verifyToken, authJwt.isAdmin], controller.unblockUser)
// tester 

app.get('/api/users', [authJwt.verifyToken, authJwt.isAdmin],controller.getAllUsers);

  app.get('/users/blocked/count',[authJwt.verifyToken, authJwt.isAdmin], controller.getBlockedUserCount);
  app.get('/users/unblocked/count',[authJwt.verifyToken, authJwt.isAdmin], controller.getUnblockedUserCount);
};
