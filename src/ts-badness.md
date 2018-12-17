# Bad things that happen to joe while having a hybrid ts/js project


## Using require on a ts file and forgetting to mod it.

This happens all the time to me: const {buySeverity, sellSeverity} = require("./config");

However, I converted config to ts :/ so when both buySeverity, sellSeverity are undefined now.
Because the file I'm using them in is js, there are no warnings :(

Destructing something like:

```javascript
const {CONST1, CONST2} = require("./config"); 
```

break creatively in that my code was never checking if buy/sell was undefined and suddenly it was.

```
if (CONST1) {}

if (CONST2) {}
```

#Asset don't copy over

JSON data files, html file templates. Leading to unexpected crashes
