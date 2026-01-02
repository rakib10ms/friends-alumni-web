"use strict";
const bcrypt = require("bcryptjs");

module.exports = ({ strapi }) => ({
  // ১. প্রোফাইল আপডেট লজিক
  async updateProfileLogic(userId, data) {
    const { full_name, phone_number, profile_img_id } = data;

    const dataToUpdate = {
      full_name,
      phone_number,
    };

    if (profile_img_id) {
      dataToUpdate.profile_img = profile_img_id;
    }

    const updatedUser = await strapi.db
      .query("plugin::users-permissions.user")
      .update({
        where: { id: userId },
        data: dataToUpdate,
      });

    return updatedUser;
  },

  // ২. পাসওয়ার্ড চেঞ্জ লজিক
  async changePasswordLogic(userId, currentPassword, newPassword) {
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId } });

    if (!user) throw new Error("User not found");

    // পাসওয়ার্ড ভেরিফিকেশন
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) throw new Error("Current password is incorrect");

    // নতুন পাসওয়ার্ড হ্যাশ করা
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { success: true };
  },
});
