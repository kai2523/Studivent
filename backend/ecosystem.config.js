module.exports = {
  apps : [ {
    name: 'studivent-api',
    script: 'index.js',
    watch: '.',
    env_file: '.env',
      env_production: {
        NODE_ENV: 'production'
      }
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'yarn install --production && yarn prisma migrate deploy && yarn build && pm2 reload studivent-api --update-env && pm2 save',
      'pre-setup': ''
    }
  }
};
