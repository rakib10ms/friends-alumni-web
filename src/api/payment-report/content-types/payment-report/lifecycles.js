"use strict";

const { errors } = require("@strapi/utils");
const { ApplicationError } = errors;

module.exports = {
  async beforeCreate(event) {
    console.log(">>> 🚀 beforeCreate triggered");
    await checkDuplicatePayment(event);
    await calculateAndAssign(event);
  },

  async beforeUpdate(event) {
    console.log(">>> 🔄 beforeUpdate triggered");
    await calculateAndAssign(event);
  },

  async afterCreate(event) {
    const { result } = event;
    if (result.publishedAt) return;

    try {
      const fullData = await strapi.entityService.findOne(
        "api::payment-report.payment-report",
        result.id,
        {
          populate: {
            paid_by: true,
            uploaded_by: true,
          },
        }
      );

      const paidByName = fullData.paid_by?.username || "একজন মেম্বার";
      const amount = result.payment_amount;

      await strapi.entityService.create("api::notification.notification", {
        data: {
          title: "পেমেন্ট রিপোর্ট জমা হয়েছে",
          body: `${paidByName} এর ৳${amount} পেমেন্ট রিপোর্ট জমা পড়েছে।`,
          type: "PaymentReceived",
          icon: "checkmark-circle",
          iconColor: "#388E3C",
          target: "/payment-report",
          isRead: false,
          publishedAt: new Date(),
          paid_by: fullData.paid_by?.id,
          uploaded_by: fullData.uploaded_by?.id,
        },
      });

      const userIds = [fullData.paid_by?.id, fullData.uploaded_by?.id].filter(
        Boolean
      );

      if (userIds.length > 0) {
        const users = await strapi.db
          .query("plugin::users-permissions.user")
          .findMany({
            where: { id: { $in: userIds } },
            select: ["expoPushToken"],
          });

        const pushTokens = [
          ...new Set(
            users
              .map((user) => user.expoPushToken)
              .filter((token) => token && token.startsWith("ExponentPushToken"))
          ),
        ];

        if (pushTokens.length > 0) {
          await sendPushNotification(pushTokens, {
            title: "পেমেন্ট রিপোর্ট জমা হয়েছে",
            body: `${paidByName} এর ৳${amount} পেমেন্ট রিপোর্ট জমা পড়েছে।`,
            data: { target: "/payment-report", paymentId: result.id },
          });
        }
      }
    } catch (error) {
      console.error(">>> ❌ Error in afterCreate:", error.message);
    }
  },
  // afterUpdate hook (পেমেন্ট ভেরিফাই হলে নোটিফিকেশন যাবে)
  // async afterUpdate(event) {
  //   const { result, params } = event;

  //   // চেক করুন পেমেন্ট স্ট্যাটাস ভেরিফাইড হয়েছে কিনা
  //   // ধরে নিচ্ছি আপনার ফিল্ডের নাম 'payment_status_verified'
  //   if (result.payment_status_verified === true) {
  //     try {
  //       const fullData = await strapi.entityService.findOne(
  //         "api::payment-report.payment-report",
  //         result.id,
  //         { populate: { paid_by: true } }
  //       );

  //       if (fullData.paid_by && fullData.paid_by.expoPushToken) {
  //         await sendPushNotification([fullData.paid_by.expoPushToken], {
  //           title: "পেমেন্ট ভেরিফাইড ✅",
  //           body: `আপনার ৳${result.payment_amount} পেমেন্টটি সফলভাবে ভেরিফাই করা হয়েছে।`,
  //           data: { target: "/payment-history" },
  //         });

  //         // ডাটাবেসেও নোটিফিকেশন সেভ করা
  //         await strapi.entityService.create("api::notification.notification", {
  //           data: {
  //             title: "পেমেন্ট ভেরিফাইড ✅",
  //             body: `আপনার ৳${result.payment_amount} পেমেন্টটি ভেরিফাই করা হয়েছে।`,
  //             type: "PaymentReceived",
  //             paid_by: fullData.paid_by.id,
  //             publishedAt: new Date(),
  //           },
  //         });
  //       }
  //     } catch (err) {
  //       console.error("Verification notification error:", err.message);
  //     }
  //   }
  // }
  async afterUpdate(event) {
    const { result } = event;

    // পেমেন্ট স্ট্যাটাস ভেরিফাইড হলে নোটিফিকেশন ট্রিগার হবে
    if (result.payment_status_verified === true) {
      try {
        const fullData = await strapi.entityService.findOne(
          "api::payment-report.payment-report",
          result.id,
          {
            populate: {
              paid_by: true,
            },
          }
        );

        // যদি paid_by ইউজার থাকে এবং তার এক্সপো টোকেন থাকে
        if (fullData.paid_by && fullData.paid_by.expoPushToken) {
          // মাসের নাম বের করা (Bengali)
          const pDate = new Date(fullData.payment_date);
          const monthName = pDate.toLocaleString("bn-BD", { month: "long" });
          const yearName = pDate.toLocaleString("bn-BD", { year: "numeric" });

          const amount = fullData.payment_amount;
          const notificationTitle = "পেমেন্ট ভেরিফাইড ✅";
          const notificationBody = `আপনার ${monthName} ${yearName} মাসের ৳${amount} পেমেন্টটি সফলভাবে ভেরিফাই করা হয়েছে।`;

          // ১. শুধুমাত্র paid_by ইউজারকে পুশ নোটিফিকেশন পাঠানো
          await sendPushNotification([fullData.paid_by.expoPushToken], {
            title: notificationTitle,
            body: notificationBody,
            data: {
              target: "/payment",
              paymentId: result.id,
              month: monthName,
              status: "verified",
            },
          });

          // ২. ডাটাবেসে নোটিফিকেশন রেকর্ড সেভ করা
          await strapi.entityService.create("api::notification.notification", {
            data: {
              title: notificationTitle,
              body: notificationBody,
              type: "PaymentReceived",
              paid_by: fullData.paid_by.id, // কার পেমেন্ট
              target: "/payment",
              isRead: false,
              publishedAt: new Date(),
            },
          });

          console.log(
            `>>> ✅ Notification sent to user: ${fullData.paid_by.username}`
          );
        } else {
          console.log(
            ">>> ⚠️ No paid_by user or push token found, skipping notification."
          );
        }
      } catch (err) {
        console.error(">>> ❌ Verification notification error:", err.message);
      }
    }
  },
};

