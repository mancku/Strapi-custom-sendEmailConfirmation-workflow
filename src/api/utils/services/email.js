const crypto = require('crypto');
const urlJoin = require('url-join');

const { getAbsoluteAdminUrl, getAbsoluteServerUrl, sanitize } = require('@strapi/utils');
const { getService } = require('@strapi/plugin-users-permissions/server/utils');

module.exports = {
  async sendConfirmationEmail(user) {
    const userPermissionService = getService('users-permissions');
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
    const userSchema = strapi.getModel('plugin::users-permissions.user');

    const settings = await pluginStore
      .get({ key: 'email' })
      .then((storeEmail) => storeEmail.email_confirmation.options);

    // Sanitize the template's user information
    const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);

    const confirmationToken = crypto.randomBytes(20).toString('hex');

    await strapi.entityService.update('plugin::users-permissions.user', user.id, {
      data: { confirmationToken },
      populate: ['role'],
    });

    settings.message = await userPermissionService.template(settings.message, {
      URL: process.env.CALLBACK_URL,
      SERVER_URL: getAbsoluteServerUrl(strapi.config),
      ADMIN_URL: getAbsoluteAdminUrl(strapi.config),
      USER: sanitizedUserInfo,
      CODE: confirmationToken,
    });

    settings.object = await userPermissionService.template(settings.object, {
      USER: sanitizedUserInfo,
    });

    // Send an email to the user.
    await strapi
      .plugin('email')
      .service('email')
      .send({
        to: user.email,
        from:
          settings.from.email && settings.from.name
            ? `${settings.from.name} <${settings.from.email}>`
            : undefined,
        replyTo: settings.response_email,
        subject: settings.object,
        text: settings.message,
        html: settings.message,
      });
  }
}
