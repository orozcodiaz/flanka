/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = (knex) =>
  knex.raw(`
    ALTER TABLE card RENAME INDEX card_name_index TO card_name_gin_index;
    ALTER TABLE card RENAME INDEX card_description_index TO card_description_gin_index;
  `);

module.exports.down = (knex) =>
  knex.raw(`
    ALTER TABLE card RENAME INDEX card_name_gin_index TO card_name_index;
    ALTER TABLE card RENAME INDEX card_description_gin_index TO card_description_index;
  `);
