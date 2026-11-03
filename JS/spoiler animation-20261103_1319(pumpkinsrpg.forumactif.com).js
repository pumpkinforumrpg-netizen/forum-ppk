$(function () {
  $('.spoiler').each(function () {
    var spoiler = this;
    var title = spoiler.querySelector('.spoiler_title');
    var dd = spoiler.querySelector('dd');
    var content = spoiler.querySelector('.spoiler_content');

    if (!title || !dd || !content) return;

    content.removeAttribute('hidden');

    spoiler.classList.remove('is-open');
    dd.style.maxHeight = '0px';

    title.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      var isOpen = spoiler.classList.contains('is-open');

      if (isOpen) {
        dd.style.maxHeight = dd.scrollHeight + 'px';

        requestAnimationFrame(function () {
          spoiler.classList.remove('is-open');
          dd.style.maxHeight = '0px';
        });
      } else {
        spoiler.classList.add('is-open');
        dd.style.maxHeight = dd.scrollHeight + 'px';
      }
    }, true);

    dd.addEventListener('transitionend', function () {
      if (spoiler.classList.contains('is-open')) {
        dd.style.maxHeight = 'none';
      }
    });
  });
});