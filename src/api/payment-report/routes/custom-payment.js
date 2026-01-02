"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

// ডিফল্ট রাউটার
const defaultRouter = createCoreRouter("api::payment-report.payment-report");

// কাস্টম রুটস অ্যারে
const myCustomRoutes = [
  // {
  //   method: "GET",
  //   path: "/payment-reports/my-summary",
  //   handler: "payment-report.getMyPaymentSummary",
  //   config: {
  //     auth: false, // আপনি চাইলে এটি true করে দিতে পারেন যদি টোকেন লাগে
  //   },
  // },
  {
    method: "PUT",
    path: "/payment-reports/:id/verify",
    handler: "payment-report.verifyPayment", // আমরা কন্ট্রোলারে এই ফাংশনটি যোগ করব
    config: {
      auth: false,
    },
  },
];

// ডিফল্ট এবং কাস্টম রুট মার্জ করা
module.exports = {
  get routes() {
    return defaultRouter.routes.concat(myCustomRoutes);
  },
};
