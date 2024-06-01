const invModel = require("../models/inventory-model")
const defaultImagePath = "/images/vehicles/no-image.png";
const defaultThumbnailPath = "/images/vehicles/no-image-tn.png";

const utilities = require("../utilities/")

const invCont = {}

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

/* ***************************
 *  Build management view
 * ************************** */
invCont.renderManagementView = async function (req, res, next) {
    try {
        let nav = await utilities.getNav();
        // Check if there's any flash message
        const flashMessage = req.flash("message");
        let messages = [];
        if (flashMessage.length > 0) {
            messages.push({ type: "success", text: flashMessage[0] });
        }
        const classificationList = await utilities.buildClassificationList();
        res.render("./inventory/management", {
            title: "Inventory Management",
            messages: messages, // Pass flash messages to the view
            nav,
            classificationList: classificationList,
        });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

/* ***************************
 *  Build add classifications view
 * ************************** */
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


/* ***************************
 *  Build add to inventory view
 * ************************** */
invCont.renderAddInventoryView = async function (req, res, next) {
    try {
        let nav = await utilities.getNav();
        const flashMessage = req.flash("message");
        const errors = req.flash("error");
        const messages = flashMessage.map(message => ({ type: "success", text: message }));
        const classificationList = await utilities.buildClassificationList();
        const { classification_id } = req.body;

        res.render("./inventory/add-inventory", {
            title: "Add New Vehicle",
            messages: messages,
            nav,
            errors: errors,
            classificationList: classificationList,
            classification_id: classification_id || "",
        });
    } catch (error) {
        next(error);
    }
};

invCont.addInventory = async function (req, res, next) {
    try {
        const { inv_make, inv_model, inv_year, classification_id, inv_description, inv_price, inv_miles, inv_color } = req.body;
        // Set default image paths
        const inv_image = defaultImagePath;
        const inv_thumbnail = defaultThumbnailPath;

        // Insert inventory item into the database
        await invModel.addInventory(inv_make, inv_model, inv_year, classification_id, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail);

        // Flash success message
        req.flash("message", "New inventory item added successfully.");

        // Redirect to the management view
        res.redirect("/inv");
    } catch (error) {
        req.flash("error", "Failed to add new inventory item.");
        res.redirect("/inv/add-inventory");
    }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const flashMessage = req.flash("message");
  const errors = req.flash("error");
  const messages = flashMessage.map(message => ({ type: "success", text: message }));
  const itemData = await invModel.getInventoryItemById(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    messages: messages,
    nav,
    errors: errors,
    classificationList: classificationList,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("message", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("error", "Sorry, the insert failed.")
    res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    messages: messages,
    nav,
    errors: errors,
    classificationList: classificationList,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

module.exports = invCont