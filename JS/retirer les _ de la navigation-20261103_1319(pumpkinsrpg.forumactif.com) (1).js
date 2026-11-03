$(function () {
  deuxPoints = document.querySelectorAll(".nav-menu");
  if(deuxPoints) {
    deuxPoints.forEach((deuxPoint) => {
      deuxPoint.innerHTML = deuxPoint.innerHTML.replaceAll('::', ' ');
    });
   }
});