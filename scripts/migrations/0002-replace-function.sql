CREATE OR REPLACE FUNCTION now_on_updated_package()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'versions' THEN
    -- Since this function is also triggerred on the version table changes
    -- and the version table does not contain a downloads column, we exclude
    -- the check when operating on the versions table.
    RETURN NEW;
  END IF;
  IF (OLD.downloads = NEW.downloads) THEN
    -- Only change the updated column when the update is not triggerred
    -- by changing the download count.
    NEW.updated = NOW();
    RETURN NEW;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';
