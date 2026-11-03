(function () {
  var postSubmit = false;
  var warningReady = false;

  function getQuickReplyForm() {
    var $form = $('#quick_reply');

    if ($form.length) {
      return $form;
    }

    var $textarea = $('textarea[name="message"], #text_editor_textarea').first();

    if ($textarea.length) {
      return $textarea.closest('form');
    }

    return $();
  }

  function getMessageTextarea() {
    var $textarea = $('#text_editor_textarea');

    if ($textarea.length) {
      return $textarea;
    }

    $textarea = $('textarea[name="message"]').first();

    if ($textarea.length) {
      return $textarea;
    }

    return $();
  }

  function getMessageContent() {
    var $textarea = getMessageTextarea();

    if (!$textarea.length) {
      return '';
    }

    if ($.fn.sceditor) {
      try {
        var instance = $textarea.sceditor('instance');

        if (instance && typeof instance.val === 'function') {
          return $.trim(instance.val() || '');
        }
      } catch (error) {
        return $.trim($textarea.val() || '');
      }
    }

    return $.trim($textarea.val() || '');
  }

  function initWarning() {
    if (warningReady) {
      return;
    }

    var $form = getQuickReplyForm();

    if (!$form.length) {
      return;
    }

    warningReady = true;

    $form.on('submit', function () {
      postSubmit = true;
    });

    window.addEventListener('beforeunload', function (e) {
      var content = getMessageContent();

      if (!postSubmit && content.length > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });
  }

  $(function () {
    initWarning();

    var attempts = 0;

    var timer = setInterval(function () {
      initWarning();

      attempts++;

      if (warningReady || attempts >= 40) {
        clearInterval(timer);
      }
    }, 250);
  });

  $(window).on('load pageshow', function () {
    initWarning();
  });
})();