// path: ./src/index.js

module.exports = {
  register() {},

  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      // ১. যখন নতুন ইউজার তৈরি হবে (afterCreate)
      async afterCreate(event) {
        const { result } = event;
        const today = new Date().toISOString();

        try {
          const schemes = await strapi
            .documents("api::payment-year-scheme.payment-year-scheme")
            .findMany({
              filters: {
                year_date_from: { $lte: today },
                year_date_to: { $gte: today },
              },
            });

          const targetSchemeId =
            schemes.length > 0 ? schemes[0].documentId : null;

          // সরাসরি published state-এ create করুন
          await strapi
            .documents("api::user-share-report.user-share-report")
            .create({
              data: {
                user_id: result.documentId,
                current_share: result.share_count || 0,
                start_date: today.split("T")[0],
                payment_year_scheme: targetSchemeId,
                created_by_user_name: result.username,
              },
              status: "published", // এটি parameter হিসেবে দিন, data-এর ভিতরে নয়
            });

          console.log(
            `Initial report created and published for new user: ${result.username}`
          );
        } catch (error) {
          console.error("Create lifecycle error:", error);
        }
      },

      // ২. যখন ইউজার আপডেট করা হবে (afterUpdate)
      async afterUpdate(event) {
        const { result } = event;
        const today = new Date().toISOString();

        try {
          const schemes = await strapi
            .documents("api::payment-year-scheme.payment-year-scheme")
            .findMany({
              filters: {
                year_date_from: { $lte: today },
                year_date_to: { $gte: today },
              },
            });

          const targetSchemeId =
            schemes.length > 0 ? schemes[0].documentId : null;

          if (!targetSchemeId) return;

          const existingReports = await strapi
            .documents("api::user-share-report.user-share-report")
            .findMany({
              filters: {
                user_id: result.documentId,
                payment_year_scheme: targetSchemeId,
              },
            });

          if (existingReports.length > 0) {
            // Report thakle update hobe
            await strapi
              .documents("api::user-share-report.user-share-report")
              .update({
                documentId: existingReports[0].documentId,
                data: {
                  current_share: result.share_count,
                },
              });
            console.log(`Report updated for user: ${result.username}`);
          } else {
            // Report na thakle notun create করুন এবং publish করুন
            await strapi
              .documents("api::user-share-report.user-share-report")
              .create({
                data: {
                  user_id: result.documentId,
                  current_share: result.share_count,
                  payment_year_scheme: targetSchemeId,
                  start_date: today.split("T")[0],
                  created_by_user_name: result.username,
                },
                status: "published", // এখানেও status parameter হিসেবে
              });

            console.log(
              `New scheme report created and published during update for: ${result.username}`
            );
          }
        } catch (error) {
          console.error("Update lifecycle error:", error);
        }
      },
    });
  },
};
