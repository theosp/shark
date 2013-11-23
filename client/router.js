var router = function () {
    var route;

    if ((route = /\/table\/(.+?)\//.exec(document.location.pathname)) !== null) {
        Session.set("table", route[1]); 
    } else {
        Session.set("table", false);
    }
};

// Make internal events use pushState and our router instead of their default
// behavior
$(window).ready(function () {
    $("body").on("click", "a", function (e) {
        var href = $(this).attr("href");

        if (href[0] === "/") {
            window.history.pushState("", "", href);

            router();

            e.preventDefault();
        }
    })
});


// trigger router on popstate
$(window).bind('popstate',  function (event) {
    router();
});
