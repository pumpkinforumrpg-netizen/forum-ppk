window.localStorage && $(window).load(function() {
    var t_icon = window.top.$.find('link[rel="shortcut icon"]')[0];
    var t_doc = window.top.document;
    var title = t_doc.title;
    var icon = t_icon.getAttribute('href');

    var rep_title = 'MEOW ! ' + title;
    var rep_icon = 'https://2img.net/i.imgur.com/UQPHKaR.png';

    $(window)
      .on("focus", function() {
        localStorage.cb_blurred = '';
        localStorage.cb_notified = '';

        t_doc.title = title;

        var new_t_icon = t_icon.cloneNode(true);
        new_t_icon.setAttribute('href', icon);

        var t_icon_parent = t_icon.parentNode;
        t_icon_parent.removeChild(t_icon);
        t_icon_parent.appendChild(new_t_icon);

        t_icon = new_t_icon;
      })
      .on("blur", function() {
        localStorage.cb_blurred = '1';
      });

    var overrided = Chatbox.prototype.refresh;

    Chatbox.prototype.refresh = function(data) {
      if (data.messages && data.messages.length) {
        var lm = data.messages.slice(-1)[0];
        var last_message = lm.time + ',' + lm.action + ',' + lm.msg;

        if (this.last_message != last_message) {
          var user = $.grep(data.users, function(v) {
            return v.id == chatbox.userId;
          });

          user = user.length ? user[0] : [{}];

          if (this.last_message !== undefined) {
            if (lm.userId != chatbox.userId && user.username != lm.username) {
              if (localStorage.cb_blurred && !localStorage.cb_notified) {
                localStorage.cb_notified = '1';

                t_doc.title = rep_title;

                var new_t_icon = t_icon.cloneNode(true);
                new_t_icon.setAttribute('href', rep_icon);

                var t_icon_parent = t_icon.parentNode;
                t_icon_parent.removeChild(t_icon);
                t_icon_parent.appendChild(new_t_icon);

                t_icon = new_t_icon;
              }
            } else {
              localStorage.cb_blurred = '';
            }
          }

          this.last_message = lm;
        }
      }

      overrided.call(this, data);
    };
});