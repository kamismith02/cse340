// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/index");
const regValidate = require('../utilities/account-validation')
const loginValidate = require("../utilities/account-validation");

router.get('/login', utilities.handleErrors(accountController.buildLogin));

router.get('/register', utilities.handleErrors(accountController.buildRegister));

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  loginValidate.loginRules(),
  loginValidate.checkLoginData,
  (req, res, next) => {
    // Render the login view with errors if validation fails
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("account/login", {
        title: "Login",
        errors: errors.array(),
      });
    }
    // Continue to the next middleware if validation passes
    next();
  },
  utilities.handleErrors(accountController.loginAttempt)
);


module.exports = router;