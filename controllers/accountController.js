const { validationResult } = require('express-validator');
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
};

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
    try {
        let nav = await utilities.getNav();
        const accountData = req.session.accountData;
        const flashMessage = req.flash("message");
        let messages = [];
        if (flashMessage.length > 0) {
            messages.push({ type: "success", text: flashMessage[0] });
        }
        res.render("account/account-management", {
            title: "Account Management",
            account_type: accountData.account_type,
            account_firstname: accountData.account_firstname,
            account_id: accountData.account_id,
            messages: messages,
            nav,
            errors: null,
        });
    } catch (error) {
        next(error);
    }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
 let nav = await utilities.getNav()
 const { account_email, account_password } = req.body
 const accountData = await accountModel.getAccountByEmail(account_email)
 if (!accountData) {
  req.flash("notice", "Please check your credentials and try again.")
  res.status(400).render("account/login", {
   title: "Login",
   nav,
   errors: null,
   account_email,
  })
 return
 }
 try {
  if (await bcrypt.compare(account_password, accountData.account_password)) {
  delete accountData.account_password
  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
  if(process.env.NODE_ENV === 'development') {
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    req.session.loggedIn = true;
    req.session.accountData = accountData;
    req.flash("message", "Welcome back!");
    return res.redirect("/account/")
  } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
 } catch (error) {
  return new Error('Access Forbidden')
 }
}

async function getAccountUpdateView(req, res) {
    try {
        let nav = await utilities.getNav();
        const account_id = req.params.account_id;
        const account = await accountModel.getAccountById(account_id);
        const flashMessage = req.flash("message");
        let messages = [];
        if (flashMessage.length > 0) {
            messages.push({ type: "success", text: flashMessage[0] })
        };;

        if (!account) {
            return res.status(404).send('Account not found');
        }
        res.render('account/update', { 
            title: 'Update Account Information', 
            nav,
            account,
            messages: messages,
            errors: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to update account information
async function updateAccountInformation(req, res) {
    try {
        let nav = await utilities.getNav();
        const errors = validationResult(req);
        const account_id = req.params.account_id;
        if (!errors.isEmpty()) {
            const account = await accountModel.getAccountById(account_id);
            const flashMessage = req.flash("message");
        let messages = [];
        if (flashMessage.length > 0) {
            messages.push({ type: "success", text: flashMessage[0] })
        };
            return res.render('account/update', { 
                title: 'Update Account Information', 
                nav,
                messages,
                account, 
                errors: errors.array() 
            });
        }
        
        const { account_firstname, account_lastname, account_email } = req.body;
        await accountModel.updateAccountInformation(account_id, account_firstname, account_lastname, account_email);
        
        req.flash('message', 'Account information updated successfully');
        res.redirect('/account'); // Redirect to management view
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to change password
async function changePassword(req, res) {
    try {
        
        let nav = await utilities.getNav();
        const errors = validationResult(req);
        const account_id = req.params.account_id;
        
        const account = await accountModel.getAccountById(account_id);
        if (!errors.isEmpty()) {
            const flashMessage = req.flash("message");
            let messages = [];
            if (flashMessage.length > 0) {
                messages.push({ type: "success", text: flashMessage[0] });
            }
            return res.render('account/update', { 
                title: 'Update Account Information', 
                nav,
                messages: messages,
                account: account, 
                errors: errors.array() 
            });
        }
        
        const { currentPassword, newPassword } = req.body;

        const passwordMatch = await bcrypt.compare(currentPassword, account.account_password);
        console.log("Password Match:", passwordMatch); // Log to check the value of passwordMatch
        
        if (!passwordMatch) {
            req.flash('error', 'Incorrect current password');
            return res.redirect('/account/update');
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await accountModel.updatePassword(account_id, hashedPassword);
        
        req.flash('message', 'Password changed successfully');
        res.redirect('/account'); // Redirect to management view
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const logout = (req, res) => {
    req.flash('message', 'You have been logged out successfully');
    // Clear the token cookie
    res.clearCookie('sessionId');
    res.clearCookie('jwt');

    // Redirect the client to the home view
    res.redirect('/');
};


module.exports = { buildLogin, buildRegister, buildAccountManagement, registerAccount, accountLogin, getAccountUpdateView, updateAccountInformation, changePassword, logout };