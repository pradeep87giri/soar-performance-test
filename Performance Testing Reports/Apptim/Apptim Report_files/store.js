// Keep my keys alive!
var state = {
    tsvFiles:  {}
}

// Commit new store value
function commitToState(key, value, isTsvFile = false) {
    if(isTsvFile) {
        state["tsvFiles"][key] = value
    }
    else {
        state[key] = value;
    }
}