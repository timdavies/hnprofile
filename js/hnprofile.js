function getDataForUser(username, callback) {
  callback();
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
      classes: 'drop-theme-basic',
      openOn: 'hover'
    });

    // Save link for use in callback:
    var link = $(this);
    var username = $(this).attr('href').substr(8)

    // When popover is opened, fetch the user's info:
    drop.on('open', function() {
      // Display loading message:
      $(drop.content).html("Loading!");

      // Fetch data:
      getDataForUser(username, function() {
        $(drop.content).html(username);
      });
    });
  });
});