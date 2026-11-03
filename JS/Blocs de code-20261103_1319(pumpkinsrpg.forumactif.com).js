$(function () {
  $('dl.codebox').each(function () {
    var $box = $(this);
    var $code = $box.find('dd code').first();

    if (!$code.length) return;

    // Nettoie les anciens boutons éventuellement injectés dans le dt caché
    $box.find('dt .copy-codeppk').remove();

    // Évite les doublons si le script se relance
    $box.children('.copy-codeppk').remove();

    $box.addClass('ppk-code-ready');

    var $btn = $(
      '<button type="button" class="copy-codeppk" aria-label="Copier le code">' +
        '<i class="fa-regular fa-copy" aria-hidden="true"></i>' +
      '</button>'
    );

    $box.prepend($btn);

    function getCodeWithLineBreaks($el) {
      var html = $el.html();

      // Forumactif transforme souvent les retours ligne en <br>
      html = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&nbsp;/gi, ' ');

      // Décode &lt; &gt; &amp; etc.
      var textarea = document.createElement('textarea');
      textarea.innerHTML = html;

      return textarea.value;
    }

    $btn.on('click', function () {
      var btn = this;
      var text = getCodeWithLineBreaks($code);

      function success() {
        btn.classList.remove('is-error');
        btn.classList.add('is-copied');

        setTimeout(function () {
          btn.classList.remove('is-copied');
        }, 1200);
      }

      function error() {
        btn.classList.remove('is-copied');
        btn.classList.add('is-error');

        setTimeout(function () {
          btn.classList.remove('is-error');
        }, 1200);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(success).catch(error);
      } else {
        var temp = document.createElement('textarea');
        temp.value = text;
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        temp.style.top = '-9999px';

        document.body.appendChild(temp);
        temp.focus();
        temp.select();

        try {
          document.execCommand('copy') ? success() : error();
        } catch (e) {
          error();
        }

        document.body.removeChild(temp);
      }
    });
  });
});