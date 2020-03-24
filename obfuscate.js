function _obfuscateDigit (n) {
  if (n === 0) {
    return "+[]";
  }
  let chain = "";
  for (let i = 0; i < n; i++) {
    chain += "+!+[]";
  }
  return chain;
}

function _obfuscateNumber (n, skipWrap = false) {
  if (n === 0) {
    return "+[]";
  }
  const digits = `${n}`.split("");
  if (digits.length === 1) {
    return _obfuscateDigit(n);
  }
  let chain = "+[";
  let isFirstDigit = true;
  digits.forEach(d => {
    if (!isFirstDigit) {
      chain += "+[";
    }
    chain += _obfuscateDigit(Number(d));
    if (!isFirstDigit) {
      chain += "]";
    }
    isFirstDigit = false;
  });
  chain = chain + "]";
  return chain;
}

function _wrapAndIndexInto (logic, index) {
  return `(${logic}+[])[${_obfuscateNumber(index)}]`;
}

function _createEncoderState () {
  return {
    sequences: [
      { result: "true",      logic: "!![]" },
      { result: "false",     logic: "![]" },
      { result: "undefined", logic: "[][[]]" }
    ],
    bindLookupsTo: "_",
    lookupsBound: false,
    charCodeBoundto: null
  };
}

function _obfuscateSimpleCharacter (state, character) {
  for (let si = 0; si < state.sequences.length; si++) {
    const { result, logic } = state.sequences[si];
    const index = result.indexOf(character);
    if (index !== -1) {
      return _wrapAndIndexInto(logic, index);
    }
  }
  return false;
}

function _obfuscateSimpleString (state, s) {
  return s.split("").map(c => _obfuscateSimpleCharacter(state, c)).join("+");
}

function _setupLookupMechanism (state) {
  if (state.lookupsBound) {
    return;
  }
  let result = `${state.bindLookupsTo}=[]`;

  const bindFillTo = `${state.bindLookupsTo}[${_obfuscateNumber(0)}]`;
  let fillLogic = _obfuscateSimpleString(state, "fill");
  fillLogic = `[][${fillLogic}]`
  result += `,${bindFillTo}=${fillLogic}`;
  state.sequences.push({
    result: "function fill() { [native code] }",
    logic: bindFillTo
  });

  const bindConstructorTo = `${state.bindLookupsTo}[${_obfuscateNumber(1)}]`;
  const constructorLogic = _obfuscateSimpleString(state, "constructor");
  result += `,${bindConstructorTo}=${constructorLogic}`;
  state.sequences.push({
    result: "constructor",
    logic: bindConstructorTo
  });

  const bindStringTo = `${state.bindLookupsTo}[${_obfuscateNumber(2)}]`;
  const stringLogic = `([]+[])[${bindConstructorTo}]`;
  result += `,${bindStringTo}=${stringLogic}`;
  state.sequences.push({
    result: "function String() { [native code] }",
    logic: bindStringTo
  });

  const bindNumberTo = `${state.bindLookupsTo}[${_obfuscateNumber(3)}]`;
  const numberLogic = `(+[])[${bindConstructorTo}]`;
  result += `,${bindNumberTo}=${numberLogic}`;
  state.sequences.push({
    result: "function Number() { [native code] }",
    logic: bindNumberTo
  });

  const toLogic = _obfuscateSimpleString(state, "to");
  const nameLogic = _obfuscateSimpleString(state, "name");
  const stringNameLogic = `${bindStringTo}[${nameLogic}]`;

  const bindToStringTo = `${state.bindLookupsTo}[${_obfuscateNumber(4)}]`;
  const toStringLogic = `${toLogic}+${stringNameLogic}`;
  result += `,${bindToStringTo}=${toStringLogic}`;

  const pLogic = `(${_obfuscateNumber(211)})[${toLogic}+${stringNameLogic}](${_obfuscateNumber(31)})[${_obfuscateNumber(1)}]`;
  const escapeLogic = _obfuscateSimpleString(state, "esca") + "+" + pLogic + "+" + _obfuscateSimpleString(state, "e");

  const bindCapitalCTo = `${state.bindLookupsTo}[${_obfuscateNumber(6)}]`;
  const functionLogic = `${bindFillTo}[${bindConstructorTo}]`;
  const capitalCLogic = `${functionLogic}(${_obfuscateSimpleString(state, "return ")}+${escapeLogic})()(([]+[])[${_obfuscateSimpleString(state, "italics")}]())[${_obfuscateNumber(2)}]`;
  result += `,${bindCapitalCTo}=${capitalCLogic}`;
  state.sequences.push({
    result: "C",
    logic: bindCapitalCTo
  });

  const bindFromCharCodeTo = `${state.bindLookupsTo}[${_obfuscateNumber(10)}]`;
  const hLogic = `(${_obfuscateNumber(101)})[${toLogic}+${stringNameLogic}](${_obfuscateNumber(21)})[${_obfuscateNumber(1)}]`;
  const fromCharCodeLogic = `${bindStringTo}[${_obfuscateSimpleString(state, "fromC")}+${hLogic}+${_obfuscateSimpleString(state, "arCode")}]`;
  result += `,${bindFromCharCodeTo}=${fromCharCodeLogic}`;
  result += ",[]";

  result = `[${result}][${_obfuscateNumber(8)}]`;

  state.lookupsBound = true;
  state.charCodeBoundTo = bindFromCharCodeTo;

  return result;
}

function _obfuscateCharacter (state, character) {
  let result;
  if (result = _obfuscateSimpleCharacter(state, character)) {
    return result;
  }
  const setupString = _setupLookupMechanism(state);
  result = `${setupString ? `${setupString}+` : ""}${state.charCodeBoundTo}(${_obfuscateNumber(character.charCodeAt(0))})`;
  return result;
}

function obfuscateString (str) {
  const state = _createEncoderState();
  const result = str.split("").map(c => _obfuscateCharacter(state, c)).join("+");
  return `[]+[${result}]`;
}

module.exports = obfuscateString;
