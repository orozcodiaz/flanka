/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { makeRowToModelTransformer } = require('../helpers');

const transformRowToModel = makeRowToModelTransformer(CustomFieldValue);

const defaultFind = (criteria, { customFieldGroupIdOrIds } = {}) => {
  if (customFieldGroupIdOrIds) {
    criteria.customFieldGroupId = customFieldGroupIdOrIds; // eslint-disable-line no-param-reassign
  }

  return CustomFieldValue.find(criteria).sort('id');
};

/* Query methods */

const create = (arrayOfValues) => CustomFieldValue.createEach(arrayOfValues).fetch();

const createOrUpdateOne = async (values) => {
  const now = new Date().toISOString();
  const query = `
    INSERT INTO custom_field_value (card_id, custom_field_group_id, custom_field_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = VALUES(created_at)
  `;

  await sails.sendNativeQuery(query, [
    values.cardId,
    values.customFieldGroupId,
    values.customFieldId,
    values.content,
    now,
  ]);

  const selResult = await sails.sendNativeQuery(
    'SELECT * FROM custom_field_value WHERE card_id = ? AND custom_field_group_id = ? AND custom_field_id = ? LIMIT 1',
    [values.cardId, values.customFieldGroupId, values.customFieldId],
  );

  return transformRowToModel(selResult.rows[0]);
};

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId, { customFieldGroupIdOrIds } = {}) =>
  defaultFind(
    {
      cardId,
    },
    { customFieldGroupIdOrIds },
  );

const getByCardIds = (cardIds, { customFieldGroupIdOrIds } = {}) =>
  defaultFind(
    {
      cardId: cardIds,
    },
    { customFieldGroupIdOrIds },
  );

const getByCustomFieldGroupId = (customFieldGroupId) =>
  defaultFind({
    customFieldGroupId,
  });

const getOneByCardIdAndCustomFieldGroupIdAndCustomFieldId = (
  cardId,
  customFieldGroupId,
  customFieldId,
) =>
  CustomFieldValue.findOne({
    cardId,
    customFieldGroupId,
    customFieldId,
  });

const updateOne = (criteria, values) => CustomFieldValue.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CustomFieldValue.destroy(criteria).fetch();

const deleteOne = (criteria) => CustomFieldValue.destroyOne(criteria);

module.exports = {
  create,
  createOrUpdateOne,
  getByIds,
  getByCardId,
  getByCardIds,
  getByCustomFieldGroupId,
  getOneByCardIdAndCustomFieldGroupIdAndCustomFieldId,
  updateOne,
  deleteOne,
  delete: delete_,
};
