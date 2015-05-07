//= include ./jquery.js
//= include ./md5.js
//= include ./drop.js

function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function extractGithubs(text) {
  return text.match(/github.com\/([^\/ \n]*)/gi);
}

function getDataForUser(username, callback) {
  $.get("/user?id=" + username, function(data) {
    var created = 0;
    var karma = 0;
    var bio = "";
    var avatar_url = null;

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

      // Try and get Github account (for avatar):
      var githubs = extractGithubs(bio);
      if (githubs && githubs.length > 0) {
        var github_username = githubs[0].trim().replace("github.com/", "");
        avatar_url = "https://avatars.githubusercontent.com/" + github_username
      }

      // Try and extract emails from bio:
      if (avatar_url == null) {
        var emails = extractEmails(bio);
        if (emails && emails.length > 0) {
          var email = emails[0];
          var hash = CryptoJS.MD5(email);
          avatar_url = "http://gravatar.com/avatar/" + hash + "?s=80&d=mm"
        }
      }

      // Check if the bio is in a textarea (i.e. the bio belongs to logged in
      // user):
      try {
        if ($(bio).is("textarea")) {
          bio = $(bio).eq(0).text();
        }
      } catch (err) {
      }

      // Call callback with data:
      callback({
        username: username,
        karma: karma,
        bio: bio,
        avatar: avatar_url,
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

function getExtensionImage(src) {
  if (HNProfileBrowser == "safari") {
    return safari.extension.baseURI + src;
  } else if (HNProfileBrowser == "chrome") {
    return chrome.extension.getURL(src);
  } else {
    console.log("HNProfile: error accessing browser name");
    return src;
  }
}

function renderLoadingTemplate() {
  if (HNProfileBrowser == 'firefox') {
    var imgURL = self.options.loadingUrl;
  } else {
    var imgURL = getExtensionImage("img/loading.gif");
  }
  var html = "<div class='hnprofile-loading' style='background-image: url(" + imgURL + ");'></div>";
  return html;
}

function renderProfileTemplate(data) {
  // Format bio:
  var bio = data["bio"].replace(/\n/g, "<br>");

  // Get avatar URL:
  if (HNProfileBrowser == 'firefox') {
    var avatarUrl = self.options.profileUrl;
  } else {
    var avatarUrl = getExtensionImage("img/profile.png");
  }
  if (data["avatar"]) {
    var avatarUrl = data["avatar"];
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
  if (bio.length > 0) {
    html += "    <div class='hnprofile-bio-label'>Bio:</div>";
    html += "    <div class='hnprofile-bio'>" + bio + "</div>";
  } else {
    html += "    <div class='hnprofile-bio hnprofile-bio-empty'>No user bio</div>";
  }
  html += "  </div>";

  html += "  <div class='hnprofile-links'>";
  html += "    <a href='/submitted?id=" + data["username"] + "' class='hnprofile-link'>Submissions</a>";
  html += "    <a href='/threads?id=" + data["username"] + "' class='hnprofile-link'>Comments</a>";
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
