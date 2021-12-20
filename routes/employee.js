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
    var emp_id = request.query.emp_id;
  
    //check if company name is valid
    if(!bl.validateCompanyName(company)) {
        return bl.invalidCompany(response);
    }
  
    //continue if valid, check if id is greater than 0 (is valid)
    if(!(emp_id > 0)) {
        return bl.badRequest(response, "Invalid emp_id");
    }
    try {
        //emp_id is valid, continue
        var dl = new dataLayer(company);
        var emp = dl.getEmployee(emp_id);
        if(emp !== null) {
            return bl.jsonOk(response, emp);
        } else {
            return bl.errorRequest(response, "emp_id is not found")
        }
    }
    catch(ex) {
        console.log(ex);
        return bl.errorMessage(response);
    }
  })

  //POST
  .post(urlEncodedParser, function(request, response){
      var company = request.body.company;

      //check if company name is valid
      if(!bl.validateCompanyName(company)){
          return bl.invalidCompany(response);
      }

      try{
          //Create the dataLayer
          var dl = new dataLayer(company);

          //get the params
          var emp_name = request.body.emp_name;
          var emp_no = request.body.emp_no;
          var hire_date = request.body.hire_date;
          var job = request.body.job;
          var salary = parseFloat(request.body.salary);
          var dept_id = parseInt(request.body.dept_id);
          var mng_id = parseInt(request.body.mng_id);

          //dept_id validation
          if(dl.getDepartment(company, dept_id) === null){
              return bl.badRequest(response, "dept_id could not found");
          }

          //mng_id validation
        //   if(!(mng_id === 0 || dl.getEmployee(mng_id) !== null)){
        //     return bl.errorRequest(response, "mng_id is not found");
        //   }

          //Make the emp_no unique
          if(!emp_no.includes("_" + company)){
            emp_no = emp_no += "_" + company;
          }

          //make sure that parameters are set
          //validations are completed - build the new employee
          var new_Emp = dl.insertEmployee(new dl.Employee(emp_name, emp_no, hire_date, job, salary, dept_id, mng_id));
          if(new_Emp === null){
              return bl.badRequest(response, "emp_id is already existed");
          }

          //if new employees was created successfully return 200k - and emp object
          console.log(new_Emp);
          return bl.jsonOk(response, new_Emp);

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

      //get the emp emp_id if company is valid - return bad request if not present
      var emp_id = request.body.emp_id;
      if(typeof emp_id === 'undefined'){
          return bl.badRequest(response, "emp_id undefined")
      }

      //if emp_id is good to go, get department
      var oldEmp = dl.getEmployee(emp_id);

      //check to make sure that emp is not null
      if(oldEmp === null){
          return bl.errorRequest(response, "Emplopee requested could not be found");
      }

      //get the rest of the params

      var emp_name = typeof request.body.emp_name !== 'undefined'? String(request.body.emp_name) : oldEmp.getEmpName();
      var emp_no = typeof request.body.emp_no !== 'undefined'? String(request.body.emp_no) : oldEmp.getEmpNo();
      var hire_date = typeof request.body.hire_date !== 'undefined'? String(request.body.hire_date) : oldEmp.getEmployee();
      var job = typeof request.body.job !== 'undefined'? String(request.body.job) : oldEmp.getJob();
      var salary = typeof request.body.salary !== 'undefined'? parseFloat(request.body.salary) : oldEmp.getSalary();
      var dept_id = typeof request.body.dept_id !== 'undefined'? parseFloat(request.body.dept_id) : oldEmp.getDeptId();
      var mng_id = typeof request.body.mng_id !== 'undefined'? parseFloat(request.body.mng_id) : oldEmp.getMnId();


      //dept_id validation
      if(dl.getDepartment(company, dept_id) === null){
          return bl.badRequest(response, "dept_id is not found");
      }

      //mng_id validation
      if(!(mng_id === 0 || dl.getEmployee(mng_id) !== null)){
        return bl.errorRequest(response, "mng_id is not found");
      }

      //hire date validation
      //var validDate = bl.validateDate(hire_date);
    //   if(hire_date === null){
    //       return bl.badRequest(response, "hire_date is not valid");
    //   }

      //Make the emp_no unique
      if(!emp_no.includes("_" + company)){
        emp_no = emp_no += "_" + company;
      }

      oldEmp.setEmpName(emp_name);
      oldEmp.setEmpNo(emp_no);
      oldEmp.setHireDate(hire_date);
      oldEmp.setJob(job);
      oldEmp.setSalary(salary);
      oldEmp.setDeptId(dept_id);
      oldEmp.setMngId(mng_id);

    
      //to update the department
      var updatedEmp = dl.updateEmployee(oldEmp);

      //if updated department is null, return bad request
      if(updatedEmp === null){
          return bl.badRequest(response, "Request department does not exist ")
      }

      return bl.jsonOk(response, updatedEmp);

    }
    catch(ex){
        console.log(ex);
        return bl.errorMessage(response);
    }
})


//DELETE
.delete(function(request, response){
    var company = request.query.company;
    var emp_id = request.query.emp_id;

    //Check if the company name is valid
    if(!bl.validateCompanyName(company)){
        return bl.invalidCompany(response);
    }

    //validate the department id 
    if(typeof emp_id > 0){
        return bl.badRequest(response, " No emp_id provided")
    }

    try{

      var dl = new dataLayer(company);
      var rows = dl.deleteEmployee(emp_id);

      if(!(rows > 0)){
          return bl.errorRequest(response, "emp_id does not exist in the company")
      }

      //if department delete, it's successful deleted
      return bl.messageOk(response, "deleted " + emp_id + " from Employee ID")
    }
    catch(ex){
        console.log(ex);
        return bl.errorMessage(response);
    }
});

  
module.exports = router;
    
