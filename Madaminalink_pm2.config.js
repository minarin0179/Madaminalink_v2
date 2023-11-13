module.exports = {
  apps : [{
    name   : "Madaminalink",
    script : "dist/index.js",
    instances: "max",
    cron_restart: '0 4 * * *',
  }]
}
