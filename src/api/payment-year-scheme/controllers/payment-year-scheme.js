"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::payment-year-scheme.payment-year-scheme",
  ({ strapi }) => ({
    async helloAction(ctx) {
      try {
        const { userId } = ctx.params;

        // সার্ভিসকে কল করা
        const result = await strapi
          .service("api::payment-year-scheme.payment-year-scheme")
          .calculateUserStatus(userId);

        if (result.error) {
          return ctx.notFound(result.error);
        }

        // ফাইনাল আউটপুট
        ctx.body = {
          status: "success",
          data: result,
        };
      } catch (err) {
        ctx.body = { status: "error", message: err.message };
      }
    },
    async getAllStatusAction(ctx) {
      try {
        const data = await strapi
          .service("api::payment-year-scheme.payment-year-scheme")
          .getAllUsersStatus();

        ctx.body = {
          status: "success",
          count: data.length,
          data: data,
        };
      } catch (err) {
        ctx.body = { status: "error", message: err.message };
      }
    },
  })
);
