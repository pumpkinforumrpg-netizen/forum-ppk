function loadRecentTopicAvatars() {
  $(".ppk-rt-item").each(function () {
    const $item = $(this);
    const $avatar = $item.find(".ppk-rt-avatar").first();
    const $link = $item.find(".ppk-rt-user").first();

    if (!$avatar.length) return;
    if ($avatar.data("loaded")) return;

    if (!$link.length || !$link.attr("href")) {
      $avatar.addClass("is-empty");
      $avatar.data("loaded", true);
      return;
    }

    $avatar.data("loaded", true);

    $.get($link.attr("href"))
      .done(function (html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const img = doc.querySelector("#user_avatar img, .ppk-profile-avatar img");
        const src = img?.src;

        if (!src) {
          $avatar.addClass("is-empty");
          return;
        }

        $avatar.removeClass("is-empty").html(`<img src="${src}" alt="">`);
      })
      .fail(function () {
        $avatar.addClass("is-empty");
      });
  });
}

$(document).ready(loadRecentTopicAvatars);
$(window).on("load", loadRecentTopicAvatars);
setTimeout(loadRecentTopicAvatars, 500);
setTimeout(loadRecentTopicAvatars, 1200);