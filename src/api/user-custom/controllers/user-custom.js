"use strict";

module.exports = {
  async updateProfile(ctx) {
    const { userId, ...updateData } = ctx.request.body;

    if (!userId) return ctx.badRequest("User ID is required");

    try {
      // সার্ভিস কল করা
      const user = await strapi
        .service("api::user-custom.user-custom")
        .updateProfileLogic(userId, updateData);

      ctx.body = {
        status: "success",
        message: "Profile updated successfully",
        data: {
          username: user.username,
          full_name: user.full_name,
          phone_number: user.phone_number,
        },
      };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },

  async changePassword(ctx) {
    const { userId, currentPassword, newPassword } = ctx.request.body;

    if (!userId || !currentPassword || !newPassword) {
      return ctx.badRequest("All fields are required");
    }

    try {
      // সার্ভিস কল করা
      await strapi
        .service("api::user-custom.user-custom")
        .changePasswordLogic(userId, currentPassword, newPassword);

      ctx.body = {
        status: "success",
        message: "Password changed successfully",
      };
    } catch (err) {
      ctx.badRequest(err.message);
    }
  },

  async registerPushToken(ctx) {
    // 1. Get the token from the request body
    const { token } = ctx.request.body;

    // 2. Get the authenticated user from the context
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Authentication required");
    }

    if (!token) {
      return ctx.badRequest("Push token is missing");
    }

    try {
      // 3. Update the user record.
      // Ensure you have a field named 'pushToken' in your User Content Type
      await strapi.query("plugin::users-permissions.user").update({
        where: { id: user.id },
        data: { expoPushToken: token },
      });

      return ctx.send({
        ok: true,
        message: "Push token saved successfully",
      });
    } catch (err) {
      ctx.body = err;
      return ctx.internalServerError("Failed to update user push token");
    }
  },
};
