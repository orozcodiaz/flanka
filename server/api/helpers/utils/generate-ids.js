/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    total: {
      type: 'number',
      required: true,
    },
  },

  async fn(inputs) {
    const { total } = inputs;
    if (total <= 0) {
      return [];
    }

    const placeholders = Array(total).fill('()').join(', ');
    await sails.sendNativeQuery(`INSERT INTO _id_sequence () VALUES ${placeholders}`);

    const result = await sails.sendNativeQuery('SELECT LAST_INSERT_ID() AS first_id');
    const firstId = Number(result.rows[0].first_id);
    const ids = Array.from({ length: total }, (_, i) => firstId + i);

    return sails.helpers.utils.mapRecords(ids.map((id) => ({ id })));
  },
};
