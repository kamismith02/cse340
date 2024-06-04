const pool = require("../database/");

// Get all classification data
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification WHERE classification_approved = true ORDER BY classification_name");
}

// Get all inventory items and classification_name by classification_id
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1 
      AND c.classification_approved = true
      AND i.inv_approved = true`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

// Function to get inventory item by ID
async function getInventoryItemById(invId) {
  try {
    const query = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const result = await pool.query(query, [invId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching inventory item by ID:", error);
    throw error;
  }
}

// Function to add a new classification to the database
async function addClassification(classification_name) {
  try {
    const query = "INSERT INTO classification (classification_name) VALUES ($1)";
    await pool.query(query, [classification_name]);
  } catch (error) {
    console.error("Error adding classification:", error);
    throw error;
  }
}

async function addInventory(inv_make, inv_model, inv_year, classification_id, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail) {
  try {
    const query = 'INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, classification_id, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
    await pool.query(query, [inv_make, inv_model, inv_year, inv_description, classification_id, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail]);
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw error;
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql =
      'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory Error")
  }
}

// Method to get pending classifications
async function getPendingClassifications() {
    try {
        const sql = `
            SELECT * FROM classification
            WHERE classification_approved = false
        `;
        const result = await pool.query(sql);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

// Method to get pending inventory items
async function getPendingInventoryItems() {
    try {
        const sql = `
            SELECT * FROM inventory
            WHERE inv_approved = false
        `;
        const result = await pool.query(sql);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

async function approveClassification(classification_id, account_id) {
    try {
        const sql = `
            UPDATE classification
            SET classification_approved = true, account_id = $1, approval_date = NOW()
            WHERE classification_id = $2
        `;
        const result = await pool.query(sql, [account_id, classification_id]);
        // Check if the update was successful by checking the row count
        if (result.rowCount > 0) {
            return { success: true };
        } else {
            return { success: false };
        }
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error in approveClassification:", error);
        throw error;
    }
}

async function rejectClassification(classification_id) {
    try {
        const sql = `
            DELETE FROM classification
            WHERE classification_id = $1
        `;
        const result = await pool.query(sql, [classification_id]);
        // Check if the update was successful by checking the row count
        if (result.rowCount > 0) {
            return { success: true };
        } else {
            return { success: false };
        }
    } catch (error) {
        throw error;
    }
};

async function approveInventoryItem(inv_id, account_id) {
    try {
        const sql = `
            UPDATE inventory
            SET inv_approved = true, account_id = $1, approval_date = NOW()
            WHERE inv_id = $2
        `;
        const result = await pool.query(sql, [account_id, inv_id]);
        // Check if the update was successful by checking the row count
        if (result.rowCount > 0) {
            return { success: true };
        } else {
            return { success: false };
        }
    } catch (error) {
        throw error;
    }
};

async function rejectInventoryItem(inv_id) {
    try {
        const sql = `
            DELETE FROM inventory
            WHERE inv_id = $1
        `;
        const result = await pool.query(sql, [inv_id]);
        // Check if the update was successful by checking the row count
        if (result.rowCount > 0) {
            return { success: true };
        } else {
            return { success: false };
        }
    } catch (error) {
        throw error;
    }
};

module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getInventoryItemById, 
  addClassification, 
  addInventory, 
  updateInventory, 
  deleteInventoryItem, 
  getPendingClassifications, 
  getPendingInventoryItems, 
  approveClassification, 
  rejectClassification, 
  approveInventoryItem, 
  rejectInventoryItem };