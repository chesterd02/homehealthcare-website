//@prepros-prepend jquery.min.js
//@prepros-prepend bootstrap.min.js

/*global jQuery:false */
(function ($) {
    $(window).load(function () {
        'use strict';

        // executes when complete page is fully loaded, including all frames, objects and images
        $('body').addClass('loaded');
    });
    $(document).ready(function () {
        'use strict';

        var adjustColHeight = function () {
            if ($('.left-right-col').length) {
                $('.left-right-col').each(function () {
                    var el = $(this),
                        imgPanel = el.find('.img-panel'),
                        txtPanel = el.find('.txt-panel'),
                        imgPanelHeight = imgPanel.height(),
                        txtPanelHeight = txtPanel.height();

                    if ($(window).width() > 767) {
                        if (imgPanelHeight > txtPanelHeight) {
                            txtPanel.css('min-height', imgPanelHeight + 'px');
                        } else {
                            imgPanel.css('min-height', txtPanelHeight + 'px');
                        }
                    } else {
                        txtPanel.css('min-height', 0);
                        imgPanel.css('min-height', txtPanelHeight + 'px');
                    }
                });
            }
        };

        adjustColHeight();

        $(window).on('resize', function () {
            adjustColHeight();
        });

        $('.collapse')
            .on('shown.bs.collapse', function () {
                $(this).parent().find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-minus');
            })
            .on('hidden.bs.collapse', function () {
                $(this).parent().find('.glyphicon-minus').removeClass('glyphicon-minus').addClass('glyphicon-plus');
            });
    });
})(jQuery);
