function getDataForUser(username, callback) {
  callback({
    username: "kaolinite",
    karma: 1218,
    bio: "Founder of Pleasant.io, a simple, friendly website analytics service.\n\nI'm a Rails and Javascript (Angular and Ember) developer from Liverpool, UK. I also work with Go.\n\nGithub: http://github.com/timdavies\n\nWebsite: http://timdavies.io/\n\nEmail: mail@timdavies.io",
    avatar: null,
    account_age: "1156 days ago"
  });
}

function renderLoadingTemplate() {
  var imgURL = chrome.extension.getURL("img/loading.gif");
  var html = "<div class='hnprofile-loading' style='background-image: url(" + imgURL + ");'></div>";
  return html;
}

function renderProfileTemplate(data) {
  // Format bio:
  var bio = data["bio"].replace(/\n/g, "<br>");

  // Get avatar URL:
  var avatarUrl = chrome.extension.getURL("img/profile.png");
  if (data["avatar"]) {
    avatarUrl = data["avatar"];
  }

  // Create HTML:
  var html = "";
  html += "<div class='hnprofile-body'>";
  html += "  <div class='hnprofile-top'>";
  html += "    <div class='hnprofile-avatar' style='background-image: url(" + avatarUrl + ");'></div>";

  html += "    <div class='hnprofile-info-bar'>";
  html += "      <div class='hnprofile-username'>" + data["username"] + "</div>";
  html += "      <div class='hnprofile-karma'>Karma: " + data["karma"] + "</div>";
  html += "      <div class='hnprofile-age'>Created: " + data["account_age"] + "</div>";
  html += "    </div>";
  html += "  </div>";

  html += "  <div class='hnprofile-main'>";
  html += "    <div class='hnprofile-bio-label'>Bio:</div>";
  html += "    <div class='hnprofile-bio'>" + bio + "</div>";
  html += "  </div>";

  html += "  <div class='hnprofile-links'>";
  html += "    <a href='#' class='hnprofile-link'>Submissions</a>";
  html += "    <a href='#' class='hnprofile-link'>Comments</a>";
  html += "  </div>";
  html += "</div>";

  return html;
}

$(function() {
  // Loop through links where user profile links are:
  $('.comhead a, .subtext a').each(function() {
    // Check if link is a user profile:
    var link_src = $(this).attr('href');
    if (link_src.substr(0, 8) != "user?id=") {
      return;
    }

    // Bind to link:
    var drop = new Drop({
      target: this,
      content: 'Welcome to the future!',
      position: 'bottom left',
      classes: 'drop-theme-arrows-bounce',
      openOn: 'hover'
    });

    // Save link for use in callback:
    var link = $(this);
    var username = $(this).attr('href').substr(8)

    // When popover is opened, fetch the user's info:
    drop.on('open', function() {
      // Display loading message:
      $(drop.content).html(renderLoadingTemplate());

      // Fetch data:
      getDataForUser(username, function(data) {
        $(drop.content).html(renderProfileTemplate(data));
      });
    });
  });
});