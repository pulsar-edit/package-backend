INSERT INTO users (username, node_id, avatar)
VALUES (
  'no-star-test-user', 'star-test-user-node-id', 'https://domain.org'
);

INSERT INTO users (id, username, node_id, avatar)
VALUES (
  2222, 'many-star-user', 'many-star-user-node-id', 'https://domain.org'
);

INSERT INTO packages (pointer, package_type, name, creation_method, downloads, stargazers_count, original_stargazers, data)
VALUES (
  'c8e3efb1-3b5d-4d20-9064-5d556cdb193f', 'package', 'star-this-package', 'Migrated Package',
  100, 0, 20,
  '{"name":"star-this-package","readme":"Cool Readme","metadata":{}}'
);

INSERT INTO names (name, pointer)
VALUES (
  'star-this-package', 'c8e3efb1-3b5d-4d20-9064-5d556cdb193f'
);

INSERT INTO versions (package, status, semver, license, engine, meta)
VALUES (
  'c8e3efb1-3b5d-4d20-9064-5d556cdb193f', 'latest', '0.46.0', 'MIT', '{"atom":"*"}',
  '{"name":"star-this-package","description":"Just star pls","metadata":{}}'
);

INSERT INTO stars (package, userid)
VALUES (
  'c8e3efb1-3b5d-4d20-9064-5d556cdb193f', 2222
);
