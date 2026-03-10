/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('action', (table) => {
    /* Columns */

    table.bigInteger('board_id');

    /* Indexes */

    table.index('board_id');
  });

  return knex.raw(`
    UPDATE action
    INNER JOIN card ON action.card_id = card.id
    SET
      action.board_id = card.board_id,
      action.data = JSON_SET(COALESCE(action.data, '{}'), '$.card', JSON_OBJECT('name', card.name))
  `);
};

exports.down = (knex) =>
  knex.schema.table('action', (table) => {
    table.dropColumn('board_id');
  });
