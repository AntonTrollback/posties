var minifier = require('html-minifier');

module.exports = exports = function(req, res, next) {
  res.oldRender = res.render;

  res.render = function(view, options) {
    this.oldRender(view, options, function(err, html) {
      if (err) throw err;

      html = minifier.minify(html, {
        removeComments: true,
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: false,
        removeEmptyAttributes: false,
        minifyCSS: true,
      });

      res.send(html);
    });
  };
  next();
};