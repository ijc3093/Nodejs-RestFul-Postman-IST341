var express = require('express');
var router = express.Router();
var businessLayer = require("../businessLayer.js");
var dataLayer = require("../companydata/index.js");


//GET EXACTLY 
router.route('/').get(function(request, response) {

    var bl = new businessLayer();

    //GET query params
    var company = String(request.query.company);
    
  
    //check if company name is valid
    if(!bl.validateCompanyName(company)) {
        return bl.invalidCompany(response);
    }

    try {
        //dept_id is valid, continue
        var dl = new dataLayer(company);
        var emp = dl.getAllEmployee(company);
        if(!(emp.length > 0)) {
            return bl.errorRequest(response, "No employee existed in company")
        }
        return bl.messageOk(response, emp);
            
    }
    catch(ex) {
        console.log(ex);
        return bl.errorMessage(response);
    }
  });
  
module.exports = router;
    
