console.log('loading routes.js');

function stripTrailingSlash(str) {
  if(str) {
    if (str.substr(-1) == '/') {
      return str.substr(0, str.length - 1);
    }
  } else {
    console.log('WARNING: str undefined or empty when stripTrailingSlash called');
    return '';  // return empty string
  }
}

// get the subpath from the ROOT_URL, this assumes we are listening on
// port 3003
// TODO(lej): should do this differently so that we don't have to put port
// number in here in case the port number is changed
var subpath = stripTrailingSlash(Meteor.absoluteUrl().split("3003",2)[1]);
console.log('subpath = ' + subpath);

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

Router.map( function() {
  this.route('home', {
    path: subpath + '/',
    //layoutTemplate: 'layout',
    yieldTemplates: {
      'header': { to: 'header' }
    },

    waitOn: function() {
      return [Meteor.subscribe('locations'),
              Meteor.subscribe('employee_info'),
              Meteor.subscribe('employee_locations')];
    }
  });

  this.route('about', {
    path: subpath + '/about',
    yieldTemplates: {
      'header_logo_only': { to: 'header'}
    }
  });

  this.route('image_404', {
    path: subpath + '/404.png'
  });

  this.route('post', {
    path: subpath + '/post',
    where: 'server',
    method: 'POST',
    action: function () {
      var body = this.request.body;
      var name = body.name;
      var pk = body.pk;
      var value = body.value;
      // console.log('name = ' + name);
      // console.log('value = ' + value);
      // console.log('pk = ' + pk);

      Locations.update(
        {_id: pk},
        {$set: {nearby: value}}
      );

      this.response.writeHead(200, {'Content-type': 'text/html'});
      this.response.end('<html><body></body></html>');
    }
  });

  // route with name 'notFound' that for example matches
  // '/non-sense/route/that-matches/nothing' and automatically renders
  // template 'notFound'
  // HINT: Define a global not found route as the very last route in your router
  this.route('notFound', {
    path: '*',
    yieldTemplates: {
      'header_logo_only': { to: 'header' }
    }
  });
});
