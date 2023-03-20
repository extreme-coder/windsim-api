'use strict';

/**
 * point service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const axios = require('axios');

//'resolve' service:
module.exports = createCoreService('api::point.point', ({ strapi }) => ({
  async resolve(p) {
    //create parameter string from ctx.query
    const query = `lat=${p.x}&lon=${p.y}&height=100&date_from=2019-01-01&date_to=2019-12-31&&mean=year`
    const { data } = await axios.get('http://windatlas.xyz/api/wind?' + query)
    //parse csv data 
    const s = parseFloat(data.split('\n')[3].split(',')[1])
    //update p to have speed equal to s
    await strapi.entityService.update('api::point.point', p.id, { data: { speed: s, status: 'RESOLVED' } })
  }
}));
