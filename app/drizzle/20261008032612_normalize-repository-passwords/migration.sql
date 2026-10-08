-- Older releases ignored custom passwords unless the repository was imported.
-- Preserve the organization password for those repositories before enabling
-- independent passwords for newly initialized repositories.
UPDATE `repositories_table`
SET `config` = json_remove(`config`, '$.customPassword')
WHERE coalesce(json_extract(`config`, '$.isExistingRepository'), 0) = 0
  AND json_type(`config`, '$.customPassword') IS NOT NULL;
