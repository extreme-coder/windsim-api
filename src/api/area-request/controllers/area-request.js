'use strict';

/**
 * area-request controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::area-request.area-request', ({ strapi }) => ({
  async create(ctx) {
    // some logic here
    const response = await super.create(ctx);
    const pointX = Math.random() * 1.0 * (response.data.attributes.x2 - response.data.attributes.x1) + response.data.attributes.x1;
    const pointY = Math.random() * 1.0 * (response.data.attributes.y2 - response.data.attributes.y1) + response.data.attributes.y1;
    const p = await strapi.entityService.create('api::point.point', {
      data: {
        x: pointX,
        y: pointY,
        request: response.data.id,
        isFirst: true,
        publishedAt: new Date()
      }
    });
    return response;
  }
}))
