/**
 * @async
 * @function applyFeatures
 * @desc Takes a Feature Object, and applies it's data to the appropriate package
 * @param {object} featureObj - The object containing all feature declarations.
 * @param {boolean} featureObj.hasGrammar - If present, and true, means this
 * package version provides a grammar.
 * @param {boolean} featureObj.hasSnippets - If present, and true, means this
 * package version provides snippets.
 * @param {string[]} featureObj.supportedLanguages - If present, defines an array
 * of strings specifying the extensions, or file names supported by this grammar.
 * @param {string} packName - The name of the package to be affected.
 * @param {string} packVersion - The regular semver version of the package
 */

const getPackageByNameSimple = require("./getPackageByNameSimple.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, featureObj, packName, packVersion) => {
    const packID = await getPackageByNameSimple(sql, packName);

    if (!packID.ok) {
      return {
        ok: false,
        content: `Unable to find the pointer of ${packName}`,
        short: "not_found",
      };
    }

    const pointer = packID.content.pointer;

    if (featureObj.hasSnippets) {
      const addSnippetCommand = await sql`
        UPDATE versions
        SET has_snippets = TRUE
        WHERE package = ${pointer} AND semver = ${packVersion};
      `;

      if (addSnippetCommand.count === 0) {
        return {
          ok: false,
          content: `Unable to set 'has_snippets' flag to true for ${packName}`,
          short: "server_error",
        };
      }
    }

    if (featureObj.hasGrammar) {
      const addGrammarCommand = await sql`
        UPDATE versions
        SET has_grammar = TRUE
        WHERE package = ${pointer} AND semver = ${packVersion};
      `;

      if (addGrammarCommand.count === 0) {
        return {
          ok: false,
          content: `Unable to set 'has_grammar' flag to true for ${packName}`,
          short: "server_error",
        };
      }
    }

    if (
      Array.isArray(featureObj.supportedLanguages) &&
      featureObj.supportedLanguages.length > 0
    ) {
      // Add the supported languages
      const addLangCommand = await sql`
        UPDATE versions
        SET supported_languages = ${featureObj.supportedLanguages}
        WHERE package = ${pointer} AND semver = ${packVersion};
      `;

      if (addLangCommand.count === 0) {
        return {
          ok: false,
          content: `Unable to add supportedLanguages to ${packName}`,
          short: "server_error",
        };
      }
    }

    return {
      ok: true,
    };
  },
};
