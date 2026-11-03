$(function(){
  var overrided = Chatbox.prototype.refresh;
  Chatbox.prototype.refresh = function(data) {
    overrided.call(this, data);
    $('.chatbox-username').each(function(){
      this.previousSibling&&$.trim(this.previousSibling.nodeValue)=="@"&&$(this.previousSibling).replaceWith('✦ ')
        })
      };
});