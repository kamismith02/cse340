const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const jwt = require('jsonwebtoken');
const { getAccountById } = require('../models/account-model');
const validate = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registationRules = () => {
return [
    // firstname is required and must be string
    body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
        }
    }),

    // password is required and must be strong password
    body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),
]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
    // Valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required"),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

validate.requireAdminOrEmployee = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Get user ID from decoded token
        const account_id = decoded.account_id;

        // Fetch user from database using user ID
        const user = await getAccountById(account_id);


        // Check if user exists and has admin or employee role
        if (!user || (user.account_type !== 'Admin' && user.account_type !== 'Employee')) {
            console.log('Unauthorized');
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Attach user object to request for future use
        req.user = user;

        // Proceed to next middleware or route handler
        next();
    } catch (error) {
        console.error('Authorization Error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = validate