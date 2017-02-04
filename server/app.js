module.exports = {

  apps: require("./apps.json"),

  appNames: function(){
    return this.apps.map(function(a){ return a.name; });
  }

};
