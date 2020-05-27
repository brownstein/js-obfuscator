// options for use as filler
const fillOptions = [
  "+[]",
  "+[[]]",
  "+[[[]]]",
];

/**
 * Fills a given number of characters with array brackets that evaluate to
 * an empty string when added to the previous input - used for padding
 */
module.exports = function fillSeq(numChars, o) {
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
