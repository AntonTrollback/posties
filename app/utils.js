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

  // Render page

  utils.renderPage = function(res, options) {
    var data = {
      assetUrl: settings.assetUrl,
      analyticsCode: settings.analyticsCode,
      title: 'Posti.es',
      description: 'Posti.es description ...',
      content: 'hello world',
      databaseUrl: settings.databaseUrl
    }

    res.render('layout', _.assign(data, options));
  }

  return utils;
}