// --- হেল্পার ফাংশনসমূহ ---

async function checkDuplicatePayment(event) {
  const { data } = event.params;

  console.log(">>> 📦 Received data:", JSON.stringify(data, null, 2));

  let userId = null;

  // ইউজার আইডি এক্সট্রাক্ট - সব possible format handle করা
  if (data.paid_by) {
    if (typeof data.paid_by === "number") {
      userId = data.paid_by;
      console.log(">>> 🔍 Found userId as direct number:", userId);
    } else if (typeof data.paid_by === "object") {
      if (Array.isArray(data.paid_by.set) && data.paid_by.set.length > 0) {
        userId = data.paid_by.set[0]?.id;
        console.log(">>> 🔍 Found userId in 'set' array:", userId);
      } else if (
        Array.isArray(data.paid_by.connect) &&
        data.paid_by.connect.length > 0
      ) {
        userId = data.paid_by.connect[0]?.id;
        console.log(">>> 🔍 Found userId in 'connect' array:", userId);
      } else if (data.paid_by.id) {
        userId = data.paid_by.id;
        console.log(">>> 🔍 Found userId in 'id' property:", userId);
      }
    }
  }

  if (!userId) {
    console.log(">>> ⚠️ No User ID found, skipping duplicate check");
    return;
  }

  if (!data.payment_date) {
    console.log(">>> ⚠️ No payment_date found, skipping duplicate check");
    return;
  }

  console.log(
    ">>> ✅ Starting duplicate check for User ID:",
    userId,
    "Date:",
    data.payment_date
  );

  try {
    // payment_date থেকে মাস এবং বছর বের করা
    const paymentDate = new Date(data.payment_date);
    const year = paymentDate.getFullYear();
    const month = paymentDate.getMonth();

    // মাসের প্রথম দিন (00:00:00)
    const startOfMonth = new Date(year, month, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // মাসের শেষ দিন (23:59:59)
    const endOfMonth = new Date(year, month + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    console.log(">>> 📅 Checking range:", {
      start: startOfMonth.toISOString(),
      end: endOfMonth.toISOString(),
      userId: userId,
    });

    // 🔥 CRITICAL FIX: শুধু PUBLISHED payments চেক করা হবে
    // Draft entries ignore করা হবে
    const existingPayments = await strapi.db
      .query("api::payment-report.payment-report")
      .findMany({
        where: {
          paid_by: userId,
          payment_date: {
            $gte: startOfMonth.toISOString().split("T")[0],
            $lte: endOfMonth.toISOString().split("T")[0],
          },
          publishedAt: {
            $notNull: true, // শুধু published entries
          },
        },
        select: [
          "id",
          "payment_date",
          "payment_amount",
          "payment_status_verified",
          "publishedAt",
        ],
      });

    console.log(
      ">>> 🔎 Found existing PUBLISHED payments:",
      existingPayments.length
    );

    if (existingPayments && existingPayments.length > 0) {
      console.log(
        ">>> ❌ DUPLICATE DETECTED! Existing payments:",
        JSON.stringify(existingPayments, null, 2)
      );

      const firstPayment = existingPayments[0];
      const paymentDateStr = new Date(
        firstPayment.payment_date
      ).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      throw new ApplicationError(
        `এই মাসে ইতিমধ্যে পেমেন্ট রিপোর্ট জমা আছে (তারিখ: ${paymentDateStr}, পরিমাণ: ৳${firstPayment.payment_amount})। একই মাসে দুইবার পেমেন্ট করা যাবে না।`
      );
    }

    console.log(
      ">>> ✅ No duplicate published payment found, proceeding with create"
    );
  } catch (error) {
    if (error instanceof ApplicationError) {
      console.log(">>> 🚫 Throwing ApplicationError to block duplicate");
      throw error;
    }
    console.error(
      ">>> ❌ Error in duplicate check:",
      error.message,
      error.stack
    );
  }
}

async function calculateAndAssign(event) {
  const { data } = event.params;
  let userId = null;

  // ইউজার আইডি এক্সট্রাক্ট
  if (data.paid_by) {
    if (typeof data.paid_by === "number") {
      userId = data.paid_by;
    } else if (typeof data.paid_by === "object") {
      if (Array.isArray(data.paid_by.set) && data.paid_by.set.length > 0) {
        userId = data.paid_by.set[0]?.id;
      } else if (
        Array.isArray(data.paid_by.connect) &&
        data.paid_by.connect.length > 0
      ) {
        userId = data.paid_by.connect[0]?.id;
      } else if (data.paid_by.id) {
        userId = data.paid_by.id;
      }
    }
  }

  if (!userId) {
    console.log(">>> ⚠️ No User ID found for calculation");
    return;
  }

  try {
    const shareReports = await strapi.db
      .query("api::user-share-report.user-share-report")
      .findMany({
        where: { user_id: userId },
        orderBy: { createdAt: "desc" },
        limit: 1,
      });

    if (shareReports && shareReports.length > 0) {
      const latestReport = shareReports[0];
      const reportDate =
        data.payment_date || new Date().toISOString().split("T")[0];

      const scheme = await strapi.db
        .query("api::payment-year-scheme.payment-year-scheme")
        .findOne({
          where: {
            year_date_from: { $lte: reportDate },
            year_date_to: { $gte: reportDate },
          },
        });

      if (scheme) {
        data.payment_amount = scheme.amount * latestReport.current_share;
        data.current_share = latestReport.current_share;

        console.log(
          `>>> ✅ Calculation done! Amount: ${data.payment_amount}, Share: ${data.current_share}`
        );
      } else {
        console.log(">>> ⚠️ No payment scheme found");
      }
    } else {
      console.log(">>> ⚠️ No share report found");
    }
  } catch (error) {
    console.error(">>> ❌ Calculation error:", error.message);
  }
}

async function sendPushNotification(tokens, message) {
  const uniqueTokens = [...new Set(tokens)];

  const messages = uniqueTokens.map((token) => ({
    to: token,
    sound: "default",
    title: message.title,
    body: message.body,
    data: message.data,
    _displayInForeground: true,
  }));

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    });

    const resData = await response.json();
    console.log(">>> 🚀 Push sent:", JSON.stringify(resData));
  } catch (error) {
    console.error(">>> ❌ Push error:", error.message);
  }
}
