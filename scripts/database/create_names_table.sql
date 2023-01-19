-- Table: public.pointers
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE TABLE names (
    name VARCHAR(128) NOT NULL PRIMARY KEY,
    pointer UUID NULL,
    -- constraints
    CONSTRAINT lowercase_names CHECK (name = LOWER(name)),
    CONSTRAINT package_names_fkey FOREIGN KEY (pointer) REFERENCES packages(pointer) ON DELETE SET NULL
);

-- Lowercase constraint added upon the following issue:
-- https://github.com/confused-Techie/atom-backend/issues/90

/*
-- `pointer` was NOT NULL, then we made it nullable.
-- The previous foreign key has been dropped and a new `package_names_fkey`
-- has need added to avoid supply chain attacks.
-- `pointer` is set to NULL when a row in packages table is deleted.
-- Steps made to apply this change:

ALTER TABLE names ALTER COLUMN pointer DROP NOT NULL;

ALTER TABLE names DROP CONSTRAINT previous_foreign_key_name;

ALTER TABLE names
ADD CONSTRAINT package_names_fkey FOREIGN KEY (pointer) REFERENCES packages(pointer) ON DELETE SET NULL;
*/
