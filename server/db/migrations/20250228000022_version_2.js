/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = async (knex) => {
  await knex.schema.createTable('_id_sequence', (table) => {
    table.bigIncrements('id').primary();
  });

  await knex.schema.createTable('file_reference', (table) => {
    table.bigIncrements('id').primary();
    table.integer('total');
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('total');
  });

  await knex.schema.createTable('user_account', (table) => {
    table.bigIncrements('id').primary();
    table.text('email').notNullable();
    table.text('password');
    table.text('role').notNullable();
    table.text('name').notNullable();
    table.text('username');
    table.json('avatar');
    table.text('phone');
    table.text('organization');
    table.text('language');
    table.boolean('subscribe_to_own_cards').notNullable();
    table.boolean('subscribe_to_card_when_commenting').notNullable();
    table.boolean('turn_off_recent_card_highlighting').notNullable();
    table.boolean('enable_favorites_by_default').notNullable();
    table.text('default_editor_mode').notNullable();
    table.text('default_home_view').notNullable();
    table.text('default_projects_order').notNullable();
    table.boolean('is_sso_user').notNullable();
    table.boolean('is_deactivated').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.timestamp('password_changed_at', true);
    table.unique('email');
    table.index('role');
    table.unique('username');
    table.index('is_deactivated');
  });

  await knex.schema.createTable('identity_provider_user', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').notNullable();
    table.text('issuer').notNullable();
    table.text('sub').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.unique(['issuer', 'sub']);
    table.index('user_id');
  });

  await knex.schema.createTable('session', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').notNullable();
    table.text('access_token').notNullable();
    table.text('http_only_token');
    table.text('remote_address').notNullable();
    table.text('user_agent');
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.timestamp('deleted_at', true);
    table.index('user_id');
    table.unique('access_token');
    table.index('remote_address');
  });

  await knex.schema.createTable('project', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('owner_project_manager_id');
    table.bigInteger('background_image_id');
    table.text('name').notNullable();
    table.text('description');
    table.text('background_type');
    table.text('background_gradient');
    table.boolean('is_hidden').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('owner_project_manager_id');
  });

  await knex.schema.createTable('project_favorite', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('project_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.unique(['project_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('project_manager', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('project_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.unique(['project_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('background_image', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('project_id').notNullable();
    table.text('dirname').notNullable();
    table.text('extension').notNullable();
    table.bigInteger('size_in_bytes').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('project_id');
  });

  await knex.schema.createTable('base_custom_field_group', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('project_id').notNullable();
    table.text('name').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('project_id');
  });

  await knex.schema.createTable('board', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('project_id').notNullable();
    table.double('position').notNullable();
    table.text('name').notNullable();
    table.text('default_view').notNullable();
    table.text('default_card_type').notNullable();
    table.boolean('limit_card_types_to_default_one').notNullable();
    table.boolean('always_display_card_creator').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('project_id');
    table.index('position');
  });

  await knex.schema.createTable('board_subscription', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('board_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.unique(['board_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('board_membership', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('project_id').notNullable();
    table.bigInteger('board_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.text('role').notNullable();
    table.boolean('can_comment');
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('project_id');
    table.unique(['board_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('label', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('board_id').notNullable();
    table.double('position').notNullable();
    table.text('name');
    table.text('color').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('board_id');
    table.index('position');
  });

  await knex.schema.createTable('list', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('board_id').notNullable();
    table.text('type').notNullable();
    table.double('position');
    table.text('name');
    table.text('color');
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('board_id');
    table.index('type');
    table.index('position');
  });

  await knex.schema.createTable('card', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('board_id').notNullable();
    table.bigInteger('list_id').notNullable();
    table.bigInteger('creator_user_id');
    table.bigInteger('prev_list_id');
    table.bigInteger('cover_attachment_id');
    table.text('type').notNullable();
    table.double('position');
    table.text('name').notNullable();
    table.text('description');
    table.timestamp('due_date', true);
    table.json('stopwatch');
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.timestamp('list_changed_at', true);
    table.index('board_id');
    table.index('list_id');
    table.index('creator_user_id');
    table.index('position');
    table.index('list_changed_at');
    table.index('name', 'card_name_index');
    table.index('description', 'card_description_index');
  });

  await knex.schema.createTable('card_subscription', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.boolean('is_permanent').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.unique(['card_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('card_membership', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.unique(['card_id', 'user_id']);
    table.index('user_id');
  });

  await knex.schema.createTable('card_label', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('label_id').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.unique(['card_id', 'label_id']);
    table.index('label_id');
  });

  await knex.schema.createTable('task_list', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('card_id').notNullable();
    table.double('position').notNullable();
    table.text('name').notNullable();
    table.boolean('show_on_front_of_card').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('card_id');
    table.index('position');
  });

  await knex.schema.createTable('task', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('task_list_id').notNullable();
    table.bigInteger('assignee_user_id');
    table.double('position').notNullable();
    table.text('name').notNullable();
    table.boolean('is_completed').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('task_list_id');
    table.index('assignee_user_id');
    table.index('position');
  });

  await knex.schema.createTable('attachment', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('creator_user_id');
    table.text('type').notNullable();
    table.json('data').notNullable();
    table.text('name').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('card_id');
    table.index('creator_user_id');
  });

  await knex.schema.createTable('custom_field_group', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('board_id');
    table.bigInteger('card_id');
    table.bigInteger('base_custom_field_group_id');
    table.double('position').notNullable();
    table.text('name');
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('board_id');
    table.index('card_id');
    table.index('base_custom_field_group_id');
    table.index('position');
  });

  await knex.schema.createTable('custom_field', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('base_custom_field_group_id');
    table.bigInteger('custom_field_group_id');
    table.double('position').notNullable();
    table.text('name').notNullable();
    table.boolean('show_on_front_of_card').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('base_custom_field_group_id');
    table.index('custom_field_group_id');
    table.index('position');
  });

  await knex.schema.createTable('custom_field_value', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('custom_field_group_id').notNullable();
    table.bigInteger('custom_field_id').notNullable();
    table.text('content').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.unique(['card_id', 'custom_field_group_id', 'custom_field_id']);
    table.index('custom_field_group_id');
    table.index('custom_field_id');
  });

  await knex.schema.createTable('comment', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id');
    table.text('text').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('card_id');
    table.index('user_id');
  });

  await knex.schema.createTable('action', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id');
    table.text('type').notNullable();
    table.json('data').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('card_id');
    table.index('user_id');
  });

  await knex.schema.createTable('notification', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').notNullable();
    table.bigInteger('creator_user_id');
    table.bigInteger('board_id').notNullable();
    table.bigInteger('card_id').notNullable();
    table.bigInteger('comment_id');
    table.bigInteger('action_id');
    table.text('type').notNullable();
    table.json('data').notNullable();
    table.boolean('is_read').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('user_id');
    table.index('creator_user_id');
    table.index('card_id');
    table.index('comment_id');
    table.index('action_id');
    table.index('is_read');
  });

  return knex.schema.createTable('notification_service', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id');
    table.bigInteger('board_id');
    table.text('url').notNullable();
    table.text('format').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
    table.index('user_id');
    table.index('board_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('notification_service');
  await knex.schema.dropTableIfExists('notification');
  await knex.schema.dropTableIfExists('action');
  await knex.schema.dropTableIfExists('comment');
  await knex.schema.dropTableIfExists('custom_field_value');
  await knex.schema.dropTableIfExists('custom_field');
  await knex.schema.dropTableIfExists('custom_field_group');
  await knex.schema.dropTableIfExists('attachment');
  await knex.schema.dropTableIfExists('task');
  await knex.schema.dropTableIfExists('task_list');
  await knex.schema.dropTableIfExists('card_label');
  await knex.schema.dropTableIfExists('card_membership');
  await knex.schema.dropTableIfExists('card_subscription');
  await knex.schema.dropTableIfExists('card');
  await knex.schema.dropTableIfExists('list');
  await knex.schema.dropTableIfExists('label');
  await knex.schema.dropTableIfExists('board_membership');
  await knex.schema.dropTableIfExists('board_subscription');
  await knex.schema.dropTableIfExists('board');
  await knex.schema.dropTableIfExists('base_custom_field_group');
  await knex.schema.dropTableIfExists('background_image');
  await knex.schema.dropTableIfExists('project_manager');
  await knex.schema.dropTableIfExists('project_favorite');
  await knex.schema.dropTableIfExists('project');
  await knex.schema.dropTableIfExists('session');
  await knex.schema.dropTableIfExists('identity_provider_user');
  await knex.schema.dropTableIfExists('user_account');
  await knex.schema.dropTableIfExists('file_reference');
  return knex.schema.dropTableIfExists('_id_sequence');
};
