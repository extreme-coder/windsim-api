'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap( { strapi } ) {
    //strapi.server.httpServer is the new update for Strapi V4
    var io = require("socket.io")(strapi.server.httpServer, {
      cors: { // cors setup
        origin: process.env.UI_DOMAIN,
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: false,
      },
    });
    strapi.io = io
    io.on("connection", function (socket) { //Listening for a connection from the frontend
      socket.on("join", ({ sessionId }) => { // Listening for a join connection
        console.log("joined the room:" + sessionId)
        socket.join(sessionId)  
      });          
    });
  },
};
