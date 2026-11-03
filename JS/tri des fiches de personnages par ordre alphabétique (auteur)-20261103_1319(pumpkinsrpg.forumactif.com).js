$(function () {

    const FORUM_ID = 21;
    const MAX_PAGES = 100;

    /* Uniquement f21 */
    const forumRegex = new RegExp(
        '^/f' + FORUM_ID + '(?:p\\d+)?(?:-|$)',
        'i'
    );

    if (!forumRegex.test(location.pathname)) return;

    const container = document.querySelector('.liste-wrap-topics');

    if (!container) {
        console.warn('[F21 A-Z] Liste des sujets introuvable.');
        return;
    }


    /* =========================================================
       TRI ALPHABÉTIQUE FRANÇAIS
       ========================================================= */

    const collator = new Intl.Collator('fr', {
        sensitivity: 'base',
        numeric: true,
        ignorePunctuation: true
    });


    /* =========================================================
       OUTILS
       ========================================================= */

    function normalizeForumUrl(url, baseUrl) {

        const parsed = new URL(
            url,
            baseUrl || location.href
        );

        return parsed.origin + parsed.pathname;

    }


    function isF21(url) {

        try {

            const parsed = new URL(
                url,
                location.origin
            );

            return (
                parsed.origin === location.origin &&
                forumRegex.test(parsed.pathname)
            );

        } catch (e) {

            return false;

        }

    }


    /*
     * Annonces / sujets épinglés.
     *
     * Ils restent en haut et ne participent pas
     * au classement alphabétique.
     */
    function isPinned(row) {

        return (
            row.classList.contains('folder_global') ||
            row.classList.contains('folder_announce') ||
            row.classList.contains('folder_sticky')
        );

    }


    /*
     * Auteur réel du sujet.
     */
    function getAuthor(row) {

        const link = row.querySelector('.auteursj a');

        if (link) {
            return link.textContent.trim();
        }

        const block = row.querySelector('.auteursj');

        if (!block) return '';

        return block.textContent
            .replace(/^\s*par\s+/i, '')
            .trim();

    }


    /*
     * Titre du sujet.
     * Sert uniquement si un auteur possède plusieurs sujets.
     */
    function getTitle(row) {

        const title = row.querySelector('.titresj');

        return title
            ? title.textContent.trim()
            : '';

    }


    /*
     * Cherche les pages suivantes/précédentes de f21.
     */
    function getPaginationUrls(doc, baseUrl) {

        const urls = new Set();

        doc.querySelectorAll('a[href]')
            .forEach(function (link) {

                const href = link.getAttribute('href');

                if (!href) return;

                try {

                    const absolute = new URL(
                        href,
                        baseUrl
                    );


                    if (!isF21(absolute.href)) {
                        return;
                    }


                    /*
                     * Pages Forumactif :
                     * /f21p50-...
                     * /f21p100-...
                     * etc.
                     */
                    const paginationRegex =
                        new RegExp(
                            '^/f' +
                            FORUM_ID +
                            'p\\d+(?:-|$)',
                            'i'
                        );


                    if (
                        paginationRegex.test(
                            absolute.pathname
                        )
                    ) {

                        urls.add(
                            normalizeForumUrl(
                                absolute.href,
                                baseUrl
                            )
                        );

                    }

                } catch (e) {
                    // lien invalide : on ignore
                }

            });


        return Array.from(urls);

    }


    /* =========================================================
       CONSTRUCTION
       ========================================================= */

    async function buildAlphabeticalList() {

        const loader = document.createElement('div');

        loader.id = 'f21-alpha-loader';

        loader.textContent =
            'Chargement et classement des sujets…';

        loader.style.cssText = [
            'padding:10px 15px',
            'margin:10px 0',
            'text-align:center',
            'font-size:12px',
            'opacity:.7'
        ].join(';');


        container.parentNode.insertBefore(
            loader,
            container
        );


        /*
         * SIMPLE TABLEAU.
         *
         * Aucun contrôle de doublon.
         * Chaque sujet rencontré est conservé.
         */
        const topics = [];


        /*
         * Ce Set concerne UNIQUEMENT les pages visitées.
         *
         * Il empêche le script de charger :
         * page 1 → page 2 → page 1 → page 2...
         *
         * Il ne supprime absolument aucun sujet.
         */
        const visitedPages = new Set();

        const queue = [];


        const currentUrl =
            normalizeForumUrl(
                location.href,
                location.href
            );


        /* =====================================================
           ANALYSE D'UNE PAGE
           ===================================================== */

        function processDocument(doc, pageUrl) {

            /*
             * On prend tous les sujets normaux,
             * sans aucune vérification de doublon.
             */
            doc.querySelectorAll('.topicslist_row')
                .forEach(function (row) {

                    if (isPinned(row)) {
                        return;
                    }


                    /*
                     * On conserve exactement cette ligne.
                     */
                    const clone =
                        document.importNode(
                            row,
                            true
                        );


                    topics.push(clone);

                });


            /*
             * Recherche des autres pages de f21.
             */
            getPaginationUrls(doc, pageUrl)
                .forEach(function (url) {

                    if (
                        !visitedPages.has(url) &&
                        !queue.includes(url)
                    ) {

                        queue.push(url);

                    }

                });

        }


        /* =====================================================
           PAGE ACTUELLE
           ===================================================== */

        visitedPages.add(currentUrl);

        processDocument(
            document,
            currentUrl
        );


        /* =====================================================
           CHARGEMENT DES AUTRES PAGES
           ===================================================== */

        let loadedPages = 1;


        while (
            queue.length > 0 &&
            loadedPages < MAX_PAGES
        ) {

            const pageUrl = queue.shift();


            if (visitedPages.has(pageUrl)) {
                continue;
            }


            visitedPages.add(pageUrl);


            try {

                const response = await fetch(
                    pageUrl,
                    {
                        credentials: 'same-origin',
                        cache: 'no-store'
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        'HTTP ' +
                        response.status
                    );

                }


                const html =
                    await response.text();


                const doc =
                    new DOMParser()
                        .parseFromString(
                            html,
                            'text/html'
                        );


                processDocument(
                    doc,
                    pageUrl
                );


                loadedPages++;


                loader.textContent =
                    'Chargement des sujets… ' +
                    topics.length +
                    ' récupérés';


            } catch (error) {

                console.error(
                    '[F21 A-Z]',
                    'Impossible de charger :',
                    pageUrl,
                    error
                );


                loader.textContent =
                    'Impossible de charger toutes les pages de f21.';


                setTimeout(function () {
                    loader.remove();
                }, 3000);


                return;

            }

        }


        /* =====================================================
           TRI
           ===================================================== */

        topics.sort(function (a, b) {

            const authorA = getAuthor(a);
            const authorB = getAuthor(b);


            /*
             * 1. Auteur
             */
            const authorComparison =
                collator.compare(
                    authorA,
                    authorB
                );


            if (authorComparison !== 0) {
                return authorComparison;
            }


            /*
             * 2. Si même auteur :
             * titre du sujet
             */
            return collator.compare(
                getTitle(a),
                getTitle(b)
            );

        });


        /* =====================================================
           ON RETIRE LES SUJETS DE LA PAGE ACTUELLE
           ===================================================== */

        container
            .querySelectorAll('.topicslist_row')
            .forEach(function (row) {

                /*
                 * On garde les annonces.
                 */
                if (!isPinned(row)) {
                    row.remove();
                }

            });


        /* =====================================================
           SÉPARATEURS
           ===================================================== */

        const separators =
            container.querySelectorAll(
                '.topic_separator'
            );


        /*
         * On conserve le premier séparateur seulement.
         */
        Array.from(separators)
            .slice(1)
            .forEach(function (separator) {

                separator.remove();

            });


        /* =====================================================
           RÉINSERTION DES SUJETS TRIÉS
           ===================================================== */

        const fragment =
            document.createDocumentFragment();


        topics.forEach(function (topic) {

            fragment.appendChild(topic);

        });


        container.appendChild(fragment);


        /* =====================================================
           PAGINATION GÉNÉRALE
           ===================================================== */

        /*
         * Comme tous les sujets sont maintenant affichés
         * sur une seule page, on masque uniquement
         * la pagination DU SOUS-FORUM.
         *
         * Les paginations à l'intérieur d'un sujet
         * (1, 2, 3...) sont conservées.
         */
        document
            .querySelectorAll('.pagination')
            .forEach(function (pagination) {

                if (
                    !pagination.closest(
                        '.topicslist_row'
                    )
                ) {

                    pagination.style.display =
                        'none';

                }

            });


        /* =====================================================
           TERMINÉ
           ===================================================== */

        loader.textContent =
            topics.length +
            ' sujets classés par auteur';


        setTimeout(function () {

            loader.remove();

        }, 2000);


        console.log(
            '[F21 A-Z]',
            topics.length,
            'sujets récupérés sur',
            loadedPages,
            'page(s).'
        );

    }


    buildAlphabeticalList();

});