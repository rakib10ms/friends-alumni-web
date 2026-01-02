"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::payment-year-scheme.payment-year-scheme",
  ({ strapi }) => ({
    // async calculateUserStatus(userId) {
    //   try {
    //     const today = new Date();
    //     const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec
    //     const currentYear = today.getFullYear();

    //     // ১. ইউজারের লেটেস্ট শেয়ার রিপোর্ট বের করা
    //     const shareReport = await strapi.db
    //       .query("api::user-share-report.user-share-report")
    //       .findOne({
    //         where: { user_id: userId },
    //         orderBy: { createdAt: "desc" },
    //       });

    //     const userInfo = await strapi.db
    //       .query("plugin::users-permissions.user")
    //       .findOne({
    //         where: { id: userId },
    //         // যদি ইউজারের সাথে অন্য কোনো রিলেশন (যেমন: প্রোফাইল পিকচার) পপুলেট করতে চান
    //         populate: ["role", "profile_img."],
    //       });
    //     if (userInfo) {
    //       if (userInfo.profile_img) {
    //         userInfo.profile_img = userInfo.profile_img.url; // এখানে শুধু URL টা সেট করে দেওয়া হলো
    //       } else {
    //         userInfo.profile_img = null; // ইমেজ না থাকলে null থাকবে
    //       }
    //     }

    //     if (!shareReport) return { error: "No share report found" };

    //     const reportStartDate = shareReport.start_date;
    //     const currentShare = parseInt(shareReport.current_share || 0);

    //     // ২. স্কিম বের করা
    //     const scheme = await strapi.db
    //       .query("api::payment-year-scheme.payment-year-scheme")
    //       .findOne({
    //         where: {
    //           year_date_from: { $lte: reportStartDate },
    //           year_date_to: { $gte: reportStartDate },
    //         },
    //       });

    //     if (!scheme)
    //       return { error: `No scheme found for date: ${reportStartDate}` };

    //     const monthlyPayable = scheme.amount * currentShare;

    //     // ৩. সঠিক টেবিল (payment-report) থেকে পেমেন্ট হিস্ট্রি বের করা
    //     const payments = await strapi.db
    //       .query("api::payment-report.payment-report") // এখানে নাম ঠিক করা হয়েছে
    //       .findMany({
    //         where: { paid_by: userId },
    //       });

    //     // ৪. রানিং মান্থ এর ক্যালকুলেশন
    //     let paidThisMonthTotal = 0;

    //     const isPaidThisMonth = payments.some((p) => {
    //       if (!p.payment_date) return false;

    //       const pDate = new Date(p.payment_date);
    //       const isMatch =
    //         pDate.getMonth() === currentMonth &&
    //         pDate.getFullYear() === currentYear;

    //       if (isMatch) {
    //         paidThisMonthTotal += p.payment_amount || 0;
    //       }
    //       return isMatch;
    //     });

    //     const totalPaidHistory = payments.reduce(
    //       (sum, p) => sum + (p.payment_amount || 0),
    //       0
    //     );

    //     return {
    //       //   userId,
    //       user_info: userInfo,
    //       shareCount: currentShare,
    //       schemeName: scheme.year_name,
    //       monthlyRate: scheme.amount,
    //       payableAmountThisMonth: monthlyPayable,
    //       paymentStatus: {
    //         currentMonthName: today.toLocaleString("en-us", { month: "long" }),
    //         isPaidThisMonth: isPaidThisMonth,
    //         amountPaidThisMonth: paidThisMonthTotal,
    //         dueThisMonth: isPaidThisMonth
    //           ? monthlyPayable - paidThisMonthTotal
    //           : monthlyPayable,
    //       },
    //       totalPaidHistory: totalPaidHistory,
    //     };
    //   } catch (err) {
    //     throw new Error(err.message);
    //   }
    // },

    // async calculateUserStatus(userId) {
    //   try {
    //     const today = new Date();
    //     const currentMonth = today.getMonth();
    //     const currentYear = today.getFullYear();

    //     // ১. ইউজারের লেটেস্ট শেয়ার রিপোর্ট বের করা
    //     const shareReport = await strapi.db
    //       .query("api::user-share-report.user-share-report")
    //       .findOne({
    //         where: { user_id: userId },
    //         orderBy: { createdAt: "desc" },
    //       });

    //     const userInfo = await strapi.db
    //       .query("plugin::users-permissions.user")
    //       .findOne({
    //         where: { id: userId },
    //         populate: ["role", "profile_img"],
    //       });

    //     if (userInfo?.profile_img) {
    //       userInfo.profile_img = userInfo.profile_img.url;
    //     }

    //     if (!shareReport) return { error: "No share report found" };

    //     const reportStartDate = shareReport.start_date;
    //     const currentShare = parseInt(shareReport.current_share || 0);

    //     // ২. স্কিম বের করা
    //     const scheme = await strapi.db
    //       .query("api::payment-year-scheme.payment-year-scheme")
    //       .findOne({
    //         where: {
    //           year_date_from: { $lte: reportStartDate },
    //           year_date_to: { $gte: reportStartDate },
    //         },
    //       });

    //     if (!scheme) return { error: "No scheme found" };

    //     const monthlyPayable = scheme.amount * currentShare;

    //     // ৩. শুধুমাত্র ভেরিফাইড (verified) পেমেন্ট রিপোর্টগুলো নিয়ে আসা
    //     const verifiedPayments = await strapi.db
    //       .query("api::payment-report.payment-report")
    //       .findMany({
    //         where: {
    //           paid_by: userId,
    //           payment_status_verified: true, // <--- এটিই আসল পরিবর্তন
    //         },
    //       });

    //     // ৪. রানিং মান্থ এর ক্যালকুলেশন (শুধুমাত্র ভেরিফাইড ডাটা থেকে)
    //     let paidThisMonthTotal = 0;

    //     // চেক করা এই মাসে কোনো ভেরিফাইড পেমেন্ট আছে কি না
    //     const hasVerifiedPaymentThisMonth = verifiedPayments.some((p) => {
    //       if (!p.payment_date) return false;
    //       const pDate = new Date(p.payment_date);
    //       const isMatch =
    //         pDate.getMonth() === currentMonth &&
    //         pDate.getFullYear() === currentYear;

    //       if (isMatch) {
    //         paidThisMonthTotal += p.payment_amount || 0;
    //       }
    //       return isMatch;
    //     });

    //     // ৫. টোটাল পেইড হিস্ট্রি (শুধুমাত্র ভেরিফাইড)
    //     const totalPaidHistory = verifiedPayments.reduce(
    //       (sum, p) => sum + (p.payment_amount || 0),
    //       0
    //     );

    //     // ৬. লজিক: যদি পেমেন্ট রিপোর্ট জমা থাকে কিন্তু ভেরিফাইড না হয়, তবে isPaid false দেখাবে
    //     const isPaidThisMonth =
    //       hasVerifiedPaymentThisMonth && paidThisMonthTotal >= monthlyPayable;

    //     return {
    //       user_info: userInfo,
    //       shareCount: currentShare,
    //       schemeName: scheme.year_name,
    //       monthlyRate: scheme.amount,
    //       payableAmountThisMonth: monthlyPayable,
    //       paymentStatus: {
    //         currentMonthName: today.toLocaleString("en-us", { month: "long" }),
    //         isPaidThisMonth: isPaidThisMonth, // এখন এটি ভেরিফাইড পেমেন্টের ওপর নির্ভর করবে
    //         amountPaidThisMonth: paidThisMonthTotal,
    //         dueThisMonth: Math.max(0, monthlyPayable - paidThisMonthTotal),
    //       },
    //       totalPaidHistory: totalPaidHistory,
    //     };
    //   } catch (err) {
    //     throw new Error(err.message);
    //   }
    // },

    async calculateUserStatus(userId) {
      try {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // ১. ইউজারের লেটেস্ট শেয়ার রিপোর্ট আনা
        const shareReport = await strapi.db
          .query("api::user-share-report.user-share-report")
          .findOne({
            where: { user_id: userId },
            orderBy: { createdAt: "desc" },
          });

        if (!shareReport) return { error: "No share report found" };

        // ২. স্কিম ক্যালকুলেশন
        const scheme = await strapi.db
          .query("api::payment-year-scheme.payment-year-scheme")
          .findOne({
            where: {
              year_date_from: { $lte: shareReport.start_date },
              year_date_to: { $gte: shareReport.start_date },
            },
          });

        const monthlyPayable = scheme
          ? scheme.amount * shareReport.current_share
          : 0;

        // ৩. পেমেন্ট রিপোর্ট আনা (Draft & Publish ইস্যু ফিক্স করা হয়েছে)
        const allPayments = await strapi.db
          .query("api::payment-report.payment-report")
          .findMany({
            where: {
              paid_by: userId,
              publishedAt: { $notNull: true }, // শুধুমাত্র পাবলিশড ডেটা নিবে (এতে ডাবল কাউন্ট হবে না)
            },
          });

        let verifiedAmount = 0;
        let pendingAmount = 0;
        let hasPendingThisMonth = false;

        // ৪. লজিক্যাল ক্যালকুলেশন
        allPayments.forEach((p) => {
          const pDate = new Date(p.payment_date);
          const isCurrentMonth =
            pDate.getMonth() === currentMonth &&
            pDate.getFullYear() === currentYear;

          if (p.payment_status_verified) {
            // শুধুমাত্র ভেরিফাইড ডাটা এই মাসের পরিশোধিত টাকা হিসেবে যোগ হবে
            if (isCurrentMonth) {
              verifiedAmount += p.payment_amount || 0;
            }
          } else if (isCurrentMonth) {
            // এই মাসে রিপোর্ট জমা দিয়েছে কিন্তু অ্যাডমিন এখনো ভেরিফাই করেনি
            pendingAmount += p.payment_amount || 0;
            hasPendingThisMonth = true;
          }
        });

        // ৫. মোট জমা (যাবতীয় ভেরিফাইড পেমেন্টের যোগফল)
        const totalPaidHistory = allPayments
          .filter((p) => p.payment_status_verified === true)
          .reduce((sum, p) => sum + (p.payment_amount || 0), 0);

        return {
          payableAmountThisMonth: monthlyPayable,
          totalPaidHistory: totalPaidHistory, // নিখুঁত ভেরিফাইড টোটাল
          paymentStatus: {
            currentMonthName: today.toLocaleString("bn-BD", { month: "long" }),
            isVerified: verifiedAmount >= monthlyPayable,
            hasPending: hasPendingThisMonth,
            amountPaidVerified: verifiedAmount,
            amountPending: pendingAmount,
            dueThisMonth: Math.max(0, monthlyPayable - verifiedAmount),
          },
        };
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // async getAllUsersStatus() {
    //   try {
    //     const today = new Date();
    //     const currentMonth = today.getMonth();
    //     const currentYear = today.getFullYear();

    //     // ১. সব ইউজারদের নিয়ে আসা (যাদের অন্তত একটি শেয়ার রিপোর্ট আছে)
    //     const users = await strapi.db
    //       .query("plugin::users-permissions.user")
    //       .findMany({
    //         populate: ["profile_img"],
    //       });

    //     const allStatus = await Promise.all(
    //       users.map(async (user) => {
    //         // ২. ইউজারের লেটেস্ট শেয়ার রিপোর্ট
    //         const shareReport = await strapi.db
    //           .query("api::user-share-report.user-share-report")
    //           .findOne({
    //             where: { user_id: user.id },
    //             orderBy: { createdAt: "desc" },
    //           });

    //         if (!shareReport) return null; // শেয়ার রিপোর্ট না থাকলে বাদ

    //         const reportStartDate = shareReport.start_date;
    //         const currentShare = parseInt(shareReport.current_share || 0);

    //         // ৩. স্কিম বের করা
    //         const scheme = await strapi.db
    //           .query("api::payment-year-scheme.payment-year-scheme")
    //           .findOne({
    //             where: {
    //               year_date_from: { $lte: reportStartDate },
    //               year_date_to: { $gte: reportStartDate },
    //             },
    //           });

    //         if (!scheme) return null;

    //         // ৪. পেমেন্ট রিপোর্ট থেকে এই মাসের পেমেন্ট চেক
    //         const payments = await strapi.db
    //           .query("api::payment-report.payment-report")
    //           .findMany({
    //             where: { paid_by: user.id },
    //           });

    //         // let paidThisMonthTotal = 0;
    //         // const isPaidThisMonth = payments.some((p) => {
    //         //   if (!p.payment_date) return false;
    //         //   const pDate = new Date(p.payment_date);
    //         //   const isMatch =
    //         //     pDate.getMonth() === currentMonth &&
    //         //     pDate.getFullYear() === currentYear;
    //         //   if (isMatch) paidThisMonthTotal += p.payment_amount || 0;
    //         //   return isMatch;
    //         // });

    //         const monthlyPayable = scheme.amount * currentShare;

    //         return {
    //           userId: user.id,
    //           username: user.username,
    //           payments: JSON.stringify(payments),
    //           fullName: user.full_name,
    //           profile_url: user.profile_img ? user.profile_img.url : null,
    //           shareCount: currentShare,
    //           payableAmount: monthlyPayable,
    //           paidAmount: 200,
    //           dueAmount: 300,
    //           status: "Paid",
    //           // paidAmount: paidThisMonthTotal,
    //           // dueAmount: monthlyPayable - paidThisMonthTotal,
    //           // status: isPaidThisMonth ? "Paid" : "Unpaid",
    //         };
    //       })
    //     );

    //     console.log("allllll statuses", allStatus);

    //     // null ভ্যালুগুলো ফিল্টার করে শুধু ডেটা পাঠানো
    //     return allStatus.filter((item) => item !== null);
    //   } catch (err) {
    //     throw new Error(err.message);
    //   }
    // },

    async getAllUsersStatus() {
      try {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // ১. সব ইউজারদের নিয়ে আসা
        const users = await strapi.db
          .query("plugin::users-permissions.user")
          .findMany({
            populate: ["profile_img"],
          });

        const allStatus = await Promise.all(
          users.map(async (user) => {
            // ২. ইউজারের লেটেস্ট শেয়ার রিপোর্ট
            const shareReport = await strapi.db
              .query("api::user-share-report.user-share-report")
              .findOne({
                where: { user_id: user.id },
                orderBy: { createdAt: "desc" },
              });

            if (!shareReport) return null;

            const reportStartDate = shareReport.start_date;
            const currentShare = parseInt(shareReport.current_share || 0);

            // ৩. স্কিম বের করা
            const scheme = await strapi.db
              .query("api::payment-year-scheme.payment-year-scheme")
              .findOne({
                where: {
                  year_date_from: { $lte: reportStartDate },
                  year_date_to: { $gte: reportStartDate },
                },
              });

            if (!scheme) return null;

            // ৪. পেমেন্ট রিপোর্ট থেকে পেমেন্ট চেক (Verified logic সহ)
            const payments = await strapi.db
              .query("api::payment-report.payment-report")
              .findMany({
                where: { paid_by: user.id },
              });

            let paidThisMonthTotal = 0;

            // শুধু current month এবং verified পেমেন্ট ক্যালকুলেট করা
            payments.forEach((p) => {
              if (!p.payment_date) return;

              const pDate = new Date(p.payment_date);
              const isCurrentMonth =
                pDate.getMonth() === currentMonth &&
                pDate.getFullYear() === currentYear;

              // শর্ত: এই মাসের হতে হবে এবং স্ট্যাটাস verified হতে হবে
              if (isCurrentMonth && p.payment_status_verified === true) {
                paidThisMonthTotal += p.payment_amount || 0;
              }
            });

            const monthlyPayable = scheme.amount * currentShare;
            const dueAmount = monthlyPayable - paidThisMonthTotal;

            return {
              userId: user.id,
              username: user.username,
              fullName: user.full_name,
              profile_url: user.profile_img ? user.profile_img.url : null,
              shareCount: currentShare,
              payableAmount: monthlyPayable,
              paidAmount: paidThisMonthTotal, // শুধু verified অ্যামাউন্ট দেখাবে
              dueAmount: dueAmount < 0 ? 0 : dueAmount, // নেগেটিভ এড়াতে
              status: paidThisMonthTotal >= monthlyPayable ? "Paid" : "Unpaid",
            };
          })
        );

        return allStatus.filter((item) => item !== null);
      } catch (err) {
        throw new Error(err.message);
      }
    },
  })
);
