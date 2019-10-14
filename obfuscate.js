function _obfuscateNumber (n, skipWrap = false) {
  if (n === 0) {
    return "+[]";
  }
  let chain = "";
  let remaining = n;
  while (remaining >= (3**3**2)) {
    chain += "+((-~[]-~[]-~[])**(-~[]-~[]-~[])**(-~[]-~[]))";
    remaining -= 3**3**2;
  }
  while (remaining >= (3**2**3)) {
    chain += "+((-~[]-~[]-~[])**(-~[]-~[])**(-~[]-~[]-~[]))";
    remaining -= 3**2**3;
  }
  while (remaining >= (6**6)) {
    chain += "+((-~[]-~[]-~[]-~[]-~[]-~[])**(-~[]-~[]-~[]-~[]-~[]-~[]))";
    remaining -= 6**6;
  }
  while (remaining >= (5**5)) {
    chain += "+((-~[]-~[]-~[]-~[]-~[])**(-~[]-~[]-~[]-~[]-~[]))";
    remaining -= 5**5;
  }
  while (remaining >= (3**4)) {
    chain += "+((-~[]-~[]-~[])**(-~[]-~[]-~[]-~[]))";
    remaining -= 3**4;
  }
  while (remaining >= (2**5)) {
    chain += "+((-~[]-~[])**(-~[]-~[]-~[]-~[]-~[]))";
    remaining -= 2**5;
  }
  while (remaining >= (2**4)) {
    chain += "+((-~[]-~[])**(-~[]-~[]-~[]-~[]))";
    remaining -= 2**4;
  }
  while (remaining >= (2**3)) {
    chain += "+((-~[]-~[])**(-~[]-~[]-~[]))";
    remaining -= 2**3;
  }
  while (remaining > 0) {
    chain += "-~[]";
    remaining--;
  }
  return chain;
}
function _wrapAndIndexInto (logic, index) {
  return `[${logic}+[]][+[]][${_obfuscateNumber(index)}]`;
}
function _defaultCharacterHacks () {
  return [
    { result: "true",            logic: "!![]" },
    { result: "false",           logic: "![]" },
    { result: "undefined",       logic: "[][[]]" },
    { result: "[object Object]", logic: "{}" },
    { result: ",",               logic: "[[],[]]" },
    { result: "function Array() { [native code] }",
      logic: "[][[{}+[]][+[]][-~[]-~[]-~[]-~[]-~[]]+[{}+[]][+[]][-~[]]+[[][[]]+[]][+[]][-~[]]+[![]+[]][+[]][-~[]-~[]-~[]]+[!![]+[]][+[]][+[]]+[!![]+[]][+[]][-~[]]+[!![]+[]][+[]][-~[]-~[]]+[{}+[]][+[]][-~[]-~[]-~[]-~[]-~[]]+[!![]+[]][+[]][+[]]+[{}+[]][+[]][-~[]]+[!![]+[]][+[]][-~[]]]"
    },
    { result: "function Number() { [native code] }",
      logic: "[+[]][-[]][[{}+[]][+[]][-~[]-~[]-~[]-~[]-~[]]+[{}+[]][+[]][-~[]]+[[][[]]+[]][+[]][-~[]]+[![]+[]][+[]][-~[]-~[]-~[]]+[!![]+[]][+[]][+[]]+[!![]+[]][+[]][-~[]]+[!![]+[]][+[]][-~[]-~[]]+[{}+[]][+[]][-~[]-~[]-~[]-~[]-~[]]+[!![]+[]][+[]][+[]]+[{}+[]][+[]][-~[]]+[!![]+[]][+[]][-~[]]]"
    }
  ];
}
function _obfuscateCharacter (c, state) {
  const { charSources } = state;
  for (let si = 0; si < charSources.length; si++) {
    const { result, logic } = charSources[si];
    const index = result.indexOf(c);
    if (index !== -1) {
      return _wrapAndIndexInto(logic, index);
    }
  }
  if (!isNaN(parseInt(c))) {
    return `[${_obfuscateNumber(parseInt(c))}][+[]]`;
  }
  // if we hit this point, it is time to alias String.fromCharCode
  let fixChLambdaResult = null;
  if (!state.charCodeLambdaBoundToSymbol) {
    var result = "[";
    if (!state.chLambdaBoundToSymbol) {
      const chLambdaSequence = {
        result: `C=>h`,
        logic: state.nextSymbolToBind
      };
      charSources.push(chLambdaSequence);
      fixChLambdaResult = chLambdaSequence;
      state.chLambdaBoundToSymbol = state.nextSymbolToBind;
      result += `[${chLambdaSequence.logic}=${chLambdaSequence.result}]&&`;
    }
    const constructorStr = "constructor";
    const fromCharCodeStr = "fromCharCode";
    result += `[${state.nextSymbolToBind}=[[]+[]][+[]][`;
    for (let ci = 0; ci < constructorStr.length; ci++) {
      result += _obfuscateCharacter(constructorStr[ci], state) + "+";
    }
    result += "[]][";
    for (let ci = 0; ci < fromCharCodeStr.length; ci++) {
      result += _obfuscateCharacter(fromCharCodeStr[ci], state) + "+";
    }
    result += "[]]";
    state.charCodeLambdaBoundToSymbol = state.nextSymbolToBind;
    state.nextSymbolToBind += "_";
    result += `][+[]](${_obfuscateNumber(c.charCodeAt(0))})][+[]]`;
    if (fixChLambdaResult) {
      fixChLambdaResult.result = "function";
    }
    return result;
  }
  return state.charCodeLambdaBoundToSymbol +
    `(${_obfuscateNumber(c.charCodeAt(0))})`;
}
function obfuscateString (str, extraStrings = [], bindFunctionsToSymbol="_") {
  const parts = [];
  const state = {
    charSources: _defaultCharacterHacks().concat(extraStrings.map(result => ({
      result, logic: `"${result}"`
    }))),
    nextSymbolToBind: bindFunctionsToSymbol,
    chLambdaBoundToSymbol: null,
    charCodeLambdaBoundToSymbol: null
  };
  for (let c = 0; c < str.length; c++) {
    parts.push(_obfuscateCharacter(str[c], state));
  }
  return parts.join("+");
}

module.exports = obfuscateString;
