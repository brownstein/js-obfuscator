"use strict";
const fs = require("fs");
const imageToAscii = require("image-to-ascii");
const obfuscateStringWithoutWrap = require("./obfuscate-string");
const fillSeq = require("./fill");

const sourceText = "Just JS!";
const convertedText = obfuscateString(sourceText);

/**
 * Obfuscates a given string and applies optional padding to the end to reach
 * a target string length
 */
function obfuscateString(sourceText, targetLength = 0, bind = "_") {
  // convert the text to gibberish
  const convertedText = obfuscateStringWithoutWrap(sourceText, bind);

  // define a wrapper to keep the payload from being partially evaluated on
  // a newline
  const wrap = text => `[${text}][+[]]`;

  // do the math to see how much filler we need to hit targetLength
  const wrapLength = wrap("").length;
  const fillLength = targetLength - (convertedText.length + wrapLength);

  // return the wrapped text
  return wrap(convertedText + fillSeq(fillLength, 0));
}

/**
 * Given a specified source string, and a PNG path (or buffer), call cb with
 * the resulting executable ASCII art
 */
function obfuscateToAscii(sourceText, pngFilenameOrBuffer, height, cb) {
  imageToAscii(
    pngFilenameOrBuffer,
    {
      colored: false,
      pixels: " *",
      size: { height }
    },
    (err, converted) => {
      if (err) {
        cb(err, null);
        return;
      }

      // figure out how many characters we have to work with
      const passthroughChars = ["\n", "\r", " "];
      let convertedCharCount = 0;
      for (let i = 0; i < converted.length; i++) {
        if (!passthroughChars.includes(converted[i])) {
          convertedCharCount++;
        }
      }

      // get the obfuscated text to fill them
      const fullText = obfuscateString(sourceText, convertedCharCount);

      // fill the image with that text
      // fill the image with the generated text
      const result = [];
      let cIndex = 0;
      let tIndex = 0;
      while (cIndex < converted.length) {
        const nextChar = converted[cIndex++];
        if (passthroughChars.includes(nextChar)) {
          result.push(nextChar);
        }
        else {
          if (tIndex < fullText.length) {
            result.push(fullText[tIndex++]);
          }
          else {
            break;
          }
        }
      }

      // add anything left remaining to the end
      while (tIndex < fullText.length) {
        result.push(fullText[tIndex++]);
      }

      cb(null, result.join(""));
    }
  );
}

module.exports = {
  obfuscateToAscii,
  obfuscateString
};
