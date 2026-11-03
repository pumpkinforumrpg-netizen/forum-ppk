$(function () {
  deuxPoints = document.querySelectorAll(".nav-sjt");
  if(deuxPoints) {
    deuxPoints.forEach((deuxPoint) => {
      deuxPoint.innerHTML = deuxPoint.innerHTML.replaceAll('::', '');
    });
   }
});