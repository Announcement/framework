var path, chalk, transform, flatten, Command;
path = require('path');
chalk = require('chalk');
transform = include(['transform'])[0];
flatten = transform.flatten;
Command = (function(){
  Command.displayName = 'Command';
  var argv, regex, regextras, aliases, parse, prototype = Command.prototype, constructor = Command;
  argv = [];
  regex = {
    long: /^\-{2}(\w[\w-]+)$/m,
    short: /^\-(\w+)$/m,
    indexed: /^(?:-(\w+)|--(\w[\w-]+))\=(.+)/
  };
  regextras = {
    no: /^no\-/
  };
  aliases = {
    k: 'secure',
    o: 'output',
    a: 'ask'
  };
  function decompose(it){
    var i$, x$, len$, resultObj$ = {};
    it = flatten(it);
    for (i$ = 0, len$ = it.length; i$ < len$; ++i$) {
      x$ = it[i$];
      resultObj$[x$.key] = x$.value;
    }
    return resultObj$;
  }
  function saveFlag(key, value){
    value == null && (value = true);
    if (value === true && key.match(regextras.no)) {
      key = key.replace(regextras.no, '');
      value = false;
    }
    if (key.length === 1 && aliases.hasOwnProperty(key)) {
      key = aliases[key];
    }
    return {
      key: key,
      value: value
    };
  }
  function handle(it){
    var i$, x$, ref$, len$, results$ = [];
    switch (it.name) {
    case 'short':
      for (i$ = 0, len$ = (ref$ = it.value[1].split('')).length; i$ < len$; ++i$) {
        x$ = ref$[i$];
        results$.push(saveFlag(x$));
      }
      return results$;
      break;
    case 'long':
      return [saveFlag(it.value[1])];
    case 'indexed':
      return [saveFlag(it.value[1] || it.value[2], it.value[3])];
    }
  }
  function provide(it){
    return flatten((function(){
      var i$, x$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = it).length; i$ < len$; ++i$) {
        x$ = ref$[i$];
        if (x$.value != null) {
          results$.push(handle(x$));
        }
      }
      return results$;
    }()));
  }
  parse = function(it){
    return provide((function(){
      var i$, ref$, own$ = {}.hasOwnProperty, results$ = [];
      for (i$ in ref$ = regex) if (own$.call(ref$, i$)) {
        results$.push((fn$.call(this, i$, ref$[i$])));
      }
      return results$;
      function fn$(name, value){
        return {
          name: name,
          value: value.exec(it)
        };
      }
    }.call(this)));
  };
  prototype.need = function(it){
    var missingFlagError;
    if (arguments.length > 1) {
      return (function(args$){
        var i$, x$, len$, results$ = [];
        for (i$ = 0, len$ = args$.length; i$ < len$; ++i$) {
          x$ = args$[i$];
          results$.push(need(x$));
        }
        return results$;
      }(arguments));
    }
    missingFlagError = new Error("Required flag '" + it + "' is missing!");
    if (this.flags[it] == null) {
      throw missingFlagError;
    }
  };
  prototype.assume = function(property, value){
    if (this.flags[property] == null) {
      return this.flags[property] = value;
    }
  };
  prototype.update = function(){
    this.args = [].concat(argv);
    this.executable = path.normalize(this.args.shift());
    this.entry = path.normalize(this.args.shift());
    this.flags = decompose((function(){
      var i$, x$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = this.args).length; i$ < len$; ++i$) {
        x$ = ref$[i$];
        results$.push(parse(x$));
      }
      return results$;
    }.call(this)));
    return this.parameters = (function(){
      var i$, x$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = this.args).length; i$ < len$; ++i$) {
        x$ = ref$[i$];
        if (!x$.match(/^-/m)) {
          results$.push(x$);
        }
      }
      return results$;
    }.call(this));
  };
  prototype.addAlias = function(short, long){
    aliases[short] = long;
    return this.update();
  };
  prototype.toString = function(){
    return this.executable;
  };
  function Command(args){
    argv = Array.prototype.slice.call(args, 0);
    this.update();
  }
  return Command;
}());
module.exports = new Command(process.argv);