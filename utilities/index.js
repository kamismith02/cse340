const invModel = require("../models/inventory-model");

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = '<div class="vehicle-grid">';
  if(data.length > 0){
    data.forEach(vehicle => { 
      grid += '<div class="vehicle-card">';
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`;
      grid += `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">`;
      grid += '</a>';
      grid += '<div class="namePrice">';
      grid += `<h2><a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`;
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
      grid += '</div>'; // Close namePrice
      grid += '</div>'; // Close vehicle-card
    });
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  grid += '</div>'; // Close vehicle-grid
  return grid;
};

// Function to format inventory detail into HTML
Util.formatInventoryDetail = function(vehicle) {
   let htmlContent = "<div class='vehicle-detail'>";
  htmlContent += `<h2 class="center">${vehicle.inv_make} ${vehicle.inv_model}</h2>`;
  htmlContent += `<img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" class="center">`;
  htmlContent += `<p><strong>Year:</strong> ${vehicle.inv_year}</p>`;
  htmlContent += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`;
  htmlContent += `<p><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</p>`;
  htmlContent += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`;
  htmlContent += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`;
  htmlContent += "</div>";
  return htmlContent;
};

Util.buildClassificationList = async function (classification_id = null) {
    try {
        let data = await invModel.getClassifications();
        let classificationList = '<select name="classification_id" id="classificationList" required>';
        classificationList += "<option value=''>Choose a Classification</option>";
        data.rows.forEach((row) => {
            classificationList += '<option value="' + row.classification_id + '"';
            if (classification_id != null && row.classification_id == classification_id) {
                classificationList += " selected ";
            }
            classificationList += ">" + row.classification_name + "</option>";
        });
        classificationList += "</select>";
        return classificationList;
    } catch (error) {
        throw error;
    }
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util