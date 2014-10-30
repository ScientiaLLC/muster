console.log('loading employee_checkin.js');

Meteor.Spinner.options = {
    lines: 13, // The number of lines to draw
    length: 5, // The length of each line
    width: 2, // The line thickness
    radius: 8, // The radius of the inner circle
    corners: 0.7, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#fff', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: true, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '20px', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
};

Handlebars.registerHelper("formatDate", function(datetime) {
  var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
  var dt = new Date(datetime);
  var d = dt.getDate();
  var m = monthNames[dt.getMonth()];
  var y = dt.getFullYear();
  var h = dt.getHours();
  var min = dt.getMinutes();
  var s = dt.getSeconds();
  return (y + " " + m + " " + d + " " + pad(h,2) + ":" + pad(min,2) + ":" + pad(s,2));
});

Handlebars.registerHelper("printPrecision", function(num, precision) {
  return num.toFixed(precision);
});

Handlebars.registerHelper('session', function(input) {
  return Session.get(input);
});

function pad(num, size) {
  var s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
}

function valuesAreSame(a, b, epsilon) {
  if (Math.abs(a - b) < epsilon) {
    return true;
  } else {
    return false;
  }
}

function foundLocation(location) {
  var empl = EmployeeInfo.findOne({username: Session.get('currentUser')});

  if (empl) {
    var lat = location.coords.latitude;
    var lon = location.coords.longitude;
    // console.log('lat = ' + lat);
    // console.log('lon = ' + lon);
    var nearby = "N/A";
    var id;
    var cur_loc = Locations.find({}).fetch();
    // if the location is currently already in the list, then do nothing,
    // otherwise, create a new one
    if (cur_loc) {
      var loc;
      var id_found = false;
      for (var i = 0; i < cur_loc.length; ++i) {
        loc = cur_loc[i];
        if (valuesAreSame(loc.lat, lat, 0.01) &&
            valuesAreSame(loc.lon, lon, 0.01)) {
          id = loc._id;
          id_found = true;
          break;
        }
      }

      if (!id_found) {
        // if not found, then we need to insert a new record
        id = Locations.insert({
          lat: lat,
          lon: lon,
          nearby: nearby
        });
      }
    }

    if (id) {
      // now let's update the employee location with the updated time
      // and id of location record
      var el = EmployeeLocations.findOne({employee_id: empl._id});

      if (el) {
        EmployeeLocations.update (
          {_id:el._id}, {
            employee_id: empl._id,
            location_id: id,
            time: Date.now()
          }
        );
      } else {
        EmployeeLocations.insert ({
          employee_id: empl._id,
          location_id: id,
          time: Date.now()
        });
      }
    }
  }
}

function noLocation(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

function getLocation() {
  var empl = EmployeeInfo.findOne({username: Session.get('currentUser')});
  if (empl) {
    // gets the current location by passing in a couple of methods; one for
    // successful returns and one for errors
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(foundLocation, noLocation);
    }
  }
}

Template.user_info.helpers({
  user_cn: function() {
    var empl = EmployeeInfo.findOne({username: Session.get('currentUser')});
    if (empl) {
      return empl.cn;
    } else {
      return undefined;
    }
  }
});

Template.user_info.events({
  // listens for button click
  "click #submit": function(evt, tmpl) {
    getLocation();
  }
});

Template.locations.helpers({
  employee_locations: function() {
    // returns array of all employee_locations sorted by time with most recent
    // entries appearing at the top
    var data = [];
    var el = EmployeeLocations.find({}, { sort: { time: -1}}).fetch();
    if (el) {
      var emp;
      for (var i = 0; i < el.length; ++i) {
        var emp = EmployeeInfo.findOne({_id:el[i].employee_id});
        var loc = Locations.findOne({_id:el[i].location_id});
        if (emp && loc) {
          var today = new Date(Date.now());
          today.setHours(0);
          today.setMinutes(0);
          today.setSeconds(0);
          today.setMilliseconds(0);
          var older_than_today = false;
          if (el[i].time < today.getTime()) {
             older_than_today = true;
          }
          data.push({name:emp.cn, time:el[i].time, older_than_today:older_than_today, lat:loc.lat, lon:loc.lon, nearby:loc.nearby, pk:loc._id});
        }
      }
    }

    return data;
  }
});

Template.locations.rendered = function() {
  $(this.find('#nearbyText.editable:not(.editable-click)')).editable('destroy').editable({
    success: function(response, newValue) {
      // <do something with newValue - usually a collection.update call>
      //console.log("value updated with = ", newValue);
      //console.log("response = " + response);
    },
    error: function(errors) {
      console.log("errors = " + errors);
    }
  });
}
