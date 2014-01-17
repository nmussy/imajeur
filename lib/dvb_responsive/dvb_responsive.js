$(document).on('ready', _dvb_responsive);
$(window).on('resize', _dvb_responsive);
$(window).on('dvb_responsive:force-update', {force: true}, _dvb_responsive);

function _dvb_responsive(e) {
    var currentLayout = getLayoutType($(document).width());
    if($('body').attr('data-layout-type') == currentLayout && (!e.data || !e.data.force))
        return;

    var speed = 400;
    if($('body').attr('data-layout-type') === undefined) {
         // don't animate on init
        speed = 0;

        $('<style type="text/css">.hidden{display:none}</style>').appendTo($('head'));
    }

    $('body').attr('data-layout-type', currentLayout);
    storeOriginalDimensions();
    switch(currentLayout) {
        case 'phone':
            $('.dvb_responsive_xstext').stop(true).animate({'font-size': 10}, speed);
            $('.dvb_responsive_stext') .stop(true).animate({'font-size': 12}, speed);
            $('.dvb_responsive_text')  .stop(true).animate({'font-size': 14}, speed);
            $('.dvb_responsive_ltext') .stop(true).animate({'font-size': 18}, speed);
            $('.dvb_responsive_xltext').stop(true).animate({'font-size': 25}, speed);


            $('.visible-phone, .hidden-phablet, .hidden-tablet, .hidden-desktop, .hidden-xdesktop').removeClass('hidden');
            $('.hidden-phone, .visible-phablet, .visible-tablet, .visible-desktop, .visible-xdesktop').addClass('hidden');

            $.each($('.dvb_responsive_dimension'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.4,
                                 height: $(this).data('dvb_responsive-oheight') * 0.4}, speed);
            });
            $.each($('.dvb_responsive_width'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.4}, speed);
            });
            $.each($('.dvb_responsive_height'), function() {
                $(this).stop(true)
                       .animate({height: $(this).data('dvb_responsive-oheight') * 0.4}, speed);
            });
            $.each($('.dvb_responsive_background-size'), function() {
                $(this).stop(true)
                       .css('background-size', 'contain')
                       .animate({width:  $(this).data('dvb_responsive-owidth') * 0.4,
                                 height: $(this).data('dvb_responsive-oheight') * 0.4}, speed);
            });
            break;
        case 'phablet':
            $('.dvb_responsive_xstext').stop(true).animate({'font-size': 12}, speed);
            $('.dvb_responsive_stext') .stop(true).animate({'font-size': 14}, speed);
            $('.dvb_responsive_text')  .stop(true).animate({'font-size': 16}, speed);
            $('.dvb_responsive_ltext') .stop(true).animate({'font-size': 20}, speed);
            $('.dvb_responsive_xltext').stop(true).animate({'font-size': 27}, speed);

            $('.hidden-phone, .visible-phablet, .hidden-tablet, .hidden-desktop, .hidden-xdesktop').removeClass('hidden');
            $('.visible-phone, .hidden-phablet, .visible-tablet, .visible-desktop, .visible-xdesktop').addClass('hidden');

            $.each($('.dvb_responsive_dimension'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.6,
                                 height: $(this).data('dvb_responsive-oheight') * 0.6}, speed);
            });
            $.each($('.dvb_responsive_width'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.6}, speed);
            });
            $.each($('.dvb_responsive_height'), function() {
                $(this).stop(true)
                       .animate({height: $(this).data('dvb_responsive-oheight') * 0.6}, speed);
            });
            $.each($('.dvb_responsive_background-size'), function() {
                $(this).stop(true)
                       .css('background-size', 'contain')
                       .animate({width:  $(this).data('dvb_responsive-owidth') * 0.6,
                                 height: $(this).data('dvb_responsive-oheight') * 0.6}, speed);
            });
            break;

        case 'tablet':
            $('.dvb_responsive_xstext').stop(true).animate({'font-size': 14}, speed);
            $('.dvb_responsive_stext') .stop(true).animate({'font-size': 16}, speed);
            $('.dvb_responsive_text')  .stop(true).animate({'font-size': 18}, speed);
            $('.dvb_responsive_ltext') .stop(true).animate({'font-size': 20}, speed);
            $('.dvb_responsive_xltext').stop(true).animate({'font-size': 30}, speed);

            $('.hidden-phone, .hidden-phablet, .visible-tablet, .hidden-desktop, .hidden-xdesktop').removeClass('hidden');
            $('.visible-phone, .visible-phablet, .hidden-tablet, .visible-desktop, .visible-xdesktop').addClass('hidden');

            $.each($('.dvb_responsive_dimension'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.7,
                                 height: $(this).data('dvb_responsive-oheight') * 0.7}, speed);
            });
            $.each($('.dvb_responsive_width'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.7}, speed);
            });
            $.each($('.dvb_responsive_height'), function() {
                $(this).stop(true)
                       .animate({height: $(this).data('dvb_responsive-oheight') * 0.7}, speed);
            });
            $.each($('.dvb_responsive_background-size'), function() {
                $(this).stop(true)
                       .css('background-size', 'contain')
                       .animate({width:  $(this).data('dvb_responsive-owidth') * 0.7,
                                 height: $(this).data('dvb_responsive-oheight') * 0.7}, speed);
            });
            break;

        case 'desktop':
            $('.dvb_responsive_xstext').stop(true).animate({'font-size': 15}, speed);
            $('.dvb_responsive_stext') .stop(true).animate({'font-size': 19}, speed);
            $('.dvb_responsive_text')  .stop(true).animate({'font-size': 20}, speed);
            $('.dvb_responsive_ltext') .stop(true).animate({'font-size': 21}, speed);
            $('.dvb_responsive_xltext').stop(true).animate({'font-size': 35}, speed);

            $('.hidden-phone, .hidden-phablet, .hidden-tablet, .visible-desktop, .hidden-xdesktop').removeClass('hidden');
            $('.visible-phone, .visible-phablet, .visible-tablet, .hidden-desktop, .visible-xdesktop').addClass('hidden');

            $.each($('.dvb_responsive_dimension'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.9,
                                 height: $(this).data('dvb_responsive-oheight') * 0.9}, speed);
            });
            $.each($('.dvb_responsive_width'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.9}, speed);
            });
            $.each($('.dvb_responsive_height'), function() {
                $(this).stop(true)
                       .animate({height: $(this).data('dvb_responsive-oheight') * 0.9}, speed);
            });
            $.each($('.dvb_responsive_background-size'), function() {
                $(this).stop(true)
                       .css('background-size', 'contain')
                       .animate({width: $(this).data('dvb_responsive-owidth') * 0.9,
                                 height: $(this).data('dvb_responsive-oheight') * 0.9}, speed);
            });
            break;

        case 'xdesktop':
            $('.dvb_responsive_xstext').stop(true).animate({'font-size': 16}, speed);
            $('.dvb_responsive_stext') .stop(true).animate({'font-size': 20}, speed);
            $('.dvb_responsive_text')  .stop(true).animate({'font-size': 22}, speed);
            $('.dvb_responsive_ltext') .stop(true).animate({'font-size': 30}, speed);
            $('.dvb_responsive_xltext').stop(true).animate({'font-size': 40}, speed);

            $('.hidden-phone, .hidden-phablet, .hidden-tablet, .hidden-desktop, .visible-xdesktop').removeClass('hidden');
            $('.visible-phone, .visible-phablet, .visible-tablet, .visible-desktop, .hidden-xdesktop').addClass('hidden');

            $.each($('.dvb_responsive_dimension'), function() {
                $(this).stop(true)
                       .animate({width:  $(this).data('dvb_responsive-owidth'),
                                 height: $(this).data('dvb_responsive-oheight')}, speed);
            });
            $.each($('.dvb_responsive_width'), function() {
                $(this).stop(true)
                       .animate({width: $(this).data('dvb_responsive-owidth')}, speed);
            });
            $.each($('.dvb_responsive_height'), function() {
                $(this).stop(true)
                       .animate({height: $(this).data('dvb_responsive-oheight')}, speed);
            });
            $.each($('.dvb_responsive_background-size'), function() {
                $(this).stop(true)
                       .css('background-size', 'contain')
                       .animate({width:  $(this).data('dvb_responsive-owidth'),
                                 height: $(this).data('dvb_responsive-oheight')}, speed);
            });
            break;
    }
    $(window).trigger('dvb_responsive:layout-change', [currentLayout]);
}

function getLayoutType(width) {
    if(width < 480)
        return 'phone';
    if (width < 767)
        return 'phablet';
    if (width < 980)
        return 'tablet';
    if (width < 1200)
        return 'desktop';

    return 'xdesktop';
}

function storeOriginalDimensions() {
    $.each($('.dvb_responsive_background-size:not([data-dvb_responsive-owidth]),'+
             '.dvb_responsive_dimension:not([data-dvb_responsive-owidth])'), function() {
        $(this).attr('data-dvb_responsive-owidth',  $(this).width())
               .attr('data-dvb_responsive-oheight', $(this).height());
    });

    $.each($('.dvb_responsive_width:not([data-dvb_responsive-owidth])'), function() {
        $(this).attr('data-dvb_responsive-owidth', $(this).width());
    });

    $.each($('.dvb_responsive_height:not([data-dvb_responsive-oheight])'), function() {
        $(this).attr('data-dvb_responsive-oheight', $(this).height());
    });
}