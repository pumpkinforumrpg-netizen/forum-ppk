$(function(){
$.get($("#newest_user a[href^='/u']")[0].href,function(d){
(a=$("#user_avatar img",$(d))).length&&$("#lastuser_avatar").html(a);})
});