#!/usr/bin/env node

var fs = require('fs');
var compile = require('./compile.js');

if (process.argv.length !== 5) {
  console.log("usage: z2g name address file");
  console.log("  name:    your name");
  console.log("  address: your email address");
  console.log("  file:    input file (Zimbra sieve export)");
  process.exit(1);
}

compile(fs.readFileSync(process.argv[4])).print(process.argv[2], process.argv[3]);
