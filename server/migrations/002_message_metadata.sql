USE portfolio_db;

SET @add_subject = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE messages ADD COLUMN subject VARCHAR(200) NULL AFTER email',
    'SELECT 1'
  )
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'messages'
    AND column_name = 'subject'
);
PREPARE add_subject_statement FROM @add_subject;
EXECUTE add_subject_statement;
DEALLOCATE PREPARE add_subject_statement;

SET @add_moderated_at = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE messages ADD COLUMN moderated_at TIMESTAMP NULL AFTER created_at',
    'SELECT 1'
  )
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'messages'
    AND column_name = 'moderated_at'
);
PREPARE add_moderated_at_statement FROM @add_moderated_at;
EXECUTE add_moderated_at_statement;
DEALLOCATE PREPARE add_moderated_at_statement;
