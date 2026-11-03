document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".codeppk").forEach(function (block) {
    if (block.dataset.copyInit === "1") return;
    block.dataset.copyInit = "1";

    var textarea = block.querySelector(".code-input");
    if (!textarea) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-code-btn fa-tip";
    btn.setAttribute("data-tip", "copier le code");
    btn.setAttribute("aria-label", "Copier le code");
    btn.innerHTML = '<i class="fa fa-copy" aria-hidden="true"></i>';

    btn.addEventListener("click", function (e) {
      e.preventDefault();

      var text = textarea.value || textarea.textContent;

      function copiedState() {
        btn.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
        btn.setAttribute("data-tip", "copié");

        clearTimeout(btn._copyTimer);
        btn._copyTimer = setTimeout(function () {
          btn.innerHTML = '<i class="fa fa-copy" aria-hidden="true"></i>';
          btn.setAttribute("data-tip", "copier le code");
        }, 1500);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(copiedState);
      } else {
        textarea.removeAttribute("disabled");
        textarea.select();
        document.execCommand("copy");
        textarea.setAttribute("disabled", "disabled");
        copiedState();
      }
    });

    block.appendChild(btn);
  });
});