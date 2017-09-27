var GraphemeSplitter = require('grapheme-splitter');
var colors = require('colors');
var fs = require('fs');
splitter = GraphemeSplitter();


var emoji_key = {
    START : '🏁',
    END : '🛑',
    UP : '⬆️',
    DOWN : '⬇️',
    LEFT : '⬅️',
    RIGHT : '➡️',
    IF : '❓',
    FALSE : '👎',
    TRUE : '👍',
    SET : '🔹',
    NUMBER : '🔢',
    EMOJI : '😀',
    BOOL : '👊',
    STOP : '🔚',
    ZERO : '0️⃣',
    ONE : '1️⃣',
    TWO : '2️⃣',
    THREE : '3️⃣',
    FOUR : '4️⃣',
    FIVE : '5️⃣',
    SIX : '6️⃣',
    SEVEN : '7️⃣',
    EIGHT : '8️⃣',
    NINE : '9️⃣',
    PRINT : '🔊',
    ADD : '➕',
    SUBTRACT : '➖',
    MULTIPLY : '✖️',
    CLONE : '🔄'
}

var direction = {
    UP : emoji_key.UP,
    DOWN : emoji_key.DOWN,
    LEFT : emoji_key.LEFT,
    RIGHT : emoji_key.RIGHT
}

var operations = {};
operations[emoji_key.START] = function(vm) {
    vm.move(1);
}
operations[emoji_key.END] = function(vm) {
    vm.end();
}

operations[emoji_key.UP] = function(vm) {
    vm.direction = direction.UP;
    vm.move(1);
}
operations[emoji_key.DOWN] = function(vm) {
    vm.direction = direction.DOWN;
    vm.move(1);
}
operations[emoji_key.LEFT] = function(vm) {
    vm.direction = direction.LEFT;
    vm.move(1);
}
operations[emoji_key.RIGHT] = function(vm) {
    vm.direction = direction.RIGHT;
    vm.move(1);
}

operations[emoji_key.IF] = function(vm) {
    var varName = vm.get(1);
    var variable = vm.getVariable(varName);
    var value = true;
    if(variable.type == 'null') {
        value = false;
    }

    if(variable.type == 'bool') {
        value = variable.value;
    }
    if(variable.type == 'number') {
        value = variable.value != 0;
    }
    if(variable.type == 'array') {
        value = variable.value.length != 0;
    }

    if(value) {
        vm.move(2);
    } else {
        vm.move(3);
    }

}

operations[emoji_key.SET] = function(vm) {
    var variableName = vm.get(1);
    var type = vm.get(2);

    switch(type) {
        case emoji_key.EMOJI :
            vm.setVariable(variableName,{type : "emoji",value : vm.get(3)});
            vm.move(4);
            break;
        case emoji_key.BOOL :
            var emBool = vm.get(3);
            var boolValue = null;
            if(emBool == emoji_key.TRUE) {
                boolValue = true;
            } else if(emBool == emoji_key.FALSE) {
                boolValue = false;
            } else {
                error(emBool + " is not a boolean value");
            }
            vm.setVariable(variableName,{type : "bool",value : boolValue});
            vm.move(4);
            break;
        case emoji_key.NUMBER :
            var count = 0;
            var number = 0;
            while(is_number_emoji(vm.get(3+count))) {
                number = number * 10 + emoji_to_number(vm.get(count + 3));
                count++;
            }
            vm.setVariable(variableName,{type : "number",value : number});
            vm.move(count + 3);
            break;
        default : 
            error(type + " is not a variable type!",true);
    }

}

operations[emoji_key.PRINT] = function(vm){
    var variableName = vm.get(1);
    var variable = vm.getVariable(variableName);

    switch(variable.type) {
        case "emoji" :
            console.log(variable.value)
            break;
        case "bool" :
            if(variable.value) {
                console.log(emoji_key.TRUE);
            } else {
                console.log(emoji_key.FALSE);
            }
            break;
        case "number" :
            console.log(variable.value);
            break;
        case "null" :
            console.log("null");
        }
        vm.move(2);
}

operations[emoji_key.ADD] = function(vm){
    var varA = vm.get(1);
    var varB = vm.get(2);
    var varR = vm.get(3);

    var a = vm.getVariable(varA);
    var b = vm.getVariable(varB);

    if(a.type == 'number' && b.type == 'number') {
        vm.setVariable(varR,{type : 'number', value : a.value + b.value});
    }
    if(a.type == 'bool' && b.type == 'bool') {
        vm.setVariable(varR,{type : 'bool', value : a.value || b.value});
    }
    vm.move(4);
}

operations[emoji_key.SUBTRACT] = function(vm){
    var varA = vm.get(1);
    var varB = vm.get(2);
    var varR = vm.get(3);

    var a = vm.getVariable(varA);
    var b = vm.getVariable(varB);

    if(a.type == 'number' && b.type == 'number') {
        vm.setVariable(varR,{type : 'number', value : a.value - b.value});
    }
    vm.move(4);
}

operations[emoji_key.MULTIPLY] = function(vm){
    var varA = vm.get(1);
    var varB = vm.get(2);
    var varR = vm.get(3);

    var a = vm.getVariable(varA);
    var b = vm.getVariable(varB);

    if(a.type == 'number' && b.type == 'number') {
        vm.setVariable(varR,{type : 'number', value : a.value * b.value});
    }

    if(a.type == 'bool' && b.type == 'bool') {
        vm.setVariable(varR,{type : 'bool', value : a.value && b.value});
    }

    vm.move(4);
}

