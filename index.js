"use strict";
const imageToAscii = require("image-to-ascii");
const obfuscateString = require("./obfuscate");

const fs = require("fs");

const sourceText = "Just JS!";
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
    size: { height: 40 }
  },
  (err, converted) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const passthroughChars = ["\n", "\r", " "];
    // figure out how many characters we have to work with
    let convertedCharCount = 0;
    for (let i = 0; i < converted.length; i++) {
      if (!passthroughChars.includes(converted[i])) {
        convertedCharCount++;
      }
    }

    // define a wrapper to keep the payload from being partially evaluated on
    // a newline
    const wrap = text => `[${text}][+[]]`;
    // measure the wrapper's length and use that to determine how much filler
    // we need to complete the provided image
    const wrapLength = wrap("").length;
    const fillLength = convertedCharCount - (convertedText.length + wrapLength);
    // generate full text by wrapping our payload and filler
    const fullText = wrap(convertedText + fillSeq(fillLength, 0));

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

    // combine the resulting character array and we're done!
    console.log(result.join(""));
  }
);
