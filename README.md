
# Answering a [question on Strapi Forums](https://forum.strapi.io/t/how-to-configure-email-confirmation-redirection-url-dynamically/22671)

## TLDR;
Re-doing the *register* method with almost a copy-paste to be able to call your own *sendConfirmationEmail* method that can be (again) almost a copy-paste but getting the URL from the environment.


* *env.example* ➡️ has the CALLBACK_URL value. If you are using env file you can place it there. For dev purposes I also uploaded the VS Code's launch.json file where the environment variables can also be placed.

* *src/api/utils/services/email.js* ➡️ a new ***sendConfirmationService*** has been created. It's almost the same as the original one but uses **process.env.CALLBACK_URL** for the URL.

* *src/extensions/user-permissions/strapi.server.js* ➡️ a new ***register*** method overriding the original one. It's almost the same as the original one but calls **await strapi.service('api::utils.email').sendConfirmationEmail(sanitizedUser);**.


## 👇🏻 **Here some insights as to why I solved it that way** 

First, the method responsible for sending the email is the *sendConfirmationEmail* inside *@strapi/plugin-users-permissions/server/services/user*.
Inside that method you can (at least currently in Strapi version 4.4.3) find this code where you can see the URL being **almost** hardcoded:
```js
const apiPrefix = strapi.config.get('api.rest.prefix');
    settings.message = await userPermissionService.template(settings.message, {
      URL: urlJoin(getAbsoluteServerUrl(strapi.config), apiPrefix, '/auth/email-confirmation'),
      SERVER_URL: getAbsoluteServerUrl(strapi.config),
      ADMIN_URL: getAbsoluteAdminUrl(strapi.config),
      USER: sanitizedUserInfo,
      CODE: confirmationToken,
    });
```

So, my first thought would've been to override the whole *sendConfirmationEmail*  method following the [Plugins Extensions](https://docs.strapi.io/developer-docs/latest/development/plugins-extension.html#within-the-extensions-folder) documentation, but I've taken a look at what register method does in *@strapi/plugin-users-permissions/server/controllers/auth* and it gets the *sendConfirmationEmail* function on the fly, so even if overridden it will still call the original function:
```js
 if (settings.email_confirmation) {
      try {
        await getService('user').sendConfirmationEmail(sanitizedUser);
      } catch (err) {
        throw new ApplicationError(err.message);
      }

      return ctx.send({ user: sanitizedUser });
    }
```