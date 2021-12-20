var express = require('express');
var router = express.Router();
var businessLayer = require("../businessLayer.js");
var dataLayer = require("../companydata/index.js");

var json = express.json();


var urlEncodedParser = express.urlencoded({extended:false});

router.route('/').all(function(request, response, next){
    bl = new businessLayer();
    next();
})

//GET EXACTLY 
.get(function(request, response) {
    //GET query params
    var company = request.query.company;
    var timecard_id = request.query.timecard_id;
  
    //check if company name is valid
    if(!bl.validateCompanyName(company)) {
        return bl.invalidCompany(response);
    }
  
    //continue if valid, check if id is greater than 0 (is valid)
    if(!(timecard_id > 0)) {
        return bl.badRequest(response, "Invalid timecard_id provided");
    }

    try {
        //timecard_id is valid, continue
        var dl = new dataLayer(company);

        var timecard = dl.getTimecard(timecard_id);

        if(timecard !== null) {
            return bl.jsonOk(response, timecard);
        } else {
            return bl.errorRequest(response, "timecard_id is not found")
        }
    }
    catch(ex) {
        console.log(ex);
        return bl.errorMessage(response);
    }
  })

  //POST
  .post(urlEncodedParser, function(request, response) {
    var company = request.body.company;
    var empId = parseInt(request.body.emp_id);
    var start = request.body.start_time;
    var end = request.body.end_time;
  
    try {
  
        //to check if the company name is valid
        if(!bl.validateCompanyName(company)) {
            return bl.invalidCompany(response);
        }
  
        var dl = new dataLayer(company);
  
        //validate 
        if(dl.getEmployee(empId) === null) {
            return bl.errorRequest(response, "Employee could not be found.");
         }
  
        //timestamps were valid go ahead and insert
        var newCard = dl.insertTimecard(new dl.Timecard(start, end, empId));
        
        //ensure the card was created successfully - if so return success
        if(newCard !== null) {
            return bl.jsonOk(response, newCard);
        } else {
            return bl.badRequest(response, "Invalid Timecard parameters received.");
        }
    }
    catch(ex) {
        return bl.errorMessage(response);
    }
  })
  
  //PUT
  .put(json, function(request, response){
    var company = request.body.company;

    //check if company name is valid
    if(!bl.validateCompanyName(company)){
        return bl.invalidCompany(response);
    }

    try{
        
      var dl = new dataLayer(company);

      //get the timecard_id if company is valid - return bad request if not present
      var timecard_id = request.body.timecard_id;
      if(typeof timecard_id === 'undefined'){
          return bl.badRequest(response, "timecard_id undefined")
      }

      var id = parseInt(request.body.timecard_id);

      //if timecard_id is good to go, get timecard
      var oldCard = dl.getTimecard(id);

      //check to make sure that emp is not null
      if(oldCard === null){
          return bl.errorRequest(response, "Timecard is not be found");
      }

      //get the rest of the params
      var emp_id = typeof request.body.emp_id !== 'undefined'? parseInt(request.body.emp_id) : oldCard.getEmpId();
      var start_time = typeof request.body.start_time !== 'undefined'? request.body.start_time : oldCard.getStartTime();
      var end_time = typeof request.body.end_time !== 'undefined'? request.body.end_time : oldCard.getEndTime();

      oldCard.setEmpId(emp_id);
      oldCard.setStartTime(start_time);
      oldCard.setEndTime(end_time);

    
      //to update the timecard
      var updatedCard = dl.updateTimecard(oldCard);

      //if updated timecard is null, return bad request
      if(updatedCard === null){
          return bl.badRequest(response, "Request timecard does not exist ")
      }

      return bl.jsonOk(response, updatedCard);

    }
    catch(ex){
        console.log(ex);
        return bl.errorMessage(response);
    }
  })

//DELETE
.delete(function(request, response){
    var company = request.query.company;
    var timecard_id = request.query.timecard_id;

    //Check if the company name is valid
    if(!bl.validateCompanyName(company)){
        return bl.invalidCompany(response);
    }

    //validate the department id 
    if(typeof timecard_id > 0){
        return bl.badRequest(response, " No timecard_id provided")
    }

    try{

      var dl = new dataLayer(company);
      var rows = dl.deleteTimecard(timecard_id);

      if(!(rows > 0)){
          return bl.errorRequest(response, "Timecard does not exist in the company")
      }

      //if department delete, it's successful deleted
      return bl.messageOk(response, "deleted " + timecard_id + " from Timecard ID")
    }
    catch(ex){
        console.log(ex);
        return bl.errorMessage(response);
    }
});
module.exports = router;