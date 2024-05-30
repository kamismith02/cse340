const pool = require("../database/");

// Get all classification data
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

// Get all inventory items and classification_name by classification_id
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
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

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryItemById, addClassification, addInventory };