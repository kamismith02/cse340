// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display a specific inventory item detail
router.get("/detail/:invId", utilities.handleErrors(invController.showInventoryDetail));

router.get("/", invController.renderManagementView);

// Route to render the add classification view
router.get("/add-classification", invController.renderAddClassificationView);

// Route to handle adding a new classification
router.post("/add-classification", invController.addClassification);

module.exports = router;