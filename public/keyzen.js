var data = {};
data.chars = " ntesiroahdjglpufywqbkvmcxz1234567890'\",.!?:;/@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
data.consecutive = 8;
data.word_length = 7;
data.use_dict = true;


$(document).ready(function() {
    if (localStorage.data != undefined) {
        load();
        render();
    }
    else {
        set_level(1);
    }
    $(document).keypress(keyHandler);
});


function set_level(l) {
    data.in_a_row = {};
    for (var i = 0; i < data.chars.length; i++) {
        data.in_a_row[data.chars[i]] = data.consecutive;
    }
    data.in_a_row[data.chars[l]] = 0;
    data.level = l;
    data.word_index = 0;
    data.word_errors = {};
    data.word_break = "";
    data.word = generate_word();
    data.keys_hit = "";
    save();
    render();
}

function set_dict(b) {
    data.use_dict = b;
    set_level(data.level);
}

function set_size(s) {
    data.word_length = s;
    set_level(data.level);
}

function keyHandler(e) {
    var key = String.fromCharCode(e.which);
    if (data.chars.indexOf(key) > -1) {
        e.preventDefault();
    }
    data.keys_hit += key;
    if (key == data.word[data.word_index]) {
        data.in_a_row[key] += 1;
        (new Audio("click.wav")).play();
    }
    else {
        data.in_a_row[data.word[data.word_index]] = 0;
        data.in_a_row[key] = 0;
        (new Audio("clack.wav")).play();
        data.word_errors[data.word_index] = true;
    }
    data.word_index += 1;
    if (data.word_index >= data.word.length) {
        if (get_training_chars().length == 0) {
            level_up();
        }
        data.word = generate_word();
        data.word_index = 0;
        data.keys_hit = "";
        data.word_errors = {};
    }
    render();
    save();
}


function level_up() {
    if (data.level + 1 <= data.chars.length - 1) {
        (new Audio('ding.wav')).play();
    }
    l = Math.min(data.level + 1, data.chars.length);
    set_level(l);
}


function save() {
    localStorage.data = JSON.stringify(data);
}


function load() {
    data = JSON.parse(localStorage.data);
}


function render() {
    render_level();
    render_word();
    render_level_bar();
    render_options();
}


function render_level() {
    var chars = "<span id='level-chars-wrap'>";
    var level_chars = get_level_chars();
    var training_chars = get_training_chars();
    for (var c in data.chars) {
        if (training_chars.indexOf(data.chars[c]) != -1) {
            chars += "<span style='color: #F00' onclick='set_level(" + c + ");'>"
        }
        else if (level_chars.indexOf(data.chars[c]) != -1) {
            chars += "<span style='color: #000' onclick='set_level(" + c + ");'>"
        }
        else {
            chars += "<span style='color: #AAA' onclick='set_level(" + c + ");'>"
        }
        if (data.chars[c] == ' ') {
            chars += "&#9141;";
        }
        else {
            chars += data.chars[c];
        }
        chars += "</span>";
    }
    chars += "</span>";
    $("#level-chars").html(chars);
}

function render_options() {
    var options = "<span id='options-wrap'>";
    if (!data.use_dict) {
        options += "<span style='color: #000' onclick='set_dict(false);'>"
    } else {
        options += "<span style='color: #AAA' onclick='set_dict(false);'>"
    }
    options += "RND";
    options += "</span>";
    options += "-";
    if (!data.use_dict) {
        options += "<span style='color: #AAA' onclick='set_dict(true);'>"
    } else {
        options += "<span style='color: #000' onclick='set_dict(true);'>"
    }
    options += "DICT";
    options += "</span>";
    options += "  ";
    if (data.word_length == 7) {
        options += "<span style='color: #000' onclick='set_size(7);'>"
    } else {
        options += "<span style='color: #AAA' onclick='set_size(7);'>"
    }
    options += "7";
    options += "</span>";
    options += "-";
    if (data.word_length == 7) {
        options += "<span style='color: #AAA' onclick='set_size(8);'>"
    } else {
        options += "<span style='color: #000' onclick='set_size(8);'>"
    }
    options += "8";
    options += "</span>";
    options += "</span>";
    $("#options").html(options);
}


function render_level_bar() {
    training_chars = get_training_chars();
    if (training_chars.length == 0) {
        m = data.consecutive;
    }
    else {
        m = 1e100;
        for (c in training_chars) {
            m = Math.min(data.in_a_row[training_chars[c]], m);
        }
    }
    m = Math.floor($('#level-chars-wrap').innerWidth() * Math.min(1.0, m / data.consecutive));
    $('#next-level').css({'width': '' + m + 'px'});
    
}   

function render_word() {
    var word = "";
    for (var i = 0; i < data.word.length; i++) {
        sclass = "normalChar";
        if (i > data.word_index) {
            sclass = "normalChar";
        }
        else if (i == data.word_index) {
            sclass = "currentChar";
        }
        else if(data.word_errors[i]) {
            sclass = "errorChar";
        }
        else {
            sclass = "goodChar";
        }
        word += "<span class='" + sclass + "'>";
        if(data.word[i] == " ") {
            word += "&#9141;"
        }
        else {
            word += data.word[i];
        }
        word += "</span>";
    }
    var keys_hit = "<span class='keys-hit'>";
    for (var d in data.keys_hit) {
        if (data.keys_hit[d] == ' ') {
            keys_hit += "&#9141";
        }
        else {
            keys_hit += data.keys_hit[d];
        }
    }
    for (var i = data.word_index; i < data.word_length; i++) {
        keys_hit += "&nbsp;";
    }
    keys_hit += "</span>";
    $("#word").html(word + "<br>" + keys_hit);
}


function generate_word_dict() {
    word = data.word_break.replace(/^\s\s*/, '');

    while (word.length < data.word_length) {
        if (data.level > 0) {
            level = Math.min(data.level - 1, words_sizes.length - 1)
            allowed_words = words.slice(0, words_sizes[level])
            word += choose_word(allowed_words, data.word_length - word.length);
        }
        word += " "
    }

    if (word.length >= data.word_length) {
        data.word_break = word.slice(data.word_length, word.length);
    }
    return word.slice(0, data.word_length);
}

function generate_word() {
    if (data.use_dict) {
        return generate_word_dict()
    }

    word = '';
    for(var i = 0; i < data.word_length; i++) {
        c = choose(get_training_chars());
        if(c != undefined && c != word[word.length-1]) {
            word += c;
        }
        else {
            word += choose(get_level_chars());
        }
    }
    return word;
}

function get_level_chars() {
    return data.chars.slice(0, data.level + 1).split('');
}

function get_training_chars() {
    var training_chars = [];
    var level_chars = get_level_chars();
    for (var x in level_chars) {
        if (data.in_a_row[level_chars[x]] < data.consecutive) {
            training_chars.push(level_chars[x]);
        }
    }
    return training_chars;
}

function choose(a) {
    return a[Math.floor(Math.random() * a.length)];
}

function choose_word(a, l) {
    var training_chars = get_training_chars();
    var min_length = data.level < 3 ? 0 : 1;

    var words = a.filter(word => 
        (contains(word, training_chars) &&
         word.length > min_length &&
         word.length <= l)
    );

    if (words.length == 0) {
        words = a.filter(word => 
            (word.length > min_length && word.length <= l)
        );
    }

    if (words.length == 0) {
        return '';
    }

    return words[Math.floor(Math.random() * words.length)];
}

function contains(a, b) {
    return a.split("").some(c => b.indexOf(c) !== -1);
}
