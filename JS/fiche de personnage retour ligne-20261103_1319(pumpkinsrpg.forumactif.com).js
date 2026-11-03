function ppkUpdateInfoXLAlignment() {
  var blocks = document.querySelectorAll('.fc-info-xl');

  blocks.forEach(function(block) {
    var label = block.querySelector('.fc-info-xl-t');
    var value = block.querySelector('.fc-info-xl-t + span');

    if (!label || !value) return;

    block.classList.remove('is-wrapped');
    value.style.textAlign = 'right';

    var text = value.textContent ? value.textContent.trim() : '';
    if (!text) return;

    var range = document.createRange();
    range.selectNodeContents(value);

    var rects = Array.from(range.getClientRects()).filter(function(rect) {
      return rect.width > 0 && rect.height > 0;
    });

    if (rects.length > 1) {
      block.classList.add('is-wrapped');
      value.style.textAlign = 'left';
    } else {
      block.classList.remove('is-wrapped');
      value.style.textAlign = 'right';
    }
  });
}

window.addEventListener('load', ppkUpdateInfoXLAlignment);
window.addEventListener('resize', ppkUpdateInfoXLAlignment);