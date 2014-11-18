var Parser = require("jison").Parser;

var grammar = {
  "lex": {
    "rules": [
      ["\\s+",                              "/* skip whitespace */"],
      ["#[^\\n]*",                          "/* skip comment */"],
      [";",                                 "return 'SEMI';"],
      [",",                                 "return 'COMMA';"],
      ["\\(",                               "return 'LPAREN';"],
      ["\\)",                               "return 'RPAREN';"],
      ["\\[",                               "return 'LBRACK';"],
      ["\\]",                               "return 'RBRACK';"],
      ["{",                                 "return 'LBRACE';"],
      ["}",                                 "return 'RBRACE';"],
      ["\\\"([^\"\\\\]|\\\\[\"\\\\])*\\\"", "return 'STRING';"],
      ["zimbraMailSieveScript(\\s*):",      "return 'ZIMBRA';"],
      ["[a-zA-Z_][a-zA-Z0-9_]*",            "return 'ID';"],
      [":[a-zA-Z_][a-zA-Z0-9_]*",           "return 'TAG';"],
      ["[0-9]+[KkMmGg]?",                   "return 'NUMBER';"],
      ["$",                                 "return 'EOF';"]
    ]
  },

  "bnf": {
    "script": [ [ "commands EOF", "return $1;" ],
                [ "ZIMBRA commands EOF", "return $2;" ] ],
    "commands": [ [ "commands command", "$$ = $1; $$.push($2);" ],
                  [ "", "$$ = [];" ] ],
    "command":  [ [ "ID args SEMI", "$$ = { command: $1, args: $2 };" ],
                  [ "ID args block", "$$ = { command: $1, args: $2, body: $3 };" ] ],
    "args": [ [ "arglist", "$$ = { arglist: $1 };" ],
              [ "arglist test", "$$ = { arglist: $1, test: $2 };" ],
              [ "arglist LPAREN testlist RPAREN", "$$ = { arglist: $1, testlist: $3 };" ] ],
    "arglist": [ [ "arglist arg", "$$ = $1; $$.push($2);" ],
                 [ "", "$$ = [];" ] ],
    "test": [ [ "ID args", "$$ = { test: $1, args: $2 };" ] ],
    "testlist": [ [ "testlist COMMA test", "$$ = $1; $$.push($3);" ],
                  [ "test", "$$ = [$1];" ] ],
    "arg": [ [ "LBRACK stringlist RBRACK", "$$ = { type: 'stringlist', value: $2 };" ],
             [ "STRING", "$$ = { type: 'string', value: $1 };" ],
             [ "NUMBER", "$$ = { type: 'number', value: $1 };" ],
             [ "TAG", "$$ = { type: 'tag', value: $1 };" ] ],
    "stringlist": [ [ "stringlist COMMA STRING", "$$ = $1; $$.push($3);" ],
                    [ "STRING", "$$ = [$1];" ] ],
    "block": [ [ "LBRACE commands RBRACE", "$$ = { block: $2 };" ] ]
  }
};

module.exports = new Parser(grammar);
