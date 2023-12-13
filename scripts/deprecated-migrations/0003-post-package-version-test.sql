-- This file creates the test data needed for
-- post.package.handler.integration.test.js suite for POST packages

INSERT INTO packages (pointer, package_type, name, creation_method, downloads, stargazers_count, original_stargazers, data)
VALUES (
  'f3960bc3-84d6-48d9-bd6a-0e5a5844dbc8', 'package', 'language-pon', 'User Made Package',
  40, 0, 10,
  '{"name": "language-pon", "readme": "Cool Readme", "metadata": {} }'
);

INSERT INTO names (name, pointer)
VALUES (
  'language-pon', 'f3960bc3-84d6-48d9-bd6a-0e5a5844dbc8'
);

INSERT INTO versions (package, status, semver, license, engine, meta)
VALUES (
  'f3960bc3-84d6-48d9-bd6a-0e5a5844dbc8', 'latest', '1.0.0', 'MIT', '{"atom":"*"}',
  '{"name":"language-pon","description":"CSS Supports in Atom"}'
);

INSERT INTO users (id, username, node_id, avatar)
VALUES (
  9999, 'post-pkg-publish-test-user', 'post-pkg-publish-test-user-node-id', 'https://roadtonowhere.com'
);
