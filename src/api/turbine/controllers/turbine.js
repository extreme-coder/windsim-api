'use strict';

/**
 * turbine controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');

module.exports = createCoreController('api::turbine.turbine', ({ strapi }) =>  ({  
  async wind(ctx) {            
    //create parameter string from ctx.query
    const query = Object.keys(ctx.query).map((k) => k + '=' + ctx.query[k]).join('&')
    console.log('http://windatlas.xyz/api/wind/' + query)
    const {data} = await axios.get('http://windatlas.xyz/api/wind/?' + query)
    //parse csv data 
    const lines = data.split('\n')
    const header = lines[2].split(',')    
    const dataLines = lines.slice(3)
    const JSONdata = dataLines.map((l) => {
      const line = l.split(',')
      const obj = {}
      header.forEach((h, i) => {
        obj[h] = line[i]
      })
      return obj
    })

    return JSONdata    
  }
}));
