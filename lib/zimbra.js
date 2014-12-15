var concatMap = require('concat-map');
var sieve = require('./sieve.js');

function processScript(src) {
  return concatMap(sieve.parse(src), processRule);
}

function processRule(raw) {
  return raw.command !== 'if'
       ? []
       : [processIfRule(raw.args.test, raw.body)];
}

function processIfRule(rawCondition, rawAction) {
  return {
    type: rawCondition.test, // 'anyof' or 'allof'
    conditions: concatMap(rawCondition.args.testlist, processCondition),
    action: processAction(rawAction)
  };
}

function processCondition(raw) {
  if (raw.test === 'address')
    return processAddressCondition(raw.args.arglist);
  else if (raw.test === 'header')
    return processHeaderCondition(raw.args.arglist);
  else if (raw.test === 'body')
    return processBodyCondition(raw.args.arglist);
  else
    throw new SyntaxError("unrecognized condition test: " + raw.test);
}

function processStringLiteral(raw) {
  return raw.substring(1, raw.length - 1);
}

function downcase(s) {
  return s.toLowerCase();
}

function splitHeaders(headers, value, test, comparator) {
  var hasFrom = headers.indexOf("from") > -1;

  var to = headers.filter(function(header) {
    return ["to","cc"].indexOf(header) > -1;
  });

  var hasSubject = headers.indexOf("subject") > -1;

  var other = headers.filter(function(header) {
    return ["to","cc","subject","from"].indexOf(header) === -1;
  });

  var result = [];

  if (hasFrom) {
    result.push({
      condition: 'from',
      value: value,
      test: test,
      comparator: comparator
    });
  }

  if (to.length > 0) {
    result.push({
      condition: 'to',
      value: value,
      test: test,
      comparator: comparator,
      headers: to
    });
  }

  if (hasSubject) {
    result.push({
      condition: 'subject',
      value: value,
      test: test,
      comparator: comparator
    });
  }

  if (other.length > 0) {
    result.push({
      condition: 'ignored',
      value: value,
      test: test,
      comparator: comparator,
      headers: other
    });
  }

  return result;
}

function processAddressCondition(raw) {
  var test = raw[1].value.substring(1); // :contains, :is, :matches
  var comparator = processStringLiteral(raw[3].value);
  var headers = raw[4].value.map(processStringLiteral)
                            .map(downcase);
  var value = processStringLiteral(raw[5].value);

  return splitHeaders(headers, value, test, comparator);
}

function processHeaderCondition(raw) {
  var test = raw[0].value.substring(1); // :contains, :is, :matches
  var headers = raw[1].value.map(processStringLiteral)
                            .map(downcase);
  var value = processStringLiteral(raw[2].value);

  return splitHeaders(headers, value, test, null);
}

function processBodyCondition(raw) {
  var test = raw[0].value.substring(1); // :contains, :is, :matches
  var value = processStringLiteral(raw[1].value);
  return [{
    condition: 'body',
    value: value,
    test: test
  }];
}

function processAction(raw) {
  var tags = raw.block.filter(function(action) {
    return action.command === 'fileinto' || action.command === 'tag';
  }).map(function(action) {
    return processStringLiteral(action.args.arglist[0].value);
  });

  var markRead = raw.block.filter(function(action) {
    return action.command === 'flag' && processStringLiteral(action.args.arglist[0].value) === 'read';
  }).length > 0;

  var markFlagged = raw.block.filter(function(action) {
    return action.command === 'flag' && processStringLiteral(action.args.arglist[0].value) === 'flagged';
  }).length > 0;

  var shouldTrash = raw.block.filter(function(action) {
    return action.command === 'discard';
  }).length > 0;

  return {
    tags: tags,
    read: markRead,
    flagged: markFlagged,
    trash: shouldTrash
  };
}

module.exports = processScript;
