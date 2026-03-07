/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    services: {
      type: 'json',
      required: true,
    },
    title: {
      type: 'string',
      required: true,
    },
    bodyByFormat: {
      type: 'json',
      required: true,
    },
  },

  async fn() {
    // External notification sending (Apprise) removed – no-op.
  },
};
