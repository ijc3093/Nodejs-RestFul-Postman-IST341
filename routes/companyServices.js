var express = require('express');
var router = express.Router();
var BusinessLayer = require("../businessLayer.js");
var DataLayer = require("../companydata/index.js");



router.route('/').delete(function(request, response){
    var bl = new BusinessLayer();
    var company = String(request.query.company);

    if(!bl.validateCompanyName(company)){
        return bl.invalidCompany(response);
    }

    try{
        var dl = new DataLayer(company);
        dl.deleteCompany(company);
        return bl.messageOk(response, company + "'s information deleted!");
    }
    catch(ex){
        return bl.errorMessage(response);
    }
});


module.exports = router;