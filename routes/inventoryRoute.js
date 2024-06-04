// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index");
const classValidate = require('../utilities/inventory-validation')
const { requireAdminOrEmployee } = require('../utilities/account-validation');

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display a specific inventory item detail
router.get("/detail/:invId", utilities.handleErrors(invController.showInventoryDetail));

router.get("/", requireAdminOrEmployee, invController.renderManagementView);

// Route to render the add classification view
router.get("/add-classification", requireAdminOrEmployee, invController.renderAddClassificationView);

// Route to handle adding a new classification
router.post("/add-classification", requireAdminOrEmployee, invController.addClassification);

// Route to render the add inventory view
router.get("/add-inventory", requireAdminOrEmployee, invController.renderAddInventoryView);

// Route to handle adding a new vehicle
router.post("/add-inventory", requireAdminOrEmployee, invController.addInventory);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get('/edit/:inv_id', requireAdminOrEmployee, utilities.handleErrors(invController.editInventoryView));

router.post("/edit-inventory", classValidate.addInventoryRules(),
    classValidate.checkUpdateData, requireAdminOrEmployee, utilities.handleErrors(invController.updateInventory));

router.get('/delete/:inv_id', requireAdminOrEmployee, utilities.handleErrors(invController.deleteConfirmationView));

router.post("/delete/:inv_id", requireAdminOrEmployee, utilities.handleErrors(invController.deleteInventory));

module.exports = router;