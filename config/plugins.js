module.exports = ({ env }) => ({
  upload: {
    config: {
      sizeLimit: 10 * 1024 * 1024, // আমি এখানে ১০ এমবি করে দিলাম যেহেতু মিডলওয়্যারে ১০ দিয়েছেন
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
      },
    },
  },
});
