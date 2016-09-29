console.log('loading accounts_ldap_server.js');

MeteorWrapperLdapjs.Attribute.settings.guid_format =
    MeteorWrapperLdapjs.GUID_FORMAT_B;

LDAP = {};
LDAP.ldap = MeteorWrapperLdapjs;
LDAP.client = LDAP.ldap.createClient({
  url: Meteor.settings.ldap_url + Meteor.settings.ldap_search_base
});

var wrappedLdapBind = Meteor.wrapAsync(LDAP.client.bind, LDAP.client);
// the search method still requires a callback because it is an event-emitter
LDAP.asyncSearch = function (binddn, opts, callback) {
  LDAP.client.search(binddn, opts, function(err, search) {
    if (err) {
      if (callback && typeof callback === "function") {
        callback(false);
      }
    } else {
      search.on('searchEntry', function(entry) {
        var user = entry.object;
        if (callback && typeof callback === "function") {
          callback(null, {cn: user.cn, mail: user.mail});
        }
      });

      search.on('error', function(err) {
        callback(false);
      });
    }
  });
};
var wrappedLdapSearch = Meteor.wrapAsync(LDAP.asyncSearch, LDAP);

LDAP.bind = function() {
  var binddn = Meteor.settings.ldap_admin_account;
  var res = wrappedLdapBind(binddn, Meteor.settings.ldap_admin_password);
  if (res.status == 0) {
    return true;
  } else {
    return false;
  }
}

LDAP.search = function(username) {
  var opts = {
      filter: '(&(uid=' + username + ')(objectClass=posixAccount))',
      scope: 'sub',
      attributes: ['cn','mail']  // add more ldap search attributes when needed
  };

  return wrappedLdapSearch(Meteor.settings.ldap_search_base, opts);
};

LDAP.checkAccount = function(username, callback) {
    var res = LDAP.bind();

    if (res) {
      var sres = LDAP.search(username);
      if (sres) {
        callback(null, sres);
      }
    } else {
      throw new Meteor.Error(500, 'LDAP server error');
    }
}

// use Meteor.startup whenever you need something to load after all of the
// other js files are loaded
Meteor.startup(function() {
  Meteor.methods({
    getLdapEmployeeInfo: function(username) {
      var success = false;
      try {
        LDAP.checkAccount(username, function(error, result) {
          if (result) {
            EmployeeInfo.upsert(
              {username: username},
              {username: username,
                cn: result.cn,
                mail: result.mail
              }
            );

            // console.log(EmployeeInfo.find({}).fetch());
            success = true;
          }
        });
      } catch(e) {
        console.log('could not get LdapEmployeeInfo: ' + e.message);
      }

      return success;
    }
  });
});
