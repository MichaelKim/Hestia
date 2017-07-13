var app = {
    _ons: [],
    _names: [],
    _joined: function(name) {
        this._names.push(name);
        this.joined(name);
    },
    _left: function(name) {
        var index = this._names.indexOf(name);
        if(index > -1) {
            this._names.splice(index, 1);
        }
        this.left(name);
    },

    on: function(eventName, callback) {
        this._ons[eventName] = callback;
    },
    emit: function() {
        window.parent.postMessage({
            type: "emit",
            args: Array.prototype.slice.call(arguments)
        }, "*");
    },
    execute: function(eventName, args) {
        console.log(eventName, args);
        app._ons[eventName].apply(this, args);
    },
    names: function() {
        return this._names;
    },
    joined: function(name) {
        console.log("player " + name + " joined");
    },
    left: function(name) {
        console.log("player " + name + " left");
    }
};
