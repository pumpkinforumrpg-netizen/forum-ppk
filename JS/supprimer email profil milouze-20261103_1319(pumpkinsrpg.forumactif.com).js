if(/^\/u/.test(location.pathname))
$(function(){
$('.liens-profil a[href^="/profile?mode=email&u"]').closest('div').remove();
$(this).find('.separator:first').remove();
});