/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { makeRowToModelTransformer } = require('../helpers');

const transformRowToModel = makeRowToModelTransformer(InternalConfig);

/* Query methods */

const getOneMain = () => InternalConfig.findOne(InternalConfig.MAIN_ID);

const updateOneMain = (values) =>
  sails.getDatastore().transaction(async (db) => {
    const queryResult = await sails
      .sendNativeQuery(
        'SELECT active_users_limit FROM internal_config WHERE id = ? LIMIT 1 FOR UPDATE',
        [InternalConfig.MAIN_ID],
      )
      .usingConnection(db);

    const prev = transformRowToModel(queryResult.rows[0]);

    const internalConfig = await InternalConfig.updateOne(InternalConfig.MAIN_ID)
      .set({ ...values })
      .usingConnection(db);

    let deactivatedUserIds;
    if (
      _.isInteger(internalConfig.activeUsersLimit) &&
      (prev.activeUsersLimit === null || internalConfig.activeUsersLimit < prev.activeUsersLimit)
    ) {
      const { defaultAdminEmail } = sails.config.custom;

      const selectQuery = `
        SELECT id FROM user_account
        WHERE is_deactivated = false
        ORDER BY
          CASE ${defaultAdminEmail ? 'WHEN email = ? THEN 0 WHEN role = ? THEN 1' : 'WHEN role = ? THEN 0'} ELSE ${defaultAdminEmail ? '2' : '1'} END,
          id
        LIMIT 18446744073709551615 OFFSET ?
      `;
      const selectValues = defaultAdminEmail
        ? [defaultAdminEmail, User.Roles.ADMIN, internalConfig.activeUsersLimit]
        : [User.Roles.ADMIN, internalConfig.activeUsersLimit];

      const selResult = await sails.sendNativeQuery(selectQuery, selectValues).usingConnection(db);
      deactivatedUserIds = selResult.rows.map((row) => row.id);

      if (deactivatedUserIds.length > 0) {
        const placeholders = deactivatedUserIds.map(() => '?').join(', ');
        await sails
          .sendNativeQuery(
            `UPDATE user_account SET is_deactivated = true WHERE id IN (${placeholders})`,
            deactivatedUserIds,
          )
          .usingConnection(db);
      }
    }

    return { internalConfig, deactivatedUserIds, prev };
  });

module.exports = {
  getOneMain,
  updateOneMain,
};
