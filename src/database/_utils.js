/**
 * @async
 * @function getOrderField
 * @description Internal method to parse the sort method and return the related database field/column.
 * @param {string} method - The sort method.
 * @param {object} sqlStorage - The database class instance used parse the proper field.
 * @returns {object|null} The string field associated to the sort method or null if the method is not recognized.
 */
function getOrderField(method, sql) {
  switch (method) {
    case "relevance":
    case "downloads":
      return sql`downloads`;
    case "created_at":
      return sql`created`;
    case "updated_at":
      return sql`updated`;
    case "stars":
      return sql`stargazers_count`;
    default:
      return null;
  }
}

module.exports = {
  getOrderField
};
