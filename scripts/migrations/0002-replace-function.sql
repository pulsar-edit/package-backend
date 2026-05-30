-- Replace the function that triggers modification of the updated column
-- on packages, to only respond to changes made by package authors.
CREATE OR REPLACE TRIGGER trigger_now_on_updated
  BEFORE UPDATE
  OF name, owner, data
  ON packages
  FOR EACH ROW
EXECUTE PROCEDURE now_on_updated_package();

-- Remove Version update trigger
DROP TRIGGER IF EXISTS trigger_now_on_updated_versions ON versions;
-- There is no package manager accessible way to update a deployed version.
-- So we shouldn't need to account for this at this time.
