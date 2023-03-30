module.exports = {
  resolvePoints: {
    task: async ({ strapi }) => {
      //get all points with status 'WAITING'
      const points = await strapi.db.query('api::point.point').findMany({ where: { status: 'WAITING' }, populate: true })
      if(points.length == 0) return
      const p = points[Math.floor(Math.random() * points.length)]
      await strapi.service('api::point.point').resolve(p)
      const req = await strapi.db.query('api::area-request.area-request').findOne({ where: { id: p.request.id, pointsAwaiting: 0, status: 'WAITING' }, populate: true }).then(async (req) => {
        if (req) {
          console.log(req)
          const points = await strapi.db.query('api::point.point').findMany({ where: { request: req.id, status: 'RESOLVED' }, populate: true })
          highestRatio = 0
          highestPoint = -1
          currentPoint = -1
          //for each point:
          points.every(async (p) => {            
            if (p.isFirst) {              
              currentPoint = p.id
              return false
            }
            if (p.speed > req.currentSpeed) {
              currentPoint = p.id
              return false
            }
            //calculate ratio
            const ratio = p.speed / req.currentSpeed
            //if ratio is higher than highestRatio, set highestRatio to ratio
            if (ratio > highestRatio) {
              highestRatio = ratio
              highestPoint = p.id
            }
            return true
          })

          console.log('current point: ' + currentPoint)

          //if currentPoint is -1, set currentPoint to highestPoint
          if (currentPoint == -1) {
            if(Math.random() * req.temperature < highestRatio) {
              currentPoint = highestPoint
            } else {
              currentPoint = points[Math.floor(Math.random() * points.length)].id
            }
          }
          if (currentPoint !== -1) {
            await strapi.entityService.update('api::point.point', currentPoint, { data: { status: 'CURRENT' } })
            //find point with request = req.id and status = 'CURRENT'
            const oldCurrents = await strapi.db.query('api::point.point').findMany({ where: { request: req.id, status: 'CURRENT' }, populate: true })
            //update oldCurrent to have status = 'DISCARDED'
            oldCurrents.forEach(async (oldCurrent) => {
              if (oldCurrent && oldCurrent.id != currentPoint) {
                console.log('code is here')
                await strapi.entityService.update('api::point.point', oldCurrent.id, { data: { status: 'DISCARDED' } })
              }
            })
          }
          //update all other points to have status = 'DISCARDED'
          points.forEach(async (p) => {
            if (p.id != currentPoint || currentPoint == -1) {
              await strapi.entityService.update('api::point.point', p.id, { data: { status: 'DISCARDED' } })
            }
          })
          const step = req.step
          //get point with id = currentPoint
          let currentPointObj = await strapi.db.query('api::point.point').findOne({ where: { id: currentPoint }, populate: true })
          if (currentPoint == -1) {
            currentPointObj = await strapi.db.query('api::point.point').findMany({ where: { request: req.id, status: 'CURRENT' }, populate: true })[0]
          }
          console.log(step)
          indents = [{ x: step, y: 0 }, { x: -step, y: 0 }, { x: 0, y: step }, { x: 0, y: -step }]
          const n = await Promise.all(indents.map(async (indent) => {
            //create new point with request = req.id, x = req.x + indent.x, y = req.y + indent.y, isFirst = false, if a point with the same request and x and y does not exist
            let p = await strapi.db.query('api::point.point').findOne({ where: { request: req.id, x: currentPointObj.x + indent.x, y: currentPointObj.y + indent.y } })
            if (!p) {
              p = await strapi.entityService.create('api::point.point', {
                data: {
                  x: currentPointObj.x + indent.x,
                  y: currentPointObj.y + indent.y,
                  request: req.id,
                  isFirst: false,
                  publishedAt: new Date()
                }
              })
              return true
            }
            return false
          }))
          console.log(n)
          console.log(n.filter((x) => x).length)
          await strapi.entityService.update('api::area-request.area-request', req.id, {
            data: {
              pointsAwaiting: req.pointsAwaiting + n.filter((x) => x).length,
              currentSpeed: currentPointObj.speed,
              temperature: req.temperature - 2.0/req.cycles
            }
          })
          //if req's currentSpeed is greater than its highestSpeed, update highestSpeed to currentSpeed and update highestX and highestY to currentPoint's x and y
          if (req.currentSpeed > req.highestSpeed) {
            await strapi.entityService.update('api::area-request.area-request', req.id, {
              data: {
                highestSpeed: req.currentSpeed,
                highestX: currentPointObj.x,
                highestY: currentPointObj.y
              }
            })
          }
          if (req.temperature <= 0) {
            //set req's status to 'COMPLETED'
            await strapi.entityService.update('api::area-request.area-request', req.id, {
              data: {
                status: 'COMPLETED'
              }
            })
          }
        }
      })
    },
    options: {
      rule: "*/2 * * * * *"
    },
  },
};