operations[emoji_key.CLONE] = function(vm){
    var varA = vm.get(1);
    var varB = vm.get(2);

    vm.setVariable(varB,vm.getVariable(varA));
 

    vm.move(3);
}



function emoji_to_number(value) {
    if(!is_number_emoji(value)) {
        return -1;
    }
    switch(value) {
        case emoji_key.ZERO :
         return 0;
        case emoji_key.ONE :
         return 1;
        case emoji_key.TWO :
         return 2;
        case emoji_key.THREE :
         return 3;
        case emoji_key.FOUR :
         return 4;
        case emoji_key.FIVE :
         return 5;
        case emoji_key.SIX :
         return 6;
        case emoji_key.SEVEN :
         return 7;
        case emoji_key.EIGHT :
         return 8;
        case emoji_key.NINE :
         return 9;
    }
}

function is_number_emoji(value) {
    if(typeof value != "string") {
        return false;
    }

    return value == emoji_key.ZERO || value == emoji_key.ONE || value == emoji_key.TWO || value == emoji_key.THREE || value == emoji_key.FOUR || value == emoji_key.FIVE || value == emoji_key.SIX || value == emoji_key.SEVEN || value == emoji_key.EIGHT || value == emoji_key.NINE;
}

function is_flag(flag) {
    return true;
    if(typeof rawProgram != "string") {
        return false;
    }

    if(flag.length != 2) {
        return false;
    }

    if(0x1F1E6 > flag.charCodeAt(0) || 0x1F1E6 > flag.charCodeAt(1) || 0x1F1FF < flag.charCodeAt(0) || 0x1F1FF < flag.charCodeAt(1)){
        return false;
    }

    return true;
}

function execute(rawProgram) {
    if(typeof rawProgram != "string") {
        error("Program type not string -> ", true);
    }

    var program = arrayify(rawProgram);

    var vm = new VM(program);
    vm.start();
}


function arrayify(rawProgram) {
    var array = rawProgram.split('\n');

    var arraifiedProgram = [];
    
    array.forEach(function(element) {
        arraifiedProgram.push(splitter.splitGraphemes(element));
    }, this);

    return arraifiedProgram;
}

function error(message,fatal) {
    console.log(JSON.stringify(message).red);
    if(fatal) {
        process.exit(1);
    }
}

function VM(program) {
    this.program = program;

    var start_emoji_locations = this.find(emoji_key.START);
    if(start_emoji_locations.length != 1) {
        error("There must be EXACTLY ONE " + emoji_key.START + " emoji in a program.",true);
    }
    this.x = start_emoji_locations[0].x;
    this.y = start_emoji_locations[0].y;

    this.direction = direction.RIGHT;

    this.height = program.length;
    this.width = 0;
    program.forEach((value) => {
        if(value.length > this.width) {
            this.width = value.length;
        }
    });

    this.variables = {};

}
VM.prototype.find = function(emoji) {
    var locations_array = [];
    this.program.forEach((value, y, array) => {
        value.forEach((foundEmoji,x) => {
            if(foundEmoji == emoji) {
                locations_array.push({x : x , y : y});
            }
        });
    });
    return locations_array;
}

VM.prototype.move = function(distance) {
    switch(this.direction) {
        case direction.RIGHT : 
            this.x += distance;
            while(this.x >= this.width) {
                this.x -= this.width;
            }
            break;
        case direction.LEFT : 
            this.x -= distance;
            while(this.x < 0) {
                this.x += this.width;
            }
            break;
        case direction.UP : 
            this.y -= distance;
            while(this.y < 0) {
                this.y += this.height;
            }
            break;
        case direction.DOWN : 
            this.y += distance;
            while(this.y >= this.height) {
                this.y -= this.height;
            }
            break;
    }

}

VM.prototype.end = function() {
    process.exit();
}

VM.prototype.get = function(distance) {
    var x = this.x;
    var y = this.y;
    switch(this.direction) {
        case direction.RIGHT : 
            x += distance;
            while(x >= this.width) {
                x -= this.width;
            }
            break;
        case direction.LEFT : 
            x -= distance;
            while(x < 0) {
                x += this.width;
            }
            break;
        case direction.UP : 
            y -= distance;
            while(y < 0) {
                y += this.height;
            }
            break;
        case direction.DOWN : 
            y += distance;
            while(y >= this.height) {
                y -= this.height;
            }
            break;
    }
    return this.program[y][x];
}

VM.prototype.step = function() {
    var emoji = this.get(0);
    if(operations[emoji] != null) {
        operations[emoji](this);
    } else {
        this.move(1);
    }
}

VM.prototype.start = function() {
    while(true) {
        this.step();
    }
}

VM.prototype.setVariable = function(variableName,value) {
    if(!is_flag(variableName)) {
        error(variableName + " is not a valid variable name!",true);
    }

    this.variables[variableName] = value;
}

VM.prototype.getVariable = function(variableName) {
    if(!is_flag(variableName)) {
        error(variableName + " is not a valid variable name!",true);
    }

    if(this.variables[variableName] == null) {
        return {type:'null'};
    }

    return this.variables[variableName];
}

if(process.argv.length != 3) {
    error("Usage : node app.js [filename]", true);
}

var filename = process.argv[2];

fs.readFile(filename,'utf-8', (err, data) => {
    if(err) {
        error(err,true);
    }
    execute(data);
});
