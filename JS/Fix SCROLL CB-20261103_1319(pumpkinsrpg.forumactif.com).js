jQuery(function ($) {
  const BOTTOM_THRESHOLD = 60;

  /*
   * État conservé séparément pour chaque document de Chatbox.
   * Cela permet de gérer :
   * - la CB plein écran / page /chatbox
   * - la CB dans l'iframe #chatboxpop
   */
  const states = new WeakMap();

  function initChatboxAutoScroll(doc) {
    if (!doc) return;

    const win = doc.defaultView;
    if (!win) return;

    let state = states.get(doc);

    if (!state) {
      state = {
        chatbox: null,
        observer: null,
        rootObserver: null,

        stickToBottom: true,
        autoScrolling: false,

        scrollHandler: null,
        resizeHandler: null,
        visibilityHandler: null,
        pageshowHandler: null
      };

      states.set(doc, state);
    }

    function getChatbox() {
      return doc.querySelector('#chatbox');
    }

    function distanceFromBottom(chatbox) {
      if (!chatbox) return Infinity;

      return (
        chatbox.scrollHeight -
        chatbox.scrollTop -
        chatbox.clientHeight
      );
    }

    function isNearBottom(chatbox) {
      return distanceFromBottom(chatbox) <= BOTTOM_THRESHOLD;
    }

    function scrollToBottom(force = false) {
      const chatbox = getChatbox();
      if (!chatbox) return;

      if (!force && !state.stickToBottom) return;

      state.autoScrolling = true;

      requestAnimationFrame(function () {
        chatbox.scrollTop = chatbox.scrollHeight;

        requestAnimationFrame(function () {
          state.autoScrolling = false;
        });
      });
    }

    function scheduleBottomRefresh() {
      if (!state.stickToBottom) return;

      /*
       * Plusieurs passages volontairement :
       * Forumactif peut injecter les messages, puis les avatars,
       * puis modifier les dimensions quelques ms plus tard.
       */
      scrollToBottom();

      setTimeout(function () {
        scrollToBottom();
      }, 50);

      setTimeout(function () {
        scrollToBottom();
      }, 150);

      setTimeout(function () {
        scrollToBottom();
      }, 350);
    }

    function bindChatbox() {
      const chatbox = getChatbox();

      if (!chatbox) return false;

      /*
       * Rien à refaire si on observe déjà exactement
       * le même élément #chatbox.
       */
      if (state.chatbox === chatbox) {
        return true;
      }

      /*
       * L'ancien #chatbox a pu être remplacé par Forumactif
       * lors d'un refresh AJAX.
       */
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
      }

      if (state.chatbox && state.scrollHandler) {
        state.chatbox.removeEventListener(
          'scroll',
          state.scrollHandler
        );
      }

      state.chatbox = chatbox;

      /*
       * À chaque nouveau #chatbox, on repart en bas.
       */
      state.stickToBottom = true;

      state.scrollHandler = function () {
        if (state.autoScrolling) return;

        /*
         * Si l'utilisateur remonte :
         * stickToBottom devient false.
         *
         * S'il redescend jusqu'en bas :
         * stickToBottom repasse automatiquement à true.
         */
        state.stickToBottom = isNearBottom(chatbox);
      };

      chatbox.addEventListener(
        'scroll',
        state.scrollHandler,
        { passive: true }
      );

      /*
       * Surveillance des nouveaux messages et modifications
       * du contenu de la CB.
       */
      state.observer = new MutationObserver(function () {
        if (state.stickToBottom) {
          scheduleBottomRefresh();
        }
      });

      state.observer.observe(chatbox, {
        childList: true,
        subtree: true,
        characterData: true
      });

      /*
       * Au chargement initial, toujours tout en bas.
       */
      scrollToBottom(true);

      setTimeout(function () {
        scrollToBottom(true);
      }, 100);

      setTimeout(function () {
        scrollToBottom(true);
      }, 300);

      setTimeout(function () {
        scrollToBottom(true);
      }, 800);

      setTimeout(function () {
        scrollToBottom(true);
      }, 1500);

      return true;
    }

    /*
     * Forumactif peut carrément remplacer #chatbox.
     * On surveille donc également le document afin de
     * rattacher automatiquement le script au nouveau bloc.
     */
    if (!state.rootObserver) {
      state.rootObserver = new MutationObserver(function () {
        const currentChatbox = getChatbox();

        if (currentChatbox && currentChatbox !== state.chatbox) {
          bindChatbox();
        }
      });

      const root =
        doc.body ||
        doc.documentElement;

      if (root) {
        state.rootObserver.observe(root, {
          childList: true,
          subtree: true
        });
      }
    }

    /*
     * Redimensionnement / changement d'orientation.
     */
    if (!state.resizeHandler) {
      state.resizeHandler = function () {
        if (!state.stickToBottom) return;

        setTimeout(function () {
          scrollToBottom();
        }, 100);
      };

      win.addEventListener(
        'resize',
        state.resizeHandler,
        { passive: true }
      );

      win.addEventListener(
        'orientationchange',
        state.resizeHandler,
        { passive: true }
      );
    }

    /*
     * Retour sur l'onglet.
     *
     * IMPORTANT :
     * on ne redescend que si l'utilisateur était déjà
     * en mode "collé en bas".
     */
    if (!state.visibilityHandler) {
      state.visibilityHandler = function () {
        if (
          doc.visibilityState === 'visible' &&
          state.stickToBottom
        ) {
          setTimeout(function () {
            scrollToBottom();
          }, 100);

          setTimeout(function () {
            scrollToBottom();
          }, 400);
        }
      };

      doc.addEventListener(
        'visibilitychange',
        state.visibilityHandler
      );
    }

    /*
     * Gestion du retour BFCache / pageshow.
     */
    if (!state.pageshowHandler) {
      state.pageshowHandler = function () {
        if (!state.stickToBottom) return;

        setTimeout(function () {
          scrollToBottom();
        }, 100);
      };

      win.addEventListener(
        'pageshow',
        state.pageshowHandler
      );
    }

    bindChatbox();
  }

  /*
   * =====================================================
   * 1. CHATBOX PRÉSENTE DIRECTEMENT DANS LA PAGE
   * =====================================================
   */

  if (document.querySelector('#chatbox')) {
    initChatboxAutoScroll(document);
  }

  /*
   * =====================================================
   * 2. CHATBOX POPUP DANS #chatboxpop
   * =====================================================
   */

  function initPopupIframe() {
    const iframe = document.querySelector('#chatboxpop');

    if (!iframe) return;

    function bindIframe() {
      try {
        const iframeDoc =
          iframe.contentDocument ||
          iframe.contentWindow.document;

        if (
          iframeDoc &&
          iframeDoc.querySelector('#chatbox')
        ) {
          initChatboxAutoScroll(iframeDoc);
        }
      } catch (e) {
        /*
         * Sécurité si l'iframe n'est pas accessible.
         */
      }
    }

    /*
     * Si elle est déjà chargée.
     */
    bindIframe();

    /*
     * Si Forumactif recharge l'iframe.
     */
    iframe.addEventListener('load', function () {
      setTimeout(bindIframe, 50);
      setTimeout(bindIframe, 300);
      setTimeout(bindIframe, 800);
    });

    /*
     * Quand on ouvre explicitement la CB popup.
     */
    $(document).on(
      'click.ppkCbBottom',
      '#chatboxopen',
      function () {
        setTimeout(function () {
          try {
            const iframeDoc =
              iframe.contentDocument ||
              iframe.contentWindow.document;

            initChatboxAutoScroll(iframeDoc);

            const state = states.get(iframeDoc);

            if (
              state &&
              state.stickToBottom &&
              state.chatbox
            ) {
              state.autoScrolling = true;

              state.chatbox.scrollTop =
                state.chatbox.scrollHeight;

              requestAnimationFrame(function () {
                state.autoScrolling = false;
              });
            }
          } catch (e) {}
        }, 350);
      }
    );
  }

  initPopupIframe();

  /*
   * Au cas où ton script principal crée #chatboxpop
   * légèrement après celui-ci.
   */
  setTimeout(initPopupIframe, 500);
  setTimeout(initPopupIframe, 1500);
});