var concatMap = require('concat-map');
var zimbra = require('./zimbra.js');
var gmail = require('./gmail.js');

function compile(src) {
  return compileRules(zimbra(src));
}

function compileRules(rules) {
  return new gmail.RuleSet(concatMap(rules, compileRule));
}

function compileRule(rule) {
  if (rule.type === 'anyof')
    return compileOr(rule.conditions, rule.action);
  if (rule.type === 'allof')
    return compileAnd(rule.conditions, rule.action);
  throw new SyntaxError("unknown rule type: '" + rule.type + "'");
}

function splitConditions(conditions) {
  return {
    froms: conditions.filter(function(c) {
      return c.condition === 'from';
    }).map(function(c) {
      return c.value;
    }),

    tos: conditions.filter(function(c) {
      return c.condition === 'to';
    }).map(function(c) {
      return c.value;
    }),

    subjects: conditions.filter(function(c) {
      return c.condition === 'subject';
    }).map(function(c) {
      return c.value;
    }),

    bodies: conditions.filter(function(c) {
      return c.condition === 'body';
    }).map(function(c) {
      return c.value;
    })
  };
}

function compileOr(conditions, action) {
  var split = splitConditions(conditions);
  var rules = [];
  if (split.froms.length > 0)
    rules.push(new gmail.Rule([new gmail.FromProperty(split.froms)], action));
  if (split.tos.length > 0)
    rules.push(new gmail.Rule([new gmail.ToProperty(split.tos)], action));
  if (split.bodies.length > 0)
    rules.push(new gmail.Rule([new gmail.BodyProperty(split.bodies)], action));
  return rules.concat(split.subjects.map(function(subject) {
    return new gmail.Rule([new gmail.SubjectProperty(subject)], action);
  }));
}

function compileAnd(conditions, action) {
  var split = splitConditions(conditions);
  if (split.subjects.length === 0) {
    var props = [];
    if (split.froms.length > 0)
      props.push(new gmail.FromProperty(split.froms));
    if (split.tos.length > 0)
      props.push(new gmail.ToProperty(split.tos));
    if (split.bodies.length > 0)
      props.push(new gmail.BodyProperty(split.bodies));
    return [new gmail.Rule(props, action)];
  } else {
    return split.subjects.map(function(subject) {
      var props = [];
      if (split.froms.length > 0)
        props.push(new gmail.FromProperty(split.froms));
      if (split.tos.length > 0)
        props.push(new gmail.ToProperty(split.tos));
      // FIXME: if we have both body and subject they should be merged into hasWords
      if (split.bodies.length > 0)
        props.push(new gmail.BodyProperty(split.bodies));
      props.push(new gmail.SubjectProperty(subject));
      return new gmail.Rule(props, action);
    });
  }
}

module.exports = compile;
