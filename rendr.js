const readline = require('readline');

function getReady(){
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}

function set(txt){
    process.stdout.write(txt);
    process.stdout.write("\n");
}

module.exports = {
  getReady,
  set
}