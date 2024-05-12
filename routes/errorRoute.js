const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");

// Route to trigger intentional error
router.get("/trigger-error", errorController.triggerError);

module.exports = router;

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error", { message: "Internal Server Error" });
};

module.exports = errorHandler;