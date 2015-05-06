function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function getDataForUser(username, callback) {
  $.get("/user?id=" + username, function(data) {
    var created = 0;
    var karma = 0;
    var bio = "";

    try {
      // Loop through trs:
      $(data).find('tr').each(function() {
        if ($(this).find('td').length == 2) {
          var key = $(this).find('td').eq(0).text().trim();
          var value = $(this).find('td').eq(1).text().trim();

          if (key == "created:") {
            created = value;
          }

          if (key == "karma:") {
            karma = value;
          }

          if (key == "about:") {
            bio = $(this).find('td').eq(1).html().trim();
          }
        }
      });

      // Try and extract emails from bio:
      var emails = extractEmails(bio);
      if (emails && emails.length > 0) {
        var email = emails[0];
        var hash = CryptoJS.MD5(email);
        var avatar_url = "http://gravatar.com/avatar/" + hash + "?s=80&d=mm"
      }

      callback({
        username: username,
        karma: karma,
        bio: bio,
        avatar: null,
        account_age: created,
      });
    } catch(err) {
      console.log(err);
      return callback(null);
    }
  });
}

function renderRateLimited() {
  return "<div class='hnprofile-ratelimited'>Unfortunately, you've been temporarily rate-limited for user profiles.</div>";
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
      content: renderLoadingTemplate(),
      position: 'bottom left',
      classes: 'drop-theme-arrows-bounce',
      openOn: 'hover'
    });

    // Save link for use in callback:
    var link = $(this);
    var username = $(this).attr('href').substr(8)

    // When popover is opened, fetch the user's info:
    drop.on('open', function() {
      getDataForUser(username, function(data) {
        if (!data) {
          $(drop.content).html(renderRateLimited());
        } else {
          $(drop.content).html(renderProfileTemplate(data));
        }
      });
    });
  });
});