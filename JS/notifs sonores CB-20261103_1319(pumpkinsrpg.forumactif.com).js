window.localStorage && $(window).load(function() {
    var sounds = {
	  'cat': 'https://pumpkinforumrpg-netizen.github.io/ppk/u_6ekfl947a2-cat-meow-297927.mp3',
	  'catWOW': 'https://pumpkinforumrpg-netizen.github.io/ppk/x_bass6668-funny-meow-110120.mp3',
      'future': 'https://illiweb.com/fa/fdf/future.mp3',
      'hal': 'https://illiweb.com/fa/fdf/hal.mp3',
      'secret': 'https://illiweb.com/fa/fdf/secret.mp3',
      };
    var default_sound = sounds['cat'];
    var default_freq = 'new';
    var default_when = 'once';
    var default_volume = 100;
 
 
    if(localStorage.cb_sound && !localStorage.cb_sound.indexOf('https://dl.dropboxusercontent.com/u/181621985/')) localStorage.removeItem('cb_sound');
    var a = document.createElement('audio');
    if(!a.canPlayType) return;
    a.volume = Math.min(1, Math.max(0, localStorage.cb_volume||(default_volume/100)));
 
    var origin_send = Chatbox.prototype.send;
    Chatbox.prototype.send = function(params) {
      var m = $.trim($("#message").val());
      if(m.indexOf('/sound')&&m.indexOf('/soudn'))
        return origin_send.call(this, params);
      m = $.trim(m.substr(6)).split(/\s+/,3);
      var bad_apple = false;
      switch(m[0].toLowerCase()) {
        case "":
          if(!a.src) {
            a.src = localStorage.cb_sound||default_sound;
            a.load();
        }
          a.play();
          break;
        case "all":
        case "new":
          localStorage.cb_freq = m[0]; break;
        case "always":
        case "off":
        case "on":
        case "once":
        case "never":
          localStorage.cb_when = m[0]; break;
        case "stop":
          if(!a.paused) a.pause();
          if(!a.ended && a.readyState > 0) a.currentTime = 0;
          break;
        case "pause":
          if(!a.paused) a.pause();
          break;
        case "volume":
          if(m.length>1) {
            localStorage.cb_volume = Math.min(1, Math.max(0, parseFloat(m[1].replace(',','.'))/100));
            a.volume = localStorage.cb_volume;
            break
          }
        default:
          bad_apple = true;
      };
      if(bad_apple) {
        if(m[0] in sounds) {
          m[0]= sounds[m[0]];
        }
        if(m[0]=="default") {
          m[0]=default_sound;
          localStorage.removeItem('cb_sound');
          localStorage.removeItem('cb_freq');
          localStorage.removeItem('cb_volume');
          localStorage.removeItem('cb_when');
          a.volume = Math.min(1, Math.max(0, default_volume/100));
        }
        if(/^https?:\/\/.+/.test(m[0])) {
          localStorage.cb_sound = m[0];
          a.pause();
          a.src = m[0];
          a.load();
          a.play();
        } else {
          var message = $('#message').val();
          alert('/sound [all | new]\n/sound [always | off | on | once | never]\n/sound [stop | pause]\n/sound default\n/sound volume 0-100\n/sound ['+$.map(sounds,function(_,k){return k}).join(' | ')+']\n/sound [http://* | https://*]');
          setTimeout(function(){ $("#message").val(message).select().focus(); }, 100);
          return;
        }
      }
      return $("#message").val('').focus();
    };
 
    $(window).on("focus", function(){ localStorage.removeItem('cb_once'); localStorage.removeItem('cb_blurred') }).on("blur", function(){ localStorage.cb_blurred=1; });
 
    var play_sound = function(){
      if(a.paused || a.ended) {
        if(a.readyState > 0) a.currentTime=0;
        if(!a.src) {
          a.src = localStorage.cb_sound||default_sound;
          a.load()
        }
        a.play()
      }
    };
    var overrided = Chatbox.prototype.refresh;
    Chatbox.prototype.refresh = function(data) {
      if (data.messages && data.messages.length) {
        var lm = data.messages.slice(-1)[0];
        var last_message = lm.time+','+lm.action+','+lm.msg;
        if(this.last_message_sound != last_message) {
          var user = $.grep(data.users, function(v){return v.id==chatbox.userId});
          user = user.length ? user[0] : [{}];
          if(this.last_message_sound!==undefined) {
            var freq = (localStorage.cb_freq||default_freq);
            var when = (localStorage.cb_when||default_when);
            if(when != "never" && (when != "off" || localStorage.cb_blurred) && (when != "on" || !localStorage.cb_blurred) && (when != "once" || (localStorage.cb_blurred && !localStorage.cb_once))) {
              if(freq =="all" || (lm.userId!=chatbox.userId && user.username!=lm.username)) {
                if(when!="once" || !localStorage.cb_once) {
                  play_sound();
                  localStorage.cb_once = 1;
                }
              }
            }
          }
          this.last_message_sound = lm;
        }
      }
      overrided.call(this, data);
    };
});