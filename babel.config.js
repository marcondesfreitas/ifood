module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // O plugin de worklets é exigido pelo Reanimated 4 (vamos usar na Etapa 2).
    // Ele precisa ser SEMPRE o último plugin da lista.
    plugins: ['react-native-worklets/plugin'],
  };
};
