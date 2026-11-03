(function () {
  function closest(el, selector) {
    while (el && el !== document) {
      if (el.matches && el.matches(selector)) {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }

  function closeDropdown(dropdown, content) {
    dropdown.classList.remove('active');
    content.style.maxHeight = '0px';
  }

  function openDropdown(dropdown, content) {
    dropdown.classList.add('active');
    content.style.maxHeight = content.scrollHeight + 'px';
  }

  document.addEventListener('click', function (e) {
    var head = closest(e.target, '.rpg-dropdown__head');

    if (!head) {
      return;
    }

    var dropdown = closest(head, '.rpg-dropdown');

    if (!dropdown) {
      return;
    }

    var content = dropdown.querySelector('.rpg-dropdown__content');

    if (!content) {
      return;
    }

    e.preventDefault();

    if (dropdown.classList.contains('active')) {
      closeDropdown(dropdown, content);
    } else {
      openDropdown(dropdown, content);
    }
  });

  window.addEventListener('resize', function () {
    var dropdowns = document.querySelectorAll('.rpg-dropdown.active');

    for (var i = 0; i < dropdowns.length; i++) {
      var content = dropdowns[i].querySelector('.rpg-dropdown__content');

      if (content) {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    }
  });
})();