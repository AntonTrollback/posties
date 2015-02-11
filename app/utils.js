var _ = require('lodash');

module.exports = function(app, settings) {
  var utils = {};

  // Check if the user is authenticated

  utils.checkAuth = function(req, res, next) {
    if (!req.session.user_id) {
      res.send('You are not authorized to view this page');
    } else {
      next();
    }
  }

  utils.validUserSignupData = function(user) {
    if (!_.isString(user.email)) { return false; }
    if (!_.isString(user.password)) { return false; }
    if (user.email.length < 1) { return false; }
    if (user.password.length < 1) { return false; }

    return true;
  }

  // Render page

  utils.renderPage = function(res, options) {
    var data = {
      assetUrl: settings.assetUrl,
      analyticsCode: settings.analyticsCode,
    }

    res.render('layout', _.assign(data, options));
  }

  // Render error page

  utils.renderErrorPage = function(res, error) {
    console.error(error);

    utils.renderPage({
      title: 'Posti.es',
      serverError: true
    });
  }

  utils.sendEndpointError = function(res, error) {
    console.error(error);

    res.send('database error');
  }

  return utils;
}