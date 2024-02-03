let emptyClause;

function getEmptyClause(sql) {
  emptyClause ??= sql``;
  return emptyClause;
}

function queryClause(sql, opts) {
  if (typeof opts.query !== "string") {
    return getEmptyClause(sql);
  }

  // We obtain the lowercase version of the query since names should be in
  // lowercase format (see atom-backend issue #86)
  const lcterm = opts.query.toLowerCase();

  const wordSeparators = /[-. ]/g; // Word Separators: - . SPACE

  const searchTerm = lcterm.replace(wordSeparators, "_");
  // Replaces all word separators with '_' which matches any single character

  return sql`AND p.name LIKE ${"%" + searchTerm + "%"}`;
}

function filterClause(sql, opts) {
  if (typeof opts.filter !== "string") {
    return getEmptyClause(sql);
  }

  if (opts.filter === "theme") {
    return sql`AND p.package_type = 'theme'`;
  } else if (opts.filter === "package") {
    // Since our fork from Atom, we have made the choice to return themes and packages
    // on basic searches, meaning that `ppm`s filter of `package` has always returned
    // packages and themes.
    // If we decide to change this, uncomment the below line.
    //return sqlStorage`AND p.package_type = 'package'`;
    return getEmptyClause(sql);
  } else {
    return getEmptyClause(sql);
  }
}

function ownerClause(sql, opts) {
  if (typeof opts.owner !== "string") {
    return getEmptyClause(sql);
  }
  return sql`AND p.owner = ${opts.owner}`;
}

function serviceClause(sql, opts) {
  if (
    typeof opts.service !== "string" ||
    typeof opts.serviceType !== "string"
  ) {
    return getEmptyClause(sql);
  }
  let versionClause;
  if (typeof opts.serviceVersion !== "string") {
    versionClause = sql`IS NOT NULL`;
  } else {
    versionClause = sql`-> 'versions' -> ${opts.serviceVersion} IS NOT NULL`;
  }

  return sql`AND v.meta -> ${opts.serviceType} -> ${opts.service} ${versionClause}`;
}

function fileExtensionClause(sql, opts) {
  if (typeof opts.fileExtension !== "string") {
    return getEmptyClause(sql);
  }

  return sql`AND ${opts.fileExtension}=ANY(v.supported_languages)`;
}

module.exports = {
  getEmptyClause,
  queryClause,
  filterClause,
  ownerClause,
  serviceClause,
  fileExtensionClause,
};
