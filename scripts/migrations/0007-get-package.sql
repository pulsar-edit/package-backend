INSERT INTO packages (pointer, package_type, name, creation_method, downloads, stargazers_count, original_stargazers, data)
VALUES (
  '93039b82-ad27-449d-80f8-c673a150b6d0', 'package', 'language-asp', 'User Made Package',
  1000, 0, 2,
  '{"name":"language-asp","readme":"cool readme", "metadata":{}}'
);

INSERT INTO names (name, pointer)
VALUES (
  'language-asp', '93039b82-ad27-449d-80f8-c673a150b6d0'
);

INSERT INTO versions (package, status, semver, license, engine, meta)
VALUES (
  '93039b82-ad27-449d-80f8-c673a150b6d0', 'latest', '0.0.1', 'MIT', '{"atom":"*"}',
  '{"name":"language-asp","description":"CSS Supports in Pulsar"}'
);
