const { Client } = require('@elastic/elasticsearch');
const config = require('../config.js');

const client = new Client({
  node: config.elasticsearch.connStr,
  auth: {
    username: config.elasticsearch.username,
    password: config.elasticsearch.password
  }
});

module.exports = client;
