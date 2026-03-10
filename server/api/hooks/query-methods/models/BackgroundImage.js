/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria) => BackgroundImage.find(criteria).sort('id');

/* Query methods */

const createOne = (values) =>
  sails.getDatastore().transaction(async (db) => {
    const backgroundImage = await BackgroundImage.create({ ...values })
      .fetch()
      .usingConnection(db);

    const queryResult = await sails
      .sendNativeQuery(
        'UPDATE uploaded_file SET references_total = references_total + 1, updated_at = ? WHERE id = ? AND references_total IS NOT NULL',
        [new Date().toISOString(), values.uploadedFileId],
      )
      .usingConnection(db);

    if (queryResult.rowCount === 0) {
      throw 'uploadedFileNotFound';
    }

    return backgroundImage;
  });

const getByIds = (ids) => defaultFind(ids);

const getByProjectId = (projectId) =>
  defaultFind({
    projectId,
  });

const getByProjectIds = (projectIds) =>
  defaultFind({
    projectId: projectIds,
  });

const getOneById = (id, { projectId } = {}) => {
  const criteria = {
    id,
  };

  if (projectId) {
    criteria.projectId = projectId;
  }

  return BackgroundImage.findOne(criteria);
};

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) =>
  sails.getDatastore().transaction(async (db) => {
    const backgroundImages = await BackgroundImage.destroy(criteria).fetch().usingConnection(db);

    let uploadedFiles = [];
    if (backgroundImages.length > 0) {
      const backgroundImagesByUploadedFileId = _.groupBy(backgroundImages, 'uploadedFileId');

      const uploadedFileIdsByTotal = Object.entries(backgroundImagesByUploadedFileId).reduce(
        (result, [uploadedFileId, backgroundImagesItem]) => ({
          ...result,
          [backgroundImagesItem.length]: [
            ...(result[backgroundImagesItem.length] || []),
            uploadedFileId,
          ],
        }),
        {},
      );

      const queryValues = [];
      let query = 'UPDATE uploaded_file SET references_total = CASE WHEN references_total = CASE ';

      Object.entries(uploadedFileIdsByTotal).forEach(([total, uploadedFileIds]) => {
        uploadedFileIds.forEach((id) => queryValues.push(id));
        query += `WHEN id IN (${uploadedFileIds.map(() => '?').join(', ')}) THEN ? `;
        queryValues.push(total);
      });

      query += 'END THEN NULL ELSE references_total - CASE ';

      Object.entries(uploadedFileIdsByTotal).forEach(([total, uploadedFileIds]) => {
        uploadedFileIds.forEach((id) => queryValues.push(id));
        query += `WHEN id IN (${uploadedFileIds.map(() => '?').join(', ')}) THEN ? `;
        queryValues.push(total);
      });

      const inValues = Object.keys(backgroundImagesByUploadedFileId);
      inValues.forEach((id) => queryValues.push(id));
      queryValues.push(new Date().toISOString());
      query += `END END, updated_at = ? WHERE id IN (${inValues.map(() => '?').join(', ')}) AND references_total IS NOT NULL`;

      await sails.sendNativeQuery(query, queryValues).usingConnection(db);

      if (inValues.length > 0) {
        const selPlaceholders = inValues.map(() => '?').join(', ');
        const selResult = await sails
          .sendNativeQuery(`SELECT * FROM uploaded_file WHERE id IN (${selPlaceholders})`, inValues)
          .usingConnection(db);
        uploadedFiles = selResult.rows.map((row) => UploadedFile.qm.transformRowToModel(row));
      }
    }

    return { backgroundImages, uploadedFiles };
  });

const deleteOne = (criteria) =>
  sails.getDatastore().transaction(async (db) => {
    const backgroundImage = await BackgroundImage.destroyOne(criteria).usingConnection(db);

    await sails
      .sendNativeQuery(
        'UPDATE uploaded_file SET references_total = CASE WHEN references_total > 1 THEN references_total - 1 END, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), backgroundImage.uploadedFileId],
      )
      .usingConnection(db);

    const sel = await sails
      .sendNativeQuery('SELECT * FROM uploaded_file WHERE id = ?', [backgroundImage.uploadedFileId])
      .usingConnection(db);
    const uploadedFile = UploadedFile.qm.transformRowToModel(sel.rows[0]);

    return { backgroundImage, uploadedFile };
  });

module.exports = {
  createOne,
  getByIds,
  getByProjectId,
  getByProjectIds,
  getOneById,
  deleteOne,
  delete: delete_,
};
