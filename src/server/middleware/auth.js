// Authentication middleware
const basicAuth = require('express-basic-auth');

/**
 * Setup authentication middleware
 * @param {Object} app - Express app instance
 * @param {Object} config - Configuration object with auth credentials
 */
function setupAuth(app, config) {
  const { username, password } = config.auth;

  if (username && password) {
    const users = {
      [username]: password
    };

    // Apply basic authentication middleware
    app.use(basicAuth({
      users: users,
      challenge: true
    }));

    // Allow access to the '/portal' route
    app.get('/portal', (req, res) => {
      res.sendFile('portal.html', { root: 'public' });
    });

    // Redirect all other routes (except for '/config' and '/setup') to '/portal'
    app.get('*', (req, res, next) => {
      if (req.path !== '/setup') {
        next();
      } else {
        res.redirect('/portal');
      }
    });
  } else {
    // Redirect to the setup page if username and password are not set
    app.get('*', (req, res, next) => {
      if (req.path !== '/portal') {
        next();
      } else {
        res.redirect('/setup');
      }
    });
  }
}

module.exports = {
  setupAuth
};