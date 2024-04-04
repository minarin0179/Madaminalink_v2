module.exports = {
  apps : [{
    name   : "bot",
    // script : "dist/index.js",
    script : "src/index.ts",
    interpreter: "/usr/local/bin/bun",
    // instances: "max",
    cron_restart: '0 4 * * *',
  }]
}
