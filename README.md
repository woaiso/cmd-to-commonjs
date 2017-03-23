# cmd-to-commonjs [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![npm](https://img.shields.io/npm/v/cmd-to-commonjs.svg)]()
seajs cmd to commonjs


## Install


Get cmd2commonjs from [npm][]:

```
$ npm install -g cmd2commonjs
```

This will install the runner as `cmd2commonjs`.

## Usage (CLI)

The CLI provides the following options:

```
cmd2commonjs <dirPath|filePath>
```


## Compare

### Before
```
/**
 * 注释1111
 * @author woaiso
 */

/**
 *!注释22222222
 * @author woaiso
 */

//inline comment

define(function (require, exports){
    var Class = require("library/class");
    var ProShelf = new Class({});
    return ProShelf;
});

```

### After
```
/**
 * 注释1111
 * @author woaiso
 */
/**
 *!注释22222222
 * @author woaiso
 */
//inline comment
var Class = require("library/class");
var ProShelf = new Class({});
module.exports = ProShelf;
```

## Example

```
cmd2commonjs path/src
```

```
cmd2commonjs src/index.js
```


[npm]: https://www.npmjs.com/