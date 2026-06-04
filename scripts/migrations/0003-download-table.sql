CREATE TABLE package_downloads_daily (
  pointer UUID NOT NULL REFERENCES packages(pointer),
  download_date DATE NOT NULL DEFAULT CURRENT_DATE,
  downloads BIGINT NOT NULL DEFAULT 1,
  PRIMARY KEY (pointer, download_date)
);

-- Improve performance of these scans by indexing the date
CREATE INDEX idx_downloads_date ON package_downloads_daily(download_date);
