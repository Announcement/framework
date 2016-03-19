# framework
Javascript utilities toolbelt

# Requirements
1. [node](https://nodejs.org/) to run
1. [livescript](http://livescript.net/) to compile [^1]

[1]: You can also compile online or acquire a precompiled package from the community.
# Build instructions
```bash
# easy
npm build

# customizable
lsc -bco . src
```
# include.ls

```livescript
global.include = require "#{__dirname}/include"

[transform, chalk, options] = include <[transform chalk options]>

#> include folder/script, node_module, whatever-you-want

console.log options
```
# options.ls
```livescript
# -p and --port mean the same thing
options.add-alias 'p', 'port'

# set some defaults, incase the flag isn't used
options.assume 'port', 3000

# see what the configured port is
console.log options.flags.port
```
