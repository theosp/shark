$(window).resize(function () {
    $s = $(".slider");
    $s.width($s.siblings("button").position().left - $s.position().left - 15);
});
