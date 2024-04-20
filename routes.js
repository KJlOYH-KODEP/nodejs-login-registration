const router = require("express").Router();
const passport = require('passport');
const { body } = require("express-validator");
const {
 homePage,
 register,
 registerPage,
 login,
 loginPage,
} = require("./controllers/userController");
require('./passport'); 
const dbConnection = require('./utils/dbConnection');

const ifNotLoggedin = (req, res, next) => {
 if(!req.session.userID){
 return res.redirect('/login');
 }
 next();
}
const ifLoggedin = (req,res,next) => {
 if(req.session.userID){
 return res.redirect('/');
 }
 next();
}
router.get('/', ifNotLoggedin, homePage);
router.get("/login", ifLoggedin, loginPage);
router.post("/login",
ifLoggedin,
 [
 body("_email", "Invalid email address")
 .notEmpty()
 .escape()
 .trim()
 .isEmail(),
 body("_password", "The Password must be of minimum 4 characters length")
 .notEmpty()
 .trim()
 .isLength({ min: 4 }),
 ],
 login
);
router.get("/signup", ifLoggedin, registerPage);
router.post(
 "/signup",
 ifLoggedin,
 [
 body("_name", "The name must be of minimum 3 characters length")
 .notEmpty()
 .escape()
 .trim()
 .isLength({ min: 3 }),
 body("_email", "Invalid email address")
 .notEmpty()
 .escape()
 .trim()
 .isEmail(),
 body("_password", "The Password must be of minimum 4 characters length")
 .notEmpty()
 .trim()
 .isLength({ min: 4 }),
 ],
 register
);
router.get('/logout', (req, res, next) => {
 req.session.destroy((err) => {
 next(err);
 });
 res.redirect('/login');
});


// Auth  
router.get('/auth/google' , passport.authenticate('google'), (req,res) =>
    res.send(200)
); 
router.get('/auth/github' , passport.authenticate('github'), (req,res) =>
    res.send(200)
); 
  
// Auth Callback 
router.get( '/auth/google/callback', 
    passport.authenticate( 'google', { 
        successRedirect: '/auth/google/callback/success', 
        failureRedirect: '/auth/callback/failure'
})); 
router.get( '/auth/github/callback', (req,res) => {
    passport.authenticate( 'github', { 
    successRedirect: '/auth/github/callback/success', 
    failureRedirect: '/auth/callback/failure',
    }) (req,res);
}); 

// Success  
router.get('/auth/google/callback/success', ifLoggedin, async (req, res) => {
    const [row] = await dbConnection.execute(
        "SELECT * FROM `users` WHERE `email`=?",
        [req.user.email]
    );
    req.session.userID = row[0].id;
    res.redirect("/");

}); 
router.get('/auth/github/callback/success', ifLoggedin, async (req, res) => {
    const [row] = await dbConnection.execute(
        "SELECT * FROM `users` WHERE `email`=?",
        [req.user.emails[0].value]
    );
    req.session.userID = row[0].id;
    res.redirect("/");

}); 
// failure 
router.get('/auth/callback/failure' , (req , res) => { 
    res.send("Faaaaailure"); 
}) 
  

module.exports = router