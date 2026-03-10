/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const mime = require('mime-types');

exports.up = async (knex) => {
  await knex.schema.createTable('storage_usage', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('total').notNullable();
    table.bigInteger('user_avatars').notNullable();
    table.bigInteger('background_images').notNullable();
    table.bigInteger('attachments').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
  });

  await knex.schema.alterTable('file_reference', (table) => {
    table.dropPrimary();
    table.dropIndex('total');
  });

  await knex.schema.renameTable('file_reference', 'uploaded_file');

  await knex.raw(`
    ALTER TABLE uploaded_file
    MODIFY COLUMN id VARCHAR(22) NOT NULL PRIMARY KEY,
    ADD COLUMN type TEXT NOT NULL DEFAULT 'attachment',
    ADD COLUMN mime_type TEXT,
    ADD COLUMN size BIGINT NOT NULL DEFAULT 0,
    RENAME COLUMN total TO references_total,
    ADD INDEX (type),
    ADD INDEX (references_total)
  `);

  await knex.raw(`
    UPDATE user_account
    SET avatar = JSON_SET(
      JSON_REMOVE(avatar, '$.dirname', '$.sizeInBytes'),
      '$.uploadedFileId', JSON_UNQUOTE(JSON_EXTRACT(avatar, '$.dirname')),
      '$.size', JSON_UNQUOTE(JSON_EXTRACT(avatar, '$.sizeInBytes'))
    )
    WHERE avatar IS NOT NULL
  `);

  await knex.schema.alterTable('background_image', (table) => {
    table.renameColumn('dirname', 'uploaded_file_id');
    table.renameColumn('size_in_bytes', 'size');
  });

  await knex.raw(`
    UPDATE attachment
    SET data = JSON_SET(
      JSON_REMOVE(data, '$.fileReferenceId', '$.sizeInBytes'),
      '$.uploadedFileId', JSON_UNQUOTE(JSON_EXTRACT(data, '$.fileReferenceId')),
      '$.size', JSON_UNQUOTE(JSON_EXTRACT(data, '$.sizeInBytes'))
    )
    WHERE type = 'file'
  `);

  await knex.raw(`
    UPDATE uploaded_file u
    INNER JOIN attachment a ON JSON_UNQUOTE(JSON_EXTRACT(a.data, '$.uploadedFileId')) = u.id AND a.type = 'file'
    SET
      u.type = 'attachment',
      u.mime_type = JSON_UNQUOTE(JSON_EXTRACT(a.data, '$.mimeType')),
      u.size = CAST(JSON_UNQUOTE(JSON_EXTRACT(a.data, '$.size')) AS SIGNED)
  `);

  const users = await knex('user_account').whereNotNull('avatar');
  const createdAt = new Date().toISOString();

  await knex.batchInsert(
    'uploaded_file',
    users.map(({ avatar }) => ({
      createdAt,
      id: String(avatar.uploadedFileId),
      type: 'userAvatar',
      referencesTotal: 1,
      mimeType: mime.lookup(avatar.extension) || null,
      size: avatar.size,
    })),
  );

  const backgroundImages = await knex('background_image');

  await knex.batchInsert(
    'uploaded_file',
    backgroundImages.map((backgroundImage) => ({
      id: String(backgroundImage.uploaded_file_id),
      type: 'backgroundImage',
      referencesTotal: 1,
      mimeType: mime.lookup(backgroundImage.extension) || null,
      size: backgroundImage.size,
      createdAt: backgroundImage.created_at,
    })),
  );

  return knex.raw(`
    INSERT INTO storage_usage (id, total, user_avatars, background_images, attachments, created_at)
    SELECT
      1,
      COALESCE(SUM(size), 0),
      COALESCE(SUM(CASE WHEN type = 'userAvatar' THEN size ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN type = 'backgroundImage' THEN size ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN type = 'attachment' THEN size ELSE 0 END), 0),
      UTC_TIMESTAMP()
    FROM uploaded_file
  `);
};

exports.down = async (knex) => {
  await knex.schema.dropTable('storage_usage');

  await knex('uploaded_file').delete().whereNot('type', 'attachment');

  await knex.schema.alterTable('uploaded_file', (table) => {
    table.dropPrimary();
    table.dropIndex('references_total');
  });

  await knex.schema.renameTable('uploaded_file', 'file_reference');

  await knex.raw(`
    ALTER TABLE file_reference
    DROP COLUMN type,
    DROP COLUMN mime_type,
    DROP COLUMN size,
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    RENAME COLUMN references_total TO total,
    ADD INDEX (total)
  `);

  await knex.raw(`
    UPDATE user_account
    SET avatar = JSON_SET(
      JSON_REMOVE(avatar, '$.uploadedFileId', '$.size'),
      '$.dirname', JSON_UNQUOTE(JSON_EXTRACT(avatar, '$.uploadedFileId')),
      '$.sizeInBytes', JSON_UNQUOTE(JSON_EXTRACT(avatar, '$.size'))
    )
    WHERE avatar IS NOT NULL
  `);

  await knex.schema.alterTable('background_image', (table) => {
    table.renameColumn('uploaded_file_id', 'dirname');
    table.renameColumn('size', 'size_in_bytes');
  });

  return knex.raw(`
    UPDATE attachment
    SET data = JSON_SET(
      JSON_REMOVE(data, '$.uploadedFileId', '$.size'),
      '$.fileReferenceId', JSON_UNQUOTE(JSON_EXTRACT(data, '$.uploadedFileId')),
      '$.sizeInBytes', JSON_UNQUOTE(JSON_EXTRACT(data, '$.size'))
    )
    WHERE type = 'file'
  `);
};
