-- Table: public.versions
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE TYPE versionStatus AS ENUM('latest', 'published', 'removed');

CREATE TABLE versions (
    id SERIAL PRIMARY KEY,
    package UUID NOT NULL REFERENCES packages(pointer),
    status versionStatus NOT NULL,
    semver VARCHAR(256) NOT NULL,
    license VARCHAR(128) NOT NULL,
    engine JSONB NOT NULL,
    meta JSONB,
    -- generated columns
    semver_v1 INTEGER GENERATED ALWAYS AS
        (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[1] AS INTEGER)) STORED,
    semver_v2 INTEGER GENERATED ALWAYS AS
        (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[2] AS INTEGER)) STORED,
    semver_v3 INTEGER GENERATED ALWAYS AS
        (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[3] AS INTEGER)) STORED,
    -- constraints
    CONSTRAINT semver2_format CHECK (semver ~ '^\d+\.\d+\.\d+'),
    CONSTRAINT unique_pack_version UNIQUE(package, semver_v1, semver_v2, semver_v3)
);
