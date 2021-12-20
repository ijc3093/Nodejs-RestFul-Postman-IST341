
var express = require('express');
//const companydata = require('./companydata');
var app = express();

app.get("/CompanyServices", function(request, response){
    console.log("User Listing");
    response.send("User Listing");
});

//Import the routers for each path
var path = "/CompanyServices";
var company = require('./routes/companyServices.js');
var department = require('./routes/department.js');
var departments = require('./routes/departments.js');
var employee = require('./routes/employee.js');
var employees = require('./routes/employees.js');
var timecard = require('./routes/timecard.js');
var timecards = require('./routes/timecards.js');

//Connect app and routers
app.use(path + '/company', company);
app.use(path + '/department', department);
app.use(path + '/departments', departments);
app.use(path + '/employee', employee);
app.use(path + '/employees', employees);
app.use(path + '/timecard', timecard);
app.use(path + '/timecards', timecards);

//Running the server (main) and print where it is listening
    var server = app.listen(8080, function(){
    const moment = require('moment');

    let now = moment();
    console.log(now.format());

    var host = server.address().address;
    var port = server.address().port; 
    console.log("For browser, Server listenig at the http://localhost:8080/", host, port)
    console.log("Server listenig at the http://%s:%s", host, port)
    //console.log("For browser, Server listenig at the http://localhost:8081/", host, port)
});
