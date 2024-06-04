// Needed Resources 
const express = require("express")
const router = new express.Router() 
const { check } = require('express-validator');
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/index");
const acctValidate = require('../utilities/account-validation')

router.get('/login', utilities.handleErrors(accountController.buildLogin));

router.get('/register', utilities.handleErrors(accountController.buildRegister));

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

router.use(utilities.checkAuthentication);

// Process the registration data
router.post(
  "/register",
  acctValidate.registationRules(),
  acctValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  acctValidate.loginRules(),
  acctValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Route handler to deliver the account update view
router.get('/update/:account_id', accountController.getAccountUpdateView);

// Route handler to process account update
router.post('/update/:account_id',  
    [
        check('account_firstname').notEmpty().withMessage('First name is required'),
        check('account_lastname').notEmpty().withMessage('Last name is required'),
        check('account_email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format')
    ], accountController.updateAccountInformation
);

// Route handler to process password change
router.post('/change-password/:account_id',
    [
        check('currentPassword').notEmpty().withMessage('Current password is required'),
        check('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 12 }).withMessage('Password must be at least 12 characters long'),
        check('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
    ],
    accountController.changePassword
);

router.get('/logout', utilities.handleErrors(accountController.logout));

module.exports = router;