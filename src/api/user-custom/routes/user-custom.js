module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/user/update-profile",
      handler: "user-custom.updateProfile",
      config: {
        auth: false, // ডেভেলপমেন্ট শেষ হলে এটি সরিয়ে JWT ব্যবহার করবেন
      },
    },
    {
      method: "PUT",
      path: "/user/change-password",
      handler: "user-custom.changePassword",
      config: {
        auth: false,
      },
    },
    // {
    //   method: "POST",
    //   path: "/user-profile/register-push-token",
    //   handler: "user-custom.registerPushToken",
    //   config: {
    //     policies: [],
    //     auth: true,
    //   },
    // },

    {
      method: "POST",
      path: "/user-profile/register-push-token",
      handler: "user-custom.registerPushToken",
      config: {
        policies: [],
        // ✅ সঠিক v5 সিনট্যাক্স: 'strategies' অবজেক্ট ব্যবহার করুন
        auth: {},
      },
    },
  ],
};
