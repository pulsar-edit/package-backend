
-- This file creates the test packages needed for
--  post.packages.handler.integration.test.js suite

INSERT INTO packages (pointer, package_type, name, creation_method, downloads, stargazers_count, original_stargazers, data)
VALUES (
  '85886777-ab9c-47e9-bcf5-293a3e3a34b3', 'package', 'language-gfm', 'User Made Package',
  200, 0, 30,
  '{"name": "language-gfm", "readme": "Cool Readme", "metadata": {} }'
);

INSERT INTO names (name, pointer)
VALUES (
  'language-gfm', '85886777-ab9c-47e9-bcf5-293a3e3a34b3'
);

INSERT INTO versions (package, status, semver, license, engine, meta)
VALUES (
  '85886777-ab9c-47e9-bcf5-293a3e3a34b3', 'latest', '1.0.0', 'MIT', '{"atom":"*"}',
  '{"name":"language-gfm","description":"CSS Supports in Atom"}'
);

INSERT INTO users (id, username, node_id, avatar)
VALUES (
  999, 'post-star-test-user', 'post-star-test-user-node-id', 'https://roadtonowhere.com'
); -- This user intentionally has not starred the package above
