module.exports = {
  apps : [{
    name   : "bot",
    script : "dist/index.js",
    // instances: "max",
    cron_restart: '0 4 * * *',
  }]
}
