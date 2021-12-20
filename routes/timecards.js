var express = require('express');
var router = express.Router();
var businessLayer = require("../businessLayer.js");
var dataLayer = require("../companydata/index.js");


//GET EXACTLY 
router.route('/').get(function(request, response) {

    var bl = new businessLayer();

    //GET query params
    var company = request.query.company;
    var emp_id = parseInt(request.query.emp_id);
    
  
    //check if company name is valid
    if(!bl.validateCompanyName(company)) {
        return bl.invalidCompany(response);
    }

    try {
        //dept_id is valid, continue
        var dl = new dataLayer(company);

        if(dl.getEmployee(emp_id) != null){

            var timecard = dl.getAllTimecard(emp_id);
            if(timecard.length > 0) {

                return bl.jsonOk(response, timecard);

            }else{
                return bl.errorRequest(response, "No timecard existed in company")
            }
        }else{
            return bl.errorRequest(response, "emp_id is not found");
        }
            
    }
    catch(ex) {
        console.log(ex);
        return bl.errorMessage(response);
    }
  });
  
module.exports = router;
    
