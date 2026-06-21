module.exports = function (api) {
  api.cache(true);
  return {
    // در Expo SDK 51، پشتیبانی از expo-router داخل همین preset است
    // و خواندن مسیرهای کوتاه «@/...» از tsconfig به‌صورت خودکار انجام می‌شود.
    presets: ['babel-preset-expo'],
  };
};
