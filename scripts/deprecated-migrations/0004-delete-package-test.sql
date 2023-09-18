INSERT INTO packages (pointer, package_type, name, creation_method, downloads, stargazers_count, original_stargazers, data)
VALUES (
  '22997cd7-0609-4d02-bb00-6d4d514a010a', 'package', 'syntax-pon', 'Migrated Package',
  100, 0, 20,
  '{"name":"syntax-pon","readme":"Cool Readme","metadata":{}}'
), (
  '4f6bf74a-9fb5-43b6-89ca-393f1d97aa9e', 'package', 'syntax-gfm', 'User Made Package',
  100, 1, 10,
  '{"name":"syntax-gfm","readme":"Cool Readme","metadata":{}}'
), (
  'eed13f02-8b7d-433d-a7cb-f0c33d0e573a', 'package', 'syntax-cpp', 'User Made Package',
  100, 0, 10,
  '{"name":"syntax-cpp","readme":"Cool readme","metadata":{}}'
);

INSERT INTO names (name, pointer)
VALUES (
  'syntax-pon', '22997cd7-0609-4d02-bb00-6d4d514a010a'
), (
  'syntax-gfm', '4f6bf74a-9fb5-43b6-89ca-393f1d97aa9e'
), (
  'syntax-cpp', 'eed13f02-8b7d-433d-a7cb-f0c33d0e573a'
);

INSERT INTO versions (package, status, semver, license, engine, meta)
VALUES (
  '22997cd7-0609-4d02-bb00-6d4d514a010a', 'latest', '1.0.0', 'MIT', '{"atom":"*"}',
  '{"name":"syntax-pon","description":"PON Support in Pulsar"}'
), (
  'eed13f02-8b7d-433d-a7cb-f0c33d0e573a', 'latest', '1.0.0', 'MIT', '{"atom":"*"}',
  '{"name":"syntax-cpp","description":"CPP Something"}'
), (
  'eed13f02-8b7d-433d-a7cb-f0c33d0e573a', 'published', '0.0.9', 'MIT', '{"atom":"*"}',
  '{"name":"syntax-cpp","description":"CPP"}'
);

INSERT INTO users (username, node_id, avatar)
VALUES (
  'no-repo-access-delete-pkg', 'no-repo-access-delete-pkg-node-id', 'https://domain.org'
), (
  'can-delete-version', 'can-delete-version-node-id', 'https://domain.org'
);

INSERT INTO users (id, username, node_id, avatar)
VALUES (
  11111, 'has-starred-syntax-gfm', 'has-starred-syntax-gfm-node-id', 'https://domain.org'
);

INSERT INTO stars (package, userid)
VALUES (
  '4f6bf74a-9fb5-43b6-89ca-393f1d97aa9e', 11111
);
