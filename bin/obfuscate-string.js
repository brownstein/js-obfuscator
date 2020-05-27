#!/usr/bin/env node
const { obfuscateToAscii } = require("../lib");

const sourceText = process.argv[process.argv.length - 2];
const sourceImage = process.argv[process.argv.length - 1];
obfuscateToAscii(sourceText, sourceImage, 40, (err, result) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(result);
  process.exit(0);
});
