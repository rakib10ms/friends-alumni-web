"use strict";

/**
 * payment-report service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::payment-report.payment-report",
  ({ strapi }) => ({
    // Add your custom service methods here
    async updateStatus(id, status) {
      try {
        // ১. আগে নরমাল আপডেট করে ভেরিফাইড স্ট্যাটাস সেট করা
        const entry = await strapi.entityService.update(
          "api::payment-report.payment-report",
          id,
          {
            data: { payment_status_verified: status },
          }
        );

        // ২. স্ট্রাপি ৫ এর ডকুমেন্ট সার্ভিস ব্যবহার করে পাবলিশ করা
        // এটিই সবচেয়ে নিরাপদ এবং ড্যাশবোর্ডে ডাটা হাইড হবে না
        const publishedEntry = await strapi
          .documents("api::payment-report.payment-report")
          .publish({
            documentId: entry.documentId,
          });

        return publishedEntry;
      } catch (err) {
        console.error("Publishing Error:", err);
        throw new Error("Service Error: Unable to publish payment");
      }
    },
  })
);
