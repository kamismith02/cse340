const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// Function to render the inventory management view
invCont.renderManagementView = async function (req, res, next) {
    try {
        let nav = await utilities.getNav();
        // Check if there's any flash message
        const flashMessage = req.flash("message");
        let messages = [];
        if (flashMessage.length > 0) {
            messages.push({ type: "success", text: flashMessage[0] });
        }
        res.render("./inventory/management", {
            title: "Inventory Management",
            messages: messages, // Pass flash messages to the view
            nav,
        });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
  })
} catch (error) {
      next(error); // Pass error to error handling middleware
    }
}

// Controller function to show inventory item detail
invCont.showInventoryDetail = async function(req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getInventoryItemById(invId);
    if (!vehicle) {
      throw { status: 404, message: "Vehicle not found" };
    }
    const htmlContent = utilities.formatInventoryDetail(vehicle);
    const nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      htmlContent
    });
  } catch (error) {
    next(error);
  }
};

invCont.renderAddClassificationView = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        const flashMessage = req.flash("message");
        let messages = [];
        if (flashMessage.length > 0) {
            messages.push({ type: "success", text: flashMessage[0] });
        }
        res.render("./inventory/add-classification", {
            title: "Add New Classification",
            messages: messages,
            nav,
            errors: [],
        });
    } catch (error) {
        next(error);
    }
};

// Function to handle adding a new classification
invCont.addClassification = async function (req, res, next) {
    try {
        const { classification_name } = req.body;
        // Server-side validation
        if (!classification_name || classification_name.includes(" ") || /[^a-zA-Z0-9]/.test(classification_name)) {
            req.flash("message", "Classification name cannot contain spaces or special characters.");
            res.redirect("/inv/add-classification");
            return;
        }
        // Insert new classification into the database
        await invModel.addClassification(classification_name);

        // Flash success message
        req.flash("message", "New classification added successfully.");

        // Redirect to the management view
        res.redirect("/inv");
    } catch (error) {
        req.flash("error", "Failed to add new classification.");
        res.redirect("/inv/add-classification");
    }
};


module.exports = invCont