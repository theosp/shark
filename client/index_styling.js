$(window).resize(function () {
    // if the slider exists update its positioning
    $s = $(".size");
    if ($s.length > 0) {
        $s.width($(".create").position().left - $s.position().left - 15);
        $s.val(CONFIG.default_table_size);
        $s.slider({min: CONFIG.min_table_size, max: CONFIG.max_table_size, value: CONFIG.default_table_size});
    }
});
