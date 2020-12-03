"use strict";

$(document).ready(() => {
    $("#baord_file").on("change", (e) => {
        let file = $(e.currentTarget)[0].files[0];
        let form = new FormData();
        form.append("file", file);
        $(".loading").css("display", "flex").animate({
            opacity: 1
        }, 500);

        $.ajax({
            type: "POST",
            url: "/load",
            data: form,
            processData: false,
            contentType: false,
            success: function(data){
                window.location = `/b/${data}`;
            }
        });
    });
});