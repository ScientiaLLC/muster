//console.log('loading zimbra_soap.js');
//
//ZimbraAccounts = new Meteor.Collection('zimbra_accounts');
//
//// var soap = Npm.require('soap');
//var soap = new SOAP();
//
//Zimbra_SOAP = {};
//Zimbra_SOAP.url = "https://mail.scientiallc.com:7071/service/admin/soap";
//
//Zimbra_SOAP.connect = function() {
//  //soap.http.request.method = "POST";
//  soap.createClient(Zimbra_SOAP.url, function(err, client) {
//    if (err) {
//      console.log('createClient error = ' + err);
//    } else {
////      client.setSecurity(new soap.WSSecurity('username', 'password', 'PasswordText'));
////
////      client.AuthRequest(
////          {AuthRequest: {account: [{_content: "johnsonle", by: "name"}],
////                         password: [{_content: "password"}]}}, function(err, result) {
////            if (err) {
////              console.log("error = " + err);
////            } else {
////              console.log("result = " + result);
////            }
////      });
//      client.describe();
//
//      console.log("lastRequest = " + client.lastRequest);
//      console.log("lastResponseHeaders = " + client.lastResponseHeaders);
//      console.log("lastResponse = " + client.lastResponse);
//    }
//  });
//}
//
//Zimbra_SOAP.connect();
