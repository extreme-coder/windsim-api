'use strict';

/**
 * turbine service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::turbine.turbine');
