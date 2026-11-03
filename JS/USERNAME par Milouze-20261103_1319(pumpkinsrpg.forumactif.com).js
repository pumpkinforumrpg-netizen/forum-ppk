$(function () {
  if (typeof _userdata !== "undefined" && _userdata.session_logged_in == 1) {
    $("#username").text(_userdata.username);
  }
});