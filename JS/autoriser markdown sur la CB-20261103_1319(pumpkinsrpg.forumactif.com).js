window.localStorage && $(window).load(function () {
  if (window.__PPK_CB_MARKDOWN_READY__) return;
  window.__PPK_CB_MARKDOWN_READY__ = true;

  var MARKED_URL = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js';
  var DOMPURIFY_URL = 'https://cdn.jsdelivr.net/npm/dompurify@3.0.9/dist/purify.min.js';

  var renderQueued = false;

  function loadScript(id, src, globalName) {
    if (window[globalName]) {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      var existing = document.getElementById(id);

      if (existing) {
        var tries = 0;

        var timer = window.setInterval(function () {
          tries += 1;

          if (window[globalName]) {
            window.clearInterval(timer);
            resolve();
            return;
          }

          if (tries > 80) {
            window.clearInterval(timer);
            reject(new Error(globalName + ' non disponible.'));
          }
        }, 100);

        return;
      }

      var script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;

      script.onload = function () {
        if (window[globalName]) {
          resolve();
        } else {
          reject(new Error(globalName + ' chargé mais non disponible.'));
        }
      };

      script.onerror = function () {
        reject(new Error('Échec du chargement : ' + src));
      };

      (document.head || document.documentElement).appendChild(script);
    });
  }

  function injectMarkdownStyles() {
    if (document.getElementById('ppk-cb-markdown-style')) return;

    var style = document.createElement('style');
    style.id = 'ppk-cb-markdown-style';

    style.textContent = `
#chatbox .msg .cb-md {
  display: block;
  overflow-wrap: anywhere;
  word-break: normal;
}

#chatbox .msg .cb-md p {
  margin: 0 0 4px 0 !important;
  padding: 0 !important;
}

#chatbox .msg .cb-md p:last-child {
  margin-bottom: 0 !important;
}

#chatbox .msg .cb-md strong {
  font-weight: 700 !important;
}

#chatbox .msg .cb-md em {
  font-style: italic !important;
}

#chatbox .msg .cb-md s,
#chatbox .msg .cb-md del {
  text-decoration: line-through !important;
}

#chatbox .msg .cb-md a {
  color: var(--color9) !important;
  text-decoration: underline !important;
}

#chatbox .msg .cb-md code {
  display: inline-block;
  max-width: 100%;
  background: var(--color8) !important;
  color: var(--color5) !important;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: Consolas, Monaco, monospace;
  font-size: 0.9em;
  line-height: 1.35;
  vertical-align: baseline;
}

#chatbox .msg .cb-md pre {
  margin: 5px 0 !important;
  padding: 7px 9px !important;
  background: var(--color8) !important;
  border-radius: 8px;
  overflow-x: auto;
  white-space: pre-wrap;
}

#chatbox .msg .cb-md pre code {
  display: block;
  padding: 0;
  background: transparent !important;
  border-radius: 0;
}

#chatbox .msg .cb-md blockquote {
  margin: 5px 0 !important;
  padding: 2px 0 2px 10px !important;
  border-left: 2px solid var(--color9);
  opacity: 0.9;
}

#chatbox .msg .cb-md ul {
  list-style: disc !important;
  margin: 4px 0 4px 20px !important;
  padding: 0 !important;
}

#chatbox .msg .cb-md ol {
  list-style: decimal !important;
  margin: 4px 0 4px 20px !important;
  padding: 0 !important;
}

#chatbox .msg .cb-md li {
  margin: 2px 0 !important;
  padding: 0 !important;
}

#chatbox .msg .cb-md h1,
#chatbox .msg .cb-md h2,
#chatbox .msg .cb-md h3,
#chatbox .msg .cb-md h4,
#chatbox .msg .cb-md h5,
#chatbox .msg .cb-md h6 {
  margin: 3px 0 !important;
  padding: 0 !important;
  font-size: 1em !important;
  line-height: 1.2 !important;
  font-weight: 700 !important;
}

#chatbox .msg .cb-md img {
  max-height: 22px;
  vertical-align: middle;
}

/* Messages /me */
#chatbox > p.ppk-cb-me-row {
  margin: 0 !important;
  padding: 0 !important;
  text-align: left !important;
  clear: both !important;
}

#chatbox > p.ppk-cb-me-row .date-and-time,
#chatbox > p.ppk-cb-me-row .user-msg,
#chatbox > p.ppk-cb-me-row .username,
#chatbox > p.ppk-cb-me-row .chatbox-username,
#chatbox > p.ppk-cb-me-row .avatar,
#chatbox > p.ppk-cb-me-row > img {
  display: none !important;
}

#chatbox > p.ppk-cb-me-row .msg,
#chatbox > p.ppk-cb-me-row .ppk-cb-me-msg {
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  margin-left: 0 !important;
  padding-left: 0 !important;
  text-indent: 0 !important;
  float: none !important;
  text-align: left !important;
  font-weight: 700 !important;
}

#chatbox > p.ppk-cb-me-row .ppk-cb-me {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
  font-weight: 700 !important;
}
    `;

    document.head.appendChild(style);
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function startsWithAuthorName(text, author) {
    if (!text || !author) return false;
    if (text.indexOf(author) !== 0) return false;

    var nextChar = text.charAt(author.length);

    return (
      !nextChar ||
      /\s|[.,;:!?~\-–—]/.test(nextChar)
    );
  }

  function rowHasNormalUserPrefix(msg) {
    var row = msg && msg.closest ? msg.closest('#chatbox > p') : null;
    if (!row) return false;

    var selectors = [
      '.user-msg',
      '.username',
      '.chatbox-username',
      '.user',
      'a[href*="/u"]',
      'a[href*="profile"]',
      'strong',
      'b'
    ];

    for (var i = 0; i < selectors.length; i += 1) {
      var el = row.querySelector(selectors[i]);

      if (el && !msg.contains(el)) {
        return true;
      }
    }

    return /\s:\s/.test(String(row.textContent || ''));
  }

  function getChatboxAuthor(msg) {
    var row = msg && msg.closest ? msg.closest('#chatbox > p') : null;
    if (!row) return '';

    var selectors = [
      '.user-msg a',
      '.user-msg strong',
      '.user-msg span',
      '.username',
      '.chatbox-username',
      '.user',
      'a[href*="/u"]',
      'a[href*="profile"]',
      'strong',
      'b'
    ];

    for (var i = 0; i < selectors.length; i += 1) {
      var el = row.querySelector(selectors[i]);

      if (!el || msg.contains(el)) continue;

      var text = String(el.textContent || '')
        .replace(/^\s*\*/, '')
        .replace(/^[^\wÀ-ÿ]+/, '')
        .replace(/\s+\d{1,2}:\d{2}(?::\d{2})?.*$/, '')
        .replace(/\s*:\s*$/, '')
        .trim();

      if (!text) continue;
      if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(text)) continue;

      return normalizeText(text);
    }

    return '';
  }

  function looksLikeUnstarredMeAction(source) {
    var text = String(source || '').trim();

    if (!text) return false;
    if (hasMarkdownSyntax(text)) return false;

    var words = text.split(/\s+/);

    if (words.length < 2) return false;
    if (/[:：]$/.test(words[0])) return false;

    return true;
  }

  function getForumactifMeActionInfo(msg, source) {
    var row = msg && msg.closest ? msg.closest('#chatbox > p') : null;
    if (!row) {
      return {
        isMe: false,
        text: ''
      };
    }

    var raw = String(source || '').trim();

    if (!raw) {
      return {
        isMe: false,
        text: ''
      };
    }

    var hasNormalPrefix = rowHasNormalUserPrefix(msg);
    var author = getChatboxAuthor(msg);
    var msgText = normalizeText(raw);

    /*
      Cas avec étoile :
      * Jasmin teste un truc
      *Jasmin teste un truc
    */
    if (msgText.charAt(0) === '*') {
      var msgWithoutStar = msgText.replace(/^\*\s*/, '').replace(/\s*\*$/, '');

      if (author && startsWithAuthorName(msgWithoutStar, author)) {
        return {
          isMe: true,
          text: raw
        };
      }

      /*
        Sur Forumactif, un /me peut ne pas avoir de bloc username classique.
        Dans ce cas, si ça commence par une seule étoile, on le traite comme un /me.
        On évite **gras**.
      */
      if (!hasNormalPrefix && !/^\s*\*\*/.test(raw)) {
        return {
          isMe: true,
          text: raw
        };
      }
    }

    /*
      Cas sans étoile visible :
      Jasmin teste un truc

      C'est le cas que tu montres dans ta capture.
      On le prend seulement si la ligne n'a pas de préfixe utilisateur classique.
    */
    if (!hasNormalPrefix && looksLikeUnstarredMeAction(raw)) {
      return {
        isMe: true,
        text: raw
      };
    }

    return {
      isMe: false,
      text: raw
    };
  }

  function formatMeActionMessage(msg, source) {
    var row = msg && msg.closest ? msg.closest('#chatbox > p') : null;
    if (!row) return;

    var text = String(source || msg.textContent || '')
      .replace(/\u00a0/g, ' ')
      .replace(/^\s*\*\s*/, '')
      .replace(/\s*\*\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) return;

    row.classList.add('ppk-cb-me-row');
    msg.classList.add('ppk-cb-me-msg');

    msg.dataset.ppkMarkdownRendered = '1';
    msg.dataset.ppkMeFormatted = '1';

    msg.innerHTML = '';

    var span = document.createElement('span');
    span.className = 'ppk-cb-me';
    span.textContent = '* ' + text;

    msg.appendChild(span);
  }

  function isSystemOrDeletedMessage(msg) {
    if (!msg) return true;

    var row = msg.closest ? msg.closest('#chatbox > p') : null;
    if (!row) return true;

    var text = normalizeText(msg.textContent);

    if (
      msg.querySelector('span[style*="color:green"], span[style*="color:red"]') ||
      text.includes('a rejoint le chat') ||
      text.includes('est arrive') ||
      text.includes('s est deconnecte') ||
      text.includes('s’est deconnecte') ||
      text.includes('est parti') ||
      text.includes('supprime') ||
      text.includes('deleted')
    ) {
      return true;
    }

    return false;
  }

  function hasMarkdownSyntax(source) {
    return (
      /(^|\n)\s{0,3}#{1,6}\s+\S/.test(source) ||
      /(^|\n)\s{0,3}>\s+\S/.test(source) ||
      /(^|\n)\s*([-*+]\s+\S|\d+\.\s+\S)/.test(source) ||
      /```[\s\S]*?```/.test(source) ||
      /`[^`\n]+`/.test(source) ||

      /\*\*[^*\n]+?\*\*/.test(source) ||
      /__[^_\n]+?__/.test(source) ||

      /\*[^*\s](?:[^*\n]*?[^*\s])?\*/.test(source) ||
      /_[^_\s](?:[^_\n]*?[^_\s])?_/.test(source) ||

      /~~[^~\n]+?~~/.test(source) ||
      /\[[^\]\n]+?\]\((https?:\/\/|\/)[^)]+?\)/i.test(source)
    );
  }

  function extractMarkdownSource(msg) {
    var clone = msg.cloneNode(true);
    var placeholders = [];

    clone.querySelectorAll('script, style').forEach(function (el) {
      el.remove();
    });

    clone.querySelectorAll('img').forEach(function (img) {
      var token = 'PPKCBMDIMG' + placeholders.length + 'X';

      placeholders.push({
        token: token,
        html: img.outerHTML
      });

      img.replaceWith(document.createTextNode(token));
    });

    clone.querySelectorAll('br').forEach(function (br) {
      br.replaceWith(document.createTextNode('\n'));
    });

    clone.querySelectorAll('div, p, blockquote, li').forEach(function (el) {
      if (el !== clone) {
        el.appendChild(document.createTextNode('\n'));
      }
    });

    var source = String(clone.textContent || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      source: source,
      placeholders: placeholders
    };
  }

  function restoreImagePlaceholders(root, placeholders) {
    if (!root || !placeholders.length) return;

    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    var textNodes = [];
    var node;

    while ((node = walker.nextNode())) {
      var value = node.nodeValue || '';

      if (placeholders.some(function (item) {
        return value.includes(item.token);
      })) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(function (textNode) {
      var text = textNode.nodeValue || '';
      var fragment = document.createDocumentFragment();

      while (text.length) {
        var nextPlaceholder = null;
        var nextIndex = -1;

        placeholders.forEach(function (item) {
          var index = text.indexOf(item.token);

          if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
            nextIndex = index;
            nextPlaceholder = item;
          }
        });

        if (!nextPlaceholder) {
          fragment.appendChild(document.createTextNode(text));
          break;
        }

        if (nextIndex > 0) {
          fragment.appendChild(document.createTextNode(text.slice(0, nextIndex)));
        }

        var tmp = document.createElement('span');

        tmp.innerHTML = DOMPurify.sanitize(nextPlaceholder.html, {
          ALLOWED_TAGS: ['img'],
          ALLOWED_ATTR: ['src', 'alt', 'title', 'class', 'width', 'height']
        });

        Array.from(tmp.childNodes).forEach(function (child) {
          fragment.appendChild(child);
        });

        text = text.slice(nextIndex + nextPlaceholder.token.length);
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  function secureMarkdownLinks(root) {
    if (!root) return;

    root.querySelectorAll('a[href]').forEach(function (link) {
      var href = String(link.getAttribute('href') || '').trim();

      if (/^(javascript:|data:|vbscript:)/i.test(href)) {
        link.replaceWith(document.createTextNode(link.textContent || href));
        return;
      }

      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer nofollow');
    });
  }

  function renderMarkdownMessage(msg) {
    if (!msg || msg.dataset.ppkMarkdownRendered === '1') return;
    if (isSystemOrDeletedMessage(msg)) return;

    if (msg.querySelector('.cb-md')) {
      msg.dataset.ppkMarkdownRendered = '1';
      return;
    }

    var extracted = extractMarkdownSource(msg);
    var source = extracted.source;

    if (!source) return;

    var meActionInfo = getForumactifMeActionInfo(msg, source);

    if (meActionInfo.isMe) {
      formatMeActionMessage(msg, meActionInfo.text);
      return;
    }

    if (!hasMarkdownSyntax(source)) return;

    var renderedHtml = '';

    try {
      renderedHtml = marked.parse(source);
    } catch (e) {
      console.error('[CB Markdown] Erreur de parsing Markdown.', e);
      return;
    }

    var cleanHtml = DOMPurify.sanitize(renderedHtml, {
      FORBID_TAGS: [
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'textarea',
        'select',
        'video',
        'audio',
        'canvas',
        'svg',
        'math',
        'img'
      ],
      FORBID_ATTR: ['style']
    });

    msg.dataset.ppkMarkdownRendered = '1';
    msg.innerHTML = '<div class="cb-md">' + cleanHtml + '</div>';

    var wrapper = msg.querySelector('.cb-md');

    restoreImagePlaceholders(wrapper, extracted.placeholders);
    secureMarkdownLinks(wrapper);
  }

  function renderAllMarkdownMessages() {
    if (!window.marked || !window.DOMPurify) return;

    document.querySelectorAll('#chatbox > p .msg').forEach(function (msg) {
      renderMarkdownMessage(msg);
    });
  }

  function queueRender() {
    if (renderQueued) return;

    renderQueued = true;

    requestAnimationFrame(function () {
      renderQueued = false;
      renderAllMarkdownMessages();
    });
  }

  function observeChatbox() {
    var chatRoot = document.querySelector('#chatbox');
    if (!chatRoot) return;

    if (window.__PPK_CB_MARKDOWN_OBSERVER__) {
      window.__PPK_CB_MARKDOWN_OBSERVER__.disconnect();
    }

    window.__PPK_CB_MARKDOWN_OBSERVED_ROOT__ = chatRoot;

    window.__PPK_CB_MARKDOWN_OBSERVER__ = new MutationObserver(function () {
      queueRender();
    });

    window.__PPK_CB_MARKDOWN_OBSERVER__.observe(chatRoot, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function patchChatboxRefresh() {
    if (
      !window.Chatbox ||
      !Chatbox.prototype ||
      !Chatbox.prototype.refresh ||
      Chatbox.prototype.refresh.__PPK_CB_MARKDOWN_PATCHED__
    ) {
      return;
    }

    var originalRefresh = Chatbox.prototype.refresh;

    Chatbox.prototype.refresh = function (data) {
      var result = originalRefresh.apply(this, arguments);

      queueRender();
      setTimeout(queueRender, 50);
      setTimeout(queueRender, 150);

      return result;
    };

    Chatbox.prototype.refresh.__PPK_CB_MARKDOWN_PATCHED__ = true;
  }

  function bootMarkdown() {
    injectMarkdownStyles();

    Promise.all([
      loadScript('ppk-marked-lib', MARKED_URL, 'marked'),
      loadScript('ppk-dompurify-lib', DOMPURIFY_URL, 'DOMPurify')
    ])
      .then(function () {
        marked.setOptions({
          gfm: true,
          breaks: true
        });

        patchChatboxRefresh();
        renderAllMarkdownMessages();
        observeChatbox();

        setInterval(function () {
          patchChatboxRefresh();
          renderAllMarkdownMessages();

          var currentRoot = document.querySelector('#chatbox');

          if (
            currentRoot &&
            currentRoot !== window.__PPK_CB_MARKDOWN_OBSERVED_ROOT__
          ) {
            observeChatbox();
          }
        }, 1200);
      })
      .catch(function (error) {
        console.error('[CB Markdown] Impossible de charger le Markdown.', error);
      });
  }

  bootMarkdown();
});