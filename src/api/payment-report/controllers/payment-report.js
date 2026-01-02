"use strict";

/**
 * payment-report controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

// module.exports = createCoreController('api::payment-report.payment-report');

module.exports = createCoreController(
  "api::payment-report.payment-report",
  ({ strapi }) => ({
    async find(ctx) {
      // Default query parameters
      ctx.query = {
        ...ctx.query,
        populate: {
          paid_by: {
            populate: ["profile_img"], // Eikhane user model er image field-ti populate hobe
          },
          payment_receipt: true, // Receipt image-er jonno
          uploaded_by: {
            populate: ["profile_img"],
          },
        },
      };

      // Calling the internal core action
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async verifyPayment(ctx) {
      const { id } = ctx.params;
      const { status } = ctx.request.body;

      // ইনপুট ভ্যালিডেশন
      if (typeof status !== "boolean") {
        return ctx.badRequest("Status must be a boolean (true or false)");
      }

      try {
        // সার্ভিস থেকে কাস্টম ফাংশন কল করা হচ্ছে
        const updatedEntry = await strapi
          .service("api::payment-report.payment-report")
          .updateStatus(id, status);

        return ctx.send({
          message: `Payment successfully ${status ? "verified" : "rejected"}`,
          data: updatedEntry,
        });
      } catch (err) {
        return ctx.internalServerError(
          "An error occurred while updating status"
        );
      }
    },
  })
);
