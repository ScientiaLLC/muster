console.log('loading accounts_ldap_client.js');

// Meteor.require does not exist on the client side because
// you cannot use Npm packages client-side
// var Future = Meteor.require('fibers/future');

Session.setDefault('currentUser', null);

getLdapEmployeeInfo = function(username) {
  Meteor.call('getLdapEmployeeInfo', username);
}

headers.ready(function() {
  var user = headers.get('x-forwarded-user');
  //var user = headers.get('remote_user');
  // console.log("user = " + user);
  Session.set('currentUser', user);
  getLdapEmployeeInfo(user);
});
