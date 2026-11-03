if ((window.location.href.indexOf("/post") != -1) || (window.location.href.indexOf("/privmsg") != -1) || (window.location.href.indexOf("/profile") != -1) ) {
    $("meta[http-equiv='refresh'][content]:first").each(function() {
            window.location.href=$(this).attr("content").replace(/^.*;url=/, "");
        });
}