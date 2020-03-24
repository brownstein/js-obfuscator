"use strict";
const imageToAscii = require("image-to-ascii");
const obfuscateString = require("./obfuscate");

const fs = require("fs");

const sourceText = "RB worked here";
const convertedText = obfuscateString(sourceText);

const fillOptions = [
  "+[]",
  "+[[]]",
  "+[[[]]]",
];

function fillSeq(numChars, o) {
  if (numChars <= 0) {
    return "";
  }
  let bestFit = "";
  let bestFitCost = numChars;
  for (let i = 0; i < fillOptions.length; i++) {
    const fillOption = fillOptions[(i + o) % fillOptions.length];
    const fill = fillOption + fillSeq(numChars - fillOption.length, o + 1);
    if (fill.length == numChars) {
      return fill;
    }
    if (fill.length > numChars) {
      continue;
    }
    const cost = numChars - fill.length;
    if (cost < bestFitCost) {
      bestFitCost = cost;
      bestFit = fill;
    }
  }
  return bestFit;
}

imageToAscii(
  "js-logo.png", {
    colored: false,
    pixels: " *",
    size: { height: 42 }
  },
  (err, converted) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    const result = [];
    const passthroughChars = ["\n", "\r", " "];
    let cIndex = 0;
    let ctIndex = 0;
    let fsIndex = -1;
    while (cIndex < converted.length) {
      const nextChar = converted[cIndex++];
      if (passthroughChars.includes(nextChar)) {
        result.push(nextChar);
      }
      else {
        if (ctIndex < convertedText.length) {
          result.push(convertedText[ctIndex++]);
        }
        else {
          fsIndex = cIndex - 1;
          break;
        }
      }
    }
    if (fsIndex != -1) {
      let fillCharCount = 0;
      let fIndex = fsIndex;
      while (fIndex < converted.length) {
        const nextChar = converted[fIndex++];
        if (!passthroughChars.includes(nextChar)) {
          fillCharCount++;
        }
      }
      const filler = fillSeq(fillCharCount, 0);
      fIndex = 0;
      while (fsIndex < converted.length) {
        const nextChar = converted[fsIndex++];
        if (passthroughChars.includes(nextChar)) {
          result.push(nextChar);
        }
        else {
          result.push(filler[fIndex++]);
        }
      }
    }
    while (ctIndex < convertedText.length) {
      result.push(convertedText[ctIndex++]);
    }

    console.log(result.join(""));
  }
);
