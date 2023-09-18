-- Create packages TABLE

CREATE EXTENSION pgcrypto;

CREATE TYPE packageType AS ENUM('package', 'theme');

CREATE TABLE packages (
    pointer UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    package_type packageType NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creation_method VARCHAR(128),
    downloads BIGINT NOT NULL DEFAULT 0,
    stargazers_count BIGINT NOT NULL DEFAULT 0,
    original_stargazers BIGINT NOT NULL DEFAULT 0,
    data JSONB,
    -- constraints
    CONSTRAINT lowercase_names CHECK (name = LOWER(name))
);

CREATE FUNCTION now_on_updated_package()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_now_on_updated
    BEFORE UPDATE ON packages
    FOR EACH ROW
EXECUTE PROCEDURE now_on_updated_package();

-- Create names Table

CREATE TABLE names (
    name VARCHAR(128) NOT NULL PRIMARY KEY,
    pointer UUID NULL,
    -- constraints
    CONSTRAINT lowercase_names CHECK (name = LOWER(name)),
    CONSTRAINT package_names_fkey FOREIGN KEY (pointer) REFERENCES packages(pointer) ON DELETE SET NULL
);

-- Create users Table

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(256) NOT NULL UNIQUE,
    node_id VARCHAR(256) UNIQUE,
    avatar VARCHAR(100),
    data JSONB
);

-- Create stars Table

CREATE TABLE stars (
    package UUID NOT NULL REFERENCES packages(pointer),
    userid INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (package, userid)
);

-- Create versions Table

CREATE TYPE versionStatus AS ENUM('latest', 'published', 'removed');

CREATE TABLE versions (
    id SERIAL PRIMARY KEY,
    package UUID NOT NULL REFERENCES packages(pointer),
    status versionStatus NOT NULL,
    semver VARCHAR(256) NOT NULL,
    license VARCHAR(128) NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    engine JSONB NOT NULL,
    meta JSONB,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    has_grammar BOOLEAN NOT NULL DEFAULT FALSE,
    has_snippets BOOLEAN NOT NULL DEFAULT FALSE,
    supported_languages VARCHAR(256) ARRAY,
    -- generated columns
    semver_v1 INTEGER GENERATED ALWAYS AS
        (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[1] AS INTEGER)) STORED,
    semver_v2 INTEGER GENERATED ALWAYS AS
        (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[2] AS INTEGER)) STORED,
    semver_v3 INTEGER GENERATED ALWAYS AS
        (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[3] AS INTEGER)) STORED,
    -- constraints
    CONSTRAINT semver2_format CHECK (semver ~ '^\d+\.\d+\.\d+'),
    CONSTRAINT unique_pack_version UNIQUE(package, semver)
);

CREATE TRIGGER trigger_now_on_updated_versions
    BEFORE UPDATE ON versions
    FOR EACH ROW
EXECUTE PROCEDURE now_on_updated_package();

-- Create authstate Table

CREATE TABLE authstate (
    id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
    keycode VARCHAR(256) NOT NULL UNIQUE,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
