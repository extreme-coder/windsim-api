module.exports = {
  routes: [ 
    { // Path defined with a regular expression
      method: 'GET',
      path: '/wind', // Only match when the URL parameter is composed of lowercase letters
      handler: 'turbine.wind',
    }
  ]
}
