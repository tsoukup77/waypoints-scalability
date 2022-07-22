module.exports = {
  apps: [
    {
      name: "waypoints",
      script: "index.js",
      watch: ".",
      exec_mode: "cluster",
      instances: 1,
      env: {
        UV_THREADPOOL_SIZE: 16,
      },
    },
  ],

  deploy: {
    dev: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/master",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "pre-deploy-local": "",
      "post-deploy": "npm install && pm2 reload waypoints.config.js --env dev",
      "pre-setup": "",
    },
  },
};
