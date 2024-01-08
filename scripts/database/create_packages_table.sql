-- Table: public.packages
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE EXTENSION pgcrypto;

-- packageType enum type
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

-- Lowercase constraint added upon the following issue:
-- https://github.com/confused-Techie/atom-backend/issues/90

ALTER TABLE packages ADD CONSTRAINT lowercase_names CHECK (name = LOWER(name));

/* The introduction of the packageType column
-- Add packageType column
ALTER TABLE packages ADD COLUMN package_type VARCHAR(20);

UPDATE packages
SET package_type = 'theme'
WHERE LOWER(data ->'metadata'->> 'theme') = 'syntax' OR LOWER(data ->'metadata'->>'theme') = 'ui';

UPDATE packages
SET package_type = 'package'
WHERE package_type IS DISTINCT FROM 'theme';

-- Cast existing values of package_type in packageType
ALTER TABLE packages
ALTER COLUMN package_type TYPE packageType USING (package_type::packageType),
ALTER COLUMN package_type SET NOT NULL;
*/

-- Create a function and a trigger to set the current timestamp
-- in the `updated` column of the updated row

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


-- Add an `owner` field to the table

-- GitHub username length limit is apparently 39. For future-proofing, we'll
-- envision a prefix that specifies an alternative VCS, so let's build in some
-- wiggle room.
ALTER TABLE packages
ADD COLUMN owner VARCHAR(60);
