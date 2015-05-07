var self = require("sdk/self");
var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: "*.news.ycombinator.com",
  contentScriptFile: self.data.url("js/hnprofile.js"),
  contentStyleFile: [
    self.data.url("css/drop.css"),
    self.data.url("css/hnprofile.css")
  ],
  contentScriptOptions: {
    profileUrl: self.data.url("img/profile.png"),
    loadingUrl: self.data.url("img/loading.gif")
  }
});
