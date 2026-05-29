CREATE OR REPLACE FUNCTION now_on_updated_package()
RETURNS TRIGGER AS $$
BEGIN
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
