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
    var company = String(request.query.company);
    var dept_id = request.query.dept_id;
  
    //check if company name is valid
    if(!bl.validateCompanyName(company)) {
        return bl.invalidCompany(response);
    }
  
    //continue if valid, check if id is greater than 0 (is valid)
    if(!(dept_id > 0)) {
        return bl.badRequest(response, "Invalid department id provided");
    }
    try {
        //dept_id is valid, continue
        var dl = new dataLayer(company);
        var dept = dl.getDepartment(company, dept_id);
        if(dept !== null) {
            return bl.messageOk(response, dept);
        } else {
            return bl.errorRequest(response, "Could not find provided department Id")
        }
    }
    catch(ex) {
        console.log(ex);
        return bl.errorMessage(response);
    }
  })

  //POST
  .post(urlEncodedParser, function(request, response){
      var company = String(request.body.company);

      //check if company name is valid
      if(!bl.validateCompanyName(company)){
          return bl.invalidCompany(response);
      }

      try{
          var dl = new dataLayer(company);

          //get the params
          var dept_name = String(request.body.dept_name);
          var dept_no = String(request.body.dept_no);
          var location = String(request.body.location);

          //Make the dept_no unique
          if(!dept_no.includes("_" + company)){
            dept_no = dept_no += "_" + company;
          }

          //make sure that parameters are set
          if(dept_name !== "" && dept_no !== "_" + company && location !== ""){
            var dept = new dl.Department(company, dept_name, dept_no, location);
            dept = dl.insertDepartment(dept);

            if(dept !== null){
                return bl.messageOk(response, dept);
            }else{
                return bl.badRequest(response, "Department Number already exists")
            }

          }else{
              return bl.badRequest(response, "Invalid parameters provided");
          }
      }
      catch(ex){
          console.log(ex);
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

        //get the dept dept_id if company is valid - return bad request if not present
        var dept_id = request.body.dept_id;
        if(typeof dept_id === 'undefined'){
            return bl.badRequest(response, "dept_id not provided")
        }

        //if dept_id is good to go, get department
        var oldDept = dl.getDepartment(company, dept_id);

        //check to make sure that dept is not null
        if(oldDept === null){
            return bl.errorRequest(response, "Department requested could not be found");
        }

        //get the rest of the params
        var dept_name = typeof request.body.dept_name !== 'undefined'? String(request.body.dept_name) : oldDept.getDepartment();
        var dept_no = typeof request.body.dept_no !== 'undefined'? String(request.body.dept_no) : oldDept.getDepartment();
        var location = typeof request.body.location !== 'undefined'? String(request.body.location) : oldDept.getDepartment();

        oldDept.setDeptName(dept_name);
        oldDept.setDeptNo(dept_no);
        oldDept.setLocation(location);

        //dept_no validation: to make sure that dept_no is unique, we check to see if it contains '-' and the company name and if not we append the company name
        if(!oldDept.getDeptNo().includes("-" + oldDept.getCompany())){
            oldDept.setDeptNo(oldDept.getDeptNo() + "-" + oldDept.getCompany());
        }

        //to update the department
        var updatedDept = dl.updateDepartment(oldDept);

        //if updated department is null, return bad request
        if(updatedDept === null){
            return bl.badRequest(response, "Request department does not exist or duplicate department number provided ")
        }

        return bl.jsonOk(response, updatedDept);

      }
      catch(ex){
          console.log(ex);
          return bl.errorMessage(response);
      }
  })


  //DELETE
  .delete(function(request, response){
      var company = request.query.company;
      var dept_id = request.query.dept_id;

      //Check if the company name is valid
      if(!bl.validateCompanyName(company)){
          return bl.invalidCompany(response);
      }

      //validate the department id 
      if(typeof dept_id === 'undefined' || dept_id <= 0){
          return bl.badRequest(response, " No or improper dept_id provided")
      }

      try{

        var dl = new dataLayer(company);
        var rows = dl.deleteDepartment(company, dept_id);

        if(rows === 0){
            return bl.errorRequest(response, "Provided department does not exist for the provided company")
        }

        //if department delete, it's successful deleted
        return bl.messageOk(response, "Department " + dept_id + " from " + company + " successfully deleted")
      }
      catch(ex){
          console.log(ex);
          return bl.errorMessage(response);
      }
  });
module.exports = router;
    
