'use strict';

/**
 * turbine router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::turbine.turbine');
