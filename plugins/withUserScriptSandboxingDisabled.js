const { withXcodeProject } = require('expo/config-plugins');

// React Native's "Bundle React Native code and images" phase writes files
// (e.g. ip.txt) into the app bundle, which Xcode's user script sandbox blocks.
// Xcode's "recommended settings" upgrade turns the sandbox on, so force it off.
module.exports = function withUserScriptSandboxingDisabled(config) {
  return withXcodeProject(config, (config) => {
    const configurations = config.modResults.pbxXCBuildConfigurationSection();
    for (const entry of Object.values(configurations)) {
      if (typeof entry === 'object' && entry.buildSettings) {
        entry.buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
      }
    }
    return config;
  });
};
