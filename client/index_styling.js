$(window).resize(function () {
    // if the slider exists update its positioning
    $s = $(".size");
    if ($s.length > 0) {
        $s.width($(".create").position().left - $s.position().left - 15);
        $s.val(CONFIG.default_table_size);
        $s.slider({min: CONFIG.min_table_size, max: CONFIG.max_table_size, value: CONFIG.default_table_size});
    }

    // recalculate map height
    var map_width = Math.floor($(".map").width());
    map_width += map_width % 3;
    $(".map").width(map_width);
    $(".map").height(Math.floor($(".map").width() * 2/3));
    $(".map2").height(Math.floor($(".map2").width() * 2/3));

    var map_width = Math.floor($(".fmap").width());
    map_width -= map_width % 3;
    $(".fmap").width(map_width);
    $(".fmap").height(Math.floor($(".fmap").width() * 2/3));
});
