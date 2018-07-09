const app = {
  _ons: [],
  _names: [],
  _joined: function(name) {
    this._names.push(name);
    this.joined(name);
  },
  _left: function(name) {
    var index = this._names.indexOf(name);
    if (index > -1) {
      this._names.splice(index, 1);
      this.left(name);
    }
  },

  on: function(eventName, callback) {
    this._ons[eventName] = callback;
  },
  emit: function(eventName, ...args) {
    window.parent.postMessage(
      {
        type: 'emit',
        eventName,
        args
      },
      '*'
    );
  },
  execute: function(eventName, args) {
    this._ons[eventName].apply(this, args);
  },
  names: function() {
    return this._names;
  },
  joined: function() {},
  left: function() {},
  onload: function() {}
};
app.emit('_onload');
app.on('_connected', function(names, data) {
  app._names = names;
  app.onload(data);
});
window.addEventListener('message', function(event) {
  if (event.origin.indexOf('http://localhost:5000') === -1) {
    return;
  }

  if (event.data.type === 'on') {
    app.execute(event.data.eventName, event.data.args);
  } else if (event.data.type === 'joined') {
    app._joined(event.data.args);
  } else if (event.data.type === 'left') {
    app._left(event.data.args);
  }
});
