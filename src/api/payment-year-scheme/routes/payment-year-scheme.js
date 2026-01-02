"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

const defaultRouter = createCoreRouter(
  "api::payment-year-scheme.payment-year-scheme"
);

const customRouter = (innerRouter, customRoutes = []) => {
  return {
    get routes() {
      const nodes = innerRouter.routes;
      return nodes.concat(customRoutes);
    },
  };
};

const myCustomRoutes = [
  {
    method: "GET",
    // path: "/hello", // আপনার এপিআই পাথ
    path: "/user-payment-status/:userId",
    handler: "payment-year-scheme.helloAction", // controllerName.functionName
    config: {
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/all-users-payment-status", // নতুন এপিআই পাথ
    handler: "payment-year-scheme.getAllStatusAction",
    config: { auth: false },
  },
];

module.exports = customRouter(defaultRouter, myCustomRoutes);
