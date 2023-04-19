module.exports = {
  apps : [{
    name   : "Madaminalink",
    script : "./src/bot.ts",
    cron_restart: '0 4 * * *',
  }]
}
