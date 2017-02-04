var fs = require("fs");
var appList = [];
var files = fs.readdirSync("./apps/"); //i'm sorry
files.forEach(function (file){
  if(fs.existsSync("./apps/" + file + "/index.html") &&
     fs.existsSync("./apps/" + file + "/main.js"))
     appList.push({ name: file,
                    html: "./apps/" + file + "/index.html",
                    js: "./apps/" + file + "/main.js"});
});

console.log(appList);

module.exports = {

  apps: appList,

  appNames: function(){
    return this.apps.map(function(a){ return a.name; });
  },

  getAppFiles: function(appId, callback){
    var htmlFile = this.apps[appId].html;
    var jsFile = this.apps[appId].js;

    fs.readFile(htmlFile, "utf8", function(err, htmlData){ //am i doing this async thing right
      if(err) throw err;
      fs.readFile(jsFile, "utf8", function(err2, jsData){
        if(err2) throw err2;
        console.log({ html: htmlData, js: jsData });
        callback({ html: htmlData, js: jsData });
      });
    });
  }

};
