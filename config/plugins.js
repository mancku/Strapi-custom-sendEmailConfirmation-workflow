module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'sendmail',
      settings: {
        defaultFrom: 'myemail@protonmail.com',
        defaultReplyTo: 'myemail@protonmail.com',
      },
      providerOptions: {
        smtpPort: 2525, // Default: 25
        smtpHost: 'localhost' // Default: -1 - extra smtp host after resolveMX
      }
    },
  },
});
