console.log('loading employee_locations.js');

Locations = new Meteor.Collection('locations');
EmployeeInfo = new Meteor.Collection('employee_info');
EmployeeLocations = new Meteor.Collection('employee_locations');

// can only call ensureIndex on server collections
// TODO(lej): maybe try using a Geospatial index to find locations
// Meteor.startup(function() {
//   Locations._ensureIndex({loc:"2d"});
// });

if (Meteor.isServer) {
  Meteor.publish('locations', function() {
    //subsargs are args passed in the next section
    return Locations.find();
    //or
    //return posts.find({}, {time:-1, limit: 5}) //etc
  })

  Meteor.publish('employee_info', function() {
    return EmployeeInfo.find();
  })

  Meteor.publish('employee_locations', function() {
    return EmployeeLocations.find();
  })
}

if (Meteor.isClient) {
  Meteor.subscribe('locations');
  Meteor.subscribe('employee_info');
  Meteor.subscribe('employee_locations');
}
