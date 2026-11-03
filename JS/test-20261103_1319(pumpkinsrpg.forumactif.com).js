$(function(){
  $(document).ready( function(){
        if(_userdata.session_logged_in != 0){
         var userName = _userdata.username,
            userId = _userdata.user_id,
            userAvatar = _userdata.avatar,
            divPseudo = 'Bonjour <a href="/u'+ userId +'">'+ userName +'</a></div>';
         $('.user-connected .fa_avatar').append(userAvatar);
        }else{
           $('#barre-infos-connecte').addClass('m-d-none');
        }
      
   });

});