var config = {
  "appName":       "Platform",
  "port":          process.env.PORT || 3000,
  "sslPort":        process.env.SSLPORT || 8443,
  "sslKey":        "./keys/key.pem", // Self-signed are fine in dev
  "sslCert":       "./keys/cert.pem",
  "scope":         "read_orders,read_products",
  "sessionSecret": "keyboard cat",
}

module.exports = config;
