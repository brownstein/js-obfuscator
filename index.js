"use strict";
const imageToAscii = require("image-to-ascii");
const obfuscateString = require("./obfuscate");

const fs = require("fs");

const sourceText = "This is just a string! Type coersion is great.";
const convertedText = obfuscateString(sourceText);

imageToAscii(
  "js-logo.png", {
    colored: false,
    pixels: " *",
    size: { height: 40 }
  },
  (err, converted) => {

    if (err) {
      console.error(err);
      process.exit(1);
    }

    let iIndex = 0;
    let ctIndex = 0;
    let postfixIndex = 0;
    let postfixChars = "||[]";
    const result = [];
    while (ctIndex < converted.length) {
      const nextChar = converted[ctIndex];
      switch(nextChar) {
        case "\n":
        case "\r":
        case "\s":
        case " ":
          result.push(nextChar);
          break;
        default:
          if (iIndex < convertedText.length) {
            result.push(convertedText[iIndex++]);
          }
          else {
            result.push(postfixChars[postfixIndex++ % postfixChars.length]);
          }
          break;
      }
      ctIndex++;
    }
    while (iIndex < convertedText.length) {
      result.push(convertedText[iIndex++]);
    }
    console.log(result.join(""));
  }
);
