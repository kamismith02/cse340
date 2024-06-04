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
    const classification_id = req.params.classificationId;
    
    // Get inventory items by classification ID
    const data = await invModel.getInventoryByClassificationId(classification_id);

    // Check if data is not empty
    if (data && data.length > 0) {
      // Build classification grid
      const grid = await utilities.buildClassificationGrid(data);
      
      // Get navigation menu
      let nav = await utilities.getNav();
      
      // Get classification name from the first item in the data array
      const className = data[0].classification_name;
      
      // Render the classification view with the retrieved data
      res.render("./inventory/classification", {
          title: `${className} vehicles`,
          nav,
          grid,
      });
    } else {
      let nav = await utilities.getNav();
      // If no inventory items found, render an appropriate message
      res.render("errors/error", {
          title: "Error",
          nav,
          message: "No inventory items found for this classification.",
      });
    }
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
};

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
        await invModel.addClassification({classification_name, approved: false});

        // Flash success message
        req.flash("message", "New classification added successfully. Pending approval.");

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
        await invModel.addInventory({inv_make, inv_model, inv_year, classification_id, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail, approved: false});

        // Flash success message
        req.flash("message", "New inventory item added successfully. Pending approval.");

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

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteConfirmationView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const flashMessage = req.flash("message");
  const errors = req.flash("error");
  const messages = flashMessage.map(message => ({ type: "success", text: message }));
  const itemData = await invModel.getInventoryItemById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: "Edit " + itemName,
    messages: messages,
    nav,
    errors: errors,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
      const inv_id = parseInt(req.params.inv_id);
      const deleteResult = await invModel.deleteInventoryItem(inv_id);

      if (deleteResult.rowCount === 1) {
          req.flash("message", "The vehicle was successfully deleted.");
          res.redirect("/inv/");
      } else {
          req.flash("error", "Failed to delete the vehicle.");
          res.redirect(`/inv/delete/${inv_id}`);
      }
  } catch (error) {
      next(error);
  }
};

/* ***************************
 *  Pending Item Approval View
 * ************************** */
invCont.renderPendingItemsView = async function (req, res, next) {
    try {
        let nav = await utilities.getNav();
        const flashMessage = req.flash("message");
        const errors = req.flash("error");
        const messages = flashMessage.map(message => ({ type: "success", text: message }));

        const pendingClassifications = await invModel.getPendingClassifications();
        console.log("Pending Classifications fetched:", pendingClassifications);

        const pendingInventoryItems = await invModel.getPendingInventoryItems();
        console.log("Pending Inventory Items fetched:", pendingInventoryItems);

        res.render("./inventory/pending-items", {
            title: "Pending Items",
            nav,
            messages: messages,
            errors: errors,
            pendingClassifications: pendingClassifications,
            pendingInventoryItems: pendingInventoryItems
        });
    } catch (error) {
        next(error);
    }
};

/* ***************************
 *  Approval of Classification Data
 * ************************** */
invCont.approveClassification = async function(req, res, next) {
    try {
        const classification_id = parseInt(req.params.classification_id);
        const account_id = req.user.account_id
        
        if (isNaN(classification_id) || isNaN(account_id)) {
            throw new Error('Invalid classification_id or account_id');
        }

        // Attempt to approve the classification
        const result = await invModel.approveClassification(classification_id, account_id);
        
        if (result.success) {
            req.flash('message', 'Classification approved successfully.');
            return res.redirect('/inv/pending-items'); // Return to ensure no further execution
        } else {
            req.flash('error', 'Failed to approve classification.');
            return res.redirect('/inv/pending-items'); // Return to ensure no further execution
        }
    } catch (error) {
        next(error); // Let the error-handling middleware handle the error
    }
};


// Controller function to reject a classification
invCont.rejectClassification = async function(req, res, next) {
    try {
        const classification_id = parseInt(req.params.classification_id);
        const account_id = req.user.account_id
        
        if (isNaN(classification_id) || isNaN(account_id)) {
            throw new Error('Invalid classification_id or account_id');
        }
        
        // Attempt to reject the classification
        const result = await invModel.rejectClassification(classification_id);
        
        if (result.success) {
            req.flash('message', 'Classification rejected successfully.');
            return res.redirect('/inv/pending-items'); // Return to ensure no further execution
        } else {
            req.flash('error', 'Failed to reject classification.');
            return res.redirect('/inv/pending-items'); // Return to ensure no further execution
        }
    } catch (error) {
        next(error); // Let the error-handling middleware handle the error
    }
};


/* ***************************
 *  Approval of Inventory Data
 * ************************** */
invCont.approveInventory = async function(req, res, next) {
    try {
        const inv_id = parseInt(req.params.inv_id);
        const account_id = req.user.account_id
        
        if (isNaN(inv_id) || isNaN(account_id)) {
            throw new Error('Invalid inv_id or account_id');
        }
        
        // Attempt to approve the inventory item
        const result = await invModel.approveInventoryItem(inv_id, account_id);
        
        if (result.success) {
            req.flash('message', 'Inventory item approved successfully.');
            return res.redirect('/inv/pending-items'); // Return to ensure no further execution
        } else {
            req.flash('error', 'Failed to approve inventory item.');
            return res.redirect('/inv/pending-items'); // Return to ensure no further execution
        }
    } catch (error) {
        next(error); // Let the error-handling middleware handle the error
    }
};

// Controller function to reject an inventory item
invCont.rejectInventory = async function(req, res, next) {
    try {
        const inv_id = parseInt(req.params.inv_id);
        const account_id = req.user.account_id
        
        if (isNaN(inv_id) || isNaN(account_id)) {
            throw new Error('Invalid inv_id or account_id');
        }
        
        // Attempt to reject the inventory item
        const result = await invModel.rejectInventoryItem(inv_id);
        
        if (result.success) {
            req.flash('message', 'Inventory item rejected successfully.');
            return res.redirect('/inv/pending-items'); // Return to ensure no further execution
        } else {
            req.flash('error', 'Failed to reject inventory item.');
            return res.redirect('/inv/pending-items'); // Return to ensure no further execution
        }
    } catch (error) {
        next(error); // Let the error-handling middleware handle the error
    }
};

module.exports = invCont