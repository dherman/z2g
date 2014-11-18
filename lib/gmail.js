var moment = require('moment');
var escapeXML = require('xml-escape');

function RuleSet(rules) {
  this._rules = rules;
}

var RSp = RuleSet.prototype;

RSp.print = function print(name, email) {
  var updated = moment().toISOString();
  console.log("<?xml version='1.0' encoding='UTF-8'?>");
  console.log("<feed xmlns='http://www.w3.org/2005/Atom' xmlns:apps='http://schemas.google.com/apps/2006'>");
  console.log("<title>Mail Filters</title>");
  console.log("<updated>" + updated + "</updated>");
  console.log("<author>");
  console.log("  <name>" + name + "</name>");
  console.log("  <email>" + email + "</email>");
  console.log("</author>");
  this._rules.forEach(function(rule) {
    rule.print(updated);
  });
  console.log("</feed>");
};

function Rule(properties, label) {
  if (!Array.isArray(properties))
    throw new TypeError("not an array: " + JSON.stringify(properties));
  this._properties = properties;
  this._label = label;
}

var Rp = Rule.prototype;

Rp.print = function print(updated) {
  console.log("<entry>");
  console.log("  <category term='filter'></category>");
  console.log("  <title>Mail Filter</title>");
  console.log("  <updated>" + updated + "</updated>");
  console.log("  <content></content>");
  this._properties.forEach(function(property) {
    property.print();
  });
  console.log("  <apps:property name='label' value='" + this._label + "'/>");
  console.log("</entry>");
};

function FromProperty(addresses) {
  if (!Array.isArray(addresses))
    throw new TypeError("not an array: " + JSON.stringify(addresses));
  this._addresses = addresses;
}

var FPp = FromProperty.prototype;

FPp.print = function print() {
  console.log("  <apps:property name='from' value='"
              + this._addresses.map(escapeXML).join(" OR ")
              + "'/>");
};

function ToProperty(addresses) {
  if (!Array.isArray(addresses))
    throw new TypeError("not an array: " + JSON.stringify(addresses));
  this._addresses = addresses;
}

var TPp = ToProperty.prototype;

TPp.print = function print() {
  console.log("  <apps:property name='to' value='"
              + this._addresses.map(escapeXML).join(" OR ")
              + "'/>");
};

function SubjectProperty(text) {
  this._text = text;
}

var SPp = SubjectProperty.prototype;

SPp.print = function print() {
  console.log("  <apps:property name='subject' value='" + escapeXML(this._text) + "'/>");
};

exports.RuleSet = RuleSet;
exports.Rule = Rule;
exports.FromProperty = FromProperty;
exports.ToProperty = ToProperty;
exports.SubjectProperty = SubjectProperty;
