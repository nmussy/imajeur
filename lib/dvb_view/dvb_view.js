// minimap
// selector vignettes, margin vignettes qui se barre
// sldider temps
// Agrandir la hauteur de la flèche à 100%

// quitter prompt on click

;(function ($) {
    'use strict';

    var version = '0.6.0',
    settings,
    el = {},
    slideTimer,
    slideDimensions,
    imagesSrc = [],
    fullImagesSrc,
    thumbsSrc = [],
    currentViewerIndex,
    menuTimeoutId,
    timescopeTimeoutId,
    availableIdTypes = ['dv_photo_nIdSite', 'dv_photo_sIdForfait', 'dv_photo_nIdForfait'],
    availableThumbsPosition = ['top', 'bottom', 'left', 'right'],
    helpers = {
        getImageDimensions: function(src) {
            var img = $('<img />').css('visibility', 'hidden').prop('src', src).appendTo('body'),
                result = {width:  img.width(),
                          height: img.height()};
            img.remove();
            return result;
        },
        generateViewer: function(index, timescope) {
            if(settings.layout === 'toolbar' && el.sitesMenu) {
                el.sitesMenu.off('click', '.dvb_view_site-toolbar:not(.current)', listeners.siteClick);
            } else if(el.sitesContainer) {
                el.sitesContainer.off('click', '.dvb_view_site', listeners.siteClick);
            }

            el.dvb_viewers[index].one('dvb_viewer:imageDisplayed', function() {
                if(settings.layout === 'toolbar' && el.sitesMenu) {
                    el.sitesMenu.on('click', '.dvb_view_site-toolbar:not(.current)', listeners.siteClick);
                } else if(el.sitesContainer) {
                    el.sitesContainer.on('click', '.dvb_view_site', listeners.siteClick);
                }
            });

            if(el.dvb_viewers[index].is(':empty')) {
                var viewerSettings = {
                    imagesPrefix: 'http://www.devisubox.com/dv/data/media/',
                    fullImagesPrefix: 'http://www.devisubox.com/dv/data/media/',
                    thumbsPrefix: 'http://www.devisubox.com/dv/data/media/',
                    fullImagesSuffix: '.jpg',
                    imagesSuffix: '.jpg',
                    thumbsSuffix: '_VIG.jpg',
                    fullscreen: true,
                    timeout: settings.timeout,
                    playOnStart: false,
                    transition: settings.slideTransition
                };

                viewerSettings.timeout = settings.timeout;

                viewerSettings.ajaxSettings = {
                    type:'post',
                    url: 'http://www.devisubox.com/dv/dv.php5',
                    data: {
                        pgl: (timescope !== undefined && timescope === 'our-selections' ?
                                'Photo/FetchMotion' :
                                'Photo/FetchPhotoDistinctLabeledMotions')
                    }
                };

                if(timescope === undefined || timescope === 'all') {
                    viewerSettings.ajaxSettings.success = function(data) {
                        data = JSON.parse(data);
                        if(data.tMotion && data.tMotion.length === 0) {
                            //el.timescopeOurSelections.addClass('dvb_button-disabled');
                        } else if(settings.promptFilter) {
                            //init.promptFilter();
                        }

                        $.each(data.tMotion, function(index, value) {
                            el.timescopeSelectorContent.append(
                                '<br /><br />'+
                                '<span data-id="' + value.id + '" class="dvb_button dvb_button-s">' + value.label + '</span>'
                            );
                        });
                    }
                }

                viewerSettings.ajaxSettings.data[settings.sIdType] = settings.tId[index];
                viewerSettings.ajaxSettings.data.orderBy  = settings.sOrderBy;

                if($.isArray(settings.nLimit)) {
                    if(settings.nLimit[index] !== undefined)
                        viewerSettings.ajaxSettings.data.nLimit = settings.nLimit[index];
                    else
                        viewerSettings.ajaxSettings.data.nLimit = $.fn.dvb_view.defaultSettings.nLimit;
                } else
                    viewerSettings.ajaxSettings.data['nLimit'] = settings.nLimit;

                if(settings.startingImage !== undefined) {
                    viewerSettings.startingImage = settings.startingImage;
                    settings.startingImage = undefined;
                }

                el.dvb_viewers[index].dvb_viewer(viewerSettings);
                el.dvb_viewers[index].one('dvb_viewer:imageDisplayed', function() {
                    $(this).find('.dvb_viewer_slide').dvb_viewone({
                        fullscreen: true,
                        zoomInterface: (settings.layout === 'toolbar' ? 'buttons' : 'slider')
                    });
                });
            } else
                el.dvb_viewers[index].dvb_viewer('show');

            if(currentViewerIndex !== undefined) {
                switch(settings.siteTransition) {
                    case 'none':
                        el.dvb_viewers[currentViewerIndex].dvb_viewer('hide');
                        el.dvb_viewers[index].dvb_viewer('show');
                        break;
                    case 'slide':
                        el.dvb_viewers[currentViewerIndex].dvb_viewer('pause');
                        el.dvb_viewers[currentViewerIndex].css('z-index', 5)
                            .effect('slide', {direction: 'right', mode : 'hide'}, function() {
                                $(this).css('z-index', 'auto').dvb_viewer('hide');
                            });
                        el.dvb_viewers[index].effect('slide', {direction: 'left', mode : 'show'});
                        break;
                }
            }
            currentViewerIndex = index;

        },
        collapseMenu: function() {
            menuTimeoutId = setTimeout(function () {
                el.menu.animate(
                    {left: -20}, 200);
            }, 500);

            menuTimeoutId = setTimeout(function () {
                el.menu.animate(
                    {left: -el.menu.innerWidth() + 25}, 300);
            }, 5000);
            $(el.menu).one('mouseenter', helpers.showMenu);
        },
        showMenu: function() {
            if(menuTimeoutId !== undefined) {
                clearTimeout(menuTimeoutId);
                menuTimeoutId = undefined;
            }

            el.menu.animate({left: 0}, 300);
            $(el.menu).one('mouseleave', helpers.collapseMenu);
        },
        getImageURL: function() {
            return el.dvb_viewers[currentViewerIndex].dvb_viewer('getCurrentImage').url;
        },
        getPermalink: function() {
            var url = window.location.href,
                beg,
                end;
            if((beg = url.indexOf('&sStartingImage=')) !== -1) {
                var end = url.indexOf('&', beg + 1);
                if(end === -1)
                    end = url.length;
                url = url.substr(0, beg) + url.substr(end, url.length);
            }
            if((beg = url.indexOf('&sStartingSite=')) !== -1) {
                var end = url.indexOf('&', beg + 1);
                if(end === -1)
                    end = url.length;
                url = url.substr(0, beg) + url.substr(end, url.length);
            }
            return url + '&sStartingImage=' +  el.dvb_viewers[currentViewerIndex].dvb_viewer('getCurrentImage').index;
        },
        checkVersion: function() {
            $.ajax({
                type:'post',
                url: 'http://www.devisubox.com/dv/dv.php5',
                data: {
                    pgl: 'Resource/GetResourceVersion',
                    sResource: 'dvb_view'
                },
                success: function(data) {
                    data = JSON.parse(data);
                    if(data.dvb_view && data.dvb_view !== version) {
                        var versionPrompt = $(
                            '<div class="dvb_view_prompt-version">'+
                                '<p>Il existe une nouvelle version de la visionneuse Devisubox.</p>'+
                                '<p>Pour l\'obtenir, actualisez cette page.</p>'+
                                '<p><a style="color:white" href="http://fr.wikihow.com/effacer-le-cache-de-votre-navigateur">Ce message persiste-t-il ?</a></p>'+
                            '</div>'
                        );

                        el.dvb_view.append(versionPrompt);

                        versionPrompt.animate({
                            right: 0
                        }, 1000, function() {
                            setTimeout(function() {
                                versionPrompt.animate({
                                    right: -versionPrompt.outerWidth()
                                }, 1000, function() {
                                    versionPrompt.remove();
                                });
                            }, 10000);
                        });
                    }
                }
            });
        },
        adjustToolbar: function() {
            var cumulativeWidth = 0,
                freeWidth;
            $.each(el.toolbar.children('*:visible:not(.dvb_viewer_timescope)'), function(key, el) {
                cumulativeWidth += $(this).width();
            });

            freeWidth = el.toolbar.width() - cumulativeWidth - 200;
            if(freeWidth < 50) {
            } else if(freeWidth < 400) {
            } else {
                var $timescope = el.toolbar.find('.dvb_viewer_timescope').eq(currentViewerIndex).css({width: freeWidth}),
                    $timescopeSlider = $timescope.children('.dvb_viewer_timescope-slider').css({width: freeWidth});
            }
        },
        upgradeBrowserCompatibilty: function() {
            if (!Function.prototype.bind) {
              Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                  // closest thing possible to the ECMAScript 5 internal IsCallable function
                  throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function () {},
                    fBound = function () {
                      return fToBind.apply(this instanceof fNOP && oThis
                                             ? this
                                             : oThis,
                                           aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
              };
            }
        }
    },
    init = {
        set: function(options) {
            // Import available settings, set defaults if not given

            settings = options;
            if(settings === undefined) // options was undefined
                settings = {};

            // List of the different sites to display
            if(!$.isArray(settings.tId))
                settings.tId = $.fn.dvb_view.defaultSettings.tId;

            // The attribute
            if(typeof settings.sIdType !== 'string' || availableIdTypes.indexOf(sIdType) === -1)
                settings.sIdType = $.fn.dvb_view.defaultSettings.sIdType;

            // Array of sites titles
            if(!$.isArray(settings.tTitre))
                settings.tTitre = $.fn.dvb_view.defaultSettings.tTitre;

            // Array of sites images
            if(!$.isArray(settings.tPhoto))
                settings.tPhoto = $.fn.dvb_view.defaultSettings.tPhoto;

            // String, src of the logo
            if(typeof settings.sLogoSrc !== 'string')
                settings.sLogoSrc = $.fn.dvb_view.defaultSettings.sLogoSrc;

            // String, ID of the first view to display
            if(typeof settings.startingView !== 'string')
                settings.startingView = $.fn.dvb_view.defaultSettings.startingView;

            // String, target of the logo
            if(typeof settings.sLogoTarget !== 'string')
                settings.sLogoTarget = $.fn.dvb_view.defaultSettings.sLogoTarget;

            // The ID site to display on init
            if(settings.startingSite !== undefined && typeof parseInt(settings.startingSite, 10) === 'number' &&
                settings.tId.indexOf(parseInt(settings.startingSite, 10)) !== -1)
                settings.startingSite = settings.tId.indexOf(parseInt(settings.startingSite, 10));
            else
                settings.startingSite = settings.tId[0];

            // First image of imagesSrc to display
            if(settings.startingImage === undefined || (typeof settings.startingImage !== 'string' &&
                 typeof parseInt(settings.startingImage, 10) !== 'number'))
                settings.startingImage = $.fn.dvb_view.defaultSettings.startingImage;
            if(typeof settings.startingImage !== 'number' && typeof settings.startingImage !== 'string')
                settings.startingImage = parseInt(settings.startingImage, 10);


            // Transitions
            if(typeof settings.slideTransition !== 'string')
                settings.slideTransition = $.fn.dvb_view.defaultSettings.slideTransition;

            // Transitions
            if(typeof settings.siteTransition !== 'string')
                settings.siteTransition = $.fn.dvb_view.defaultSettings.siteTransition;

            // Array or number, LIMIT variable
            if(settings.nLimit === undefined || (typeof parseInt(settings.nLimit, 10) !== 'number' && !$.isArray(settings.nLimit)))
                settings.nLimit = $.fn.dvb_view.defaultSettings.nLimit;
            if(!$.isArray(settings.nLimit))
                settings.nLimit = parseInt(settings.nLimit, 10);

            // ORDER BY instruction
            if(typeof settings.sOrderBy !== 'string')
                settings.sOrderBy = $.fn.dvb_view.defaultSettings.sOrderBy;

            // Array containing the thumbnails of the imagesSrc
            if(typeof settings.thumbsPosition !== 'string' || availableThumbsPosition.indexOf(thumbsPosition) === -1)
                settings.thumbsPosition = $.fn.dvb_view.defaultSettings.thumbsPosition;

            // HTML5 fullscreen, true/false
            if(settings.html5Fullscreen === undefined || typeof Boolean(settings.html5Fullscreen) !== 'boolean')
                settings.html5Fullscreen = $.fn.dvb_view.defaultSettings.html5Fullscreen;
            if(typeof settings.html5Fullscreen !== 'boolean')
                settings.html5Fullscreen = Boolean(settings.html5Fullscreen);

            // 100%/100% CSS fullscreen, true/false
            if(settings.html5Fullscreen)
                settings.fullscreen = true;
            else {
                if(settings.fullscreen === undefined || typeof Boolean(settings.fullscreen) !== 'boolean')
                    settings.fullscreen = $.fn.dvb_view.defaultSettings.fullscreen;
                if(typeof settings.fullscreen !== 'boolean')
                    settings.fullscreen = Boolean(settings.fullscreen);
            }

            // Loopback when going back before the first image or after the last one, true/false
            if(settings.loop === undefined || typeof Boolean(settings.loop) !== 'boolean')
                settings.loop = $.fn.dvb_view.defaultSettings.loop;
            if(typeof settings.loop !== 'boolean')
                settings.loop = Boolean(settings.loop);

            // When to automatically switch to the next image, in ms
            if(settings.timeout === undefined || typeof parseInt(settings.timeout, 10) !== 'number')
                settings.timeout = $.fn.dvb_view.defaultSettings.timeout;
            if(typeof settings.timeout !== 'number' && settings.timeout !== 'none')
                settings.timeout = parseInt(settings.timeout, 10);

            // Keyboard shortcuts, for navigation and play/pause
            if(settings.keyboardShortcuts === undefined || typeof Boolean(settings.keyboardShortcuts) !== 'boolean')
                settings.keyboardShortcuts = settings.fullscreen;
            if(typeof settings.keyboardShortcuts !== 'boolean')
                settings.keyboardShortcuts = Boolean(settings.keyboardShortcuts);

            // "History" management, with #ImageID
            if(settings.hashChange === undefined || typeof Boolean(settings.hashChange) !== 'boolean')
                settings.hashChange = settings.fullscreen;
            if(typeof settings.hashChange !== 'boolean')
                settings.hashChange = Boolean(settings.hashChange);

            // Should the slideshow be launched at ever dvb_viewer init
            if(settings.playOnStart === undefined || typeof Boolean(settings.playOnStart) !== 'boolean')
                settings.playOnStart = settings.fullscreen;
            if(typeof settings.playOnStart !== 'boolean')
                settings.playOnStart = Boolean(settings.playOnStart);

            // Should the user be prompted on its first visit concerning the timescope
            if(settings.promptFilter === undefined || typeof Boolean(settings.promptFilter) !== 'boolean')
                settings.promptFilter = settings.fullscreen;
            if(typeof settings.promptFilter !== 'boolean')
                settings.promptFilter = Boolean(settings.promptFilter);

            // Should the user be prompted on its first visit concerning its crappy browser
            if(settings.promptBrowser === undefined || typeof Boolean(settings.promptBrowser) !== 'boolean')
                settings.promptBrowser = settings.fullscreen;
            if(typeof settings.promptBrowser !== 'boolean')
                settings.promptBrowser = Boolean(settings.promptBrowser);

            // Layout
            if(typeof settings.layout !== 'string')
                settings.layout = $.fn.dvb_view.defaultSettings.layout;
        },
        generate: function(viewDiv) {
            // Elements generation
            el.dvb_view = viewDiv.addClass('dvb_view');

                el.logo = $('<img class="dvb_view_logo" />');
                if(settings.tId.length > 1) {
                    el.menu = $('<div class="dvb_view_menu"></div>');
                    if(settings.layout === 'toolbar') {
                        el.sitesMenu = $('<div class="dvb_view_sites-menu"></div>');
                    } else {
                        el.menuPreviousPage = $('<div class="dvb_view_menu-previous-page"><span class="dvb_view_menu-previous-page-icon"></span></div>');
                        el.sitesContainer = $('<div class="dvb_view_sites-container"></div>');
                        el.menuNextPage = $('<div class="dvb_view_menu-next-page"><span class="dvb_view_menu-next-page-icon"></span></div>');
                    }

                    el.sites = [];
                }

                if(settings.layout === 'toolbar') {
                    el.calendarDate  = $('<div class="dvb_view_date"></div>');
                        el.dateMonthYear  = $('<div class="dvb_view_date-month-year"></div>');
                        el.dateDay  = $('<div class="dvb_view_date-day"></div>');
                        el.dateTime   = $('<div class="dvb_view_date-time"></div>');
                }

                    el.date = $('<div class="dvb_view_date dvb_responsive_xltext"></div>');

                el.dvb_viewoneContainer = $('<div class="dvb_view_dvb_viewone-container"></div>');


                el.timescopeSelector = $('<div style="display:none" class="dvb_view_timescope-selector"><span class="dvb_view_timescope-selector-title dvb_responsive_text">Timescope</span></div>');
                    el.timescopeSelectorContent = $('<div class="dvb_view_timescope-selector-content"></div>');
                        el.timescopeAll           = $('<span class="dvb_view_timescope-all dvb_button dvb_button-s dvb_button-selected" data-id="all">Toutes les images</span>');
                        //el.timescopeOurSelections = $('<span class="dvb_view_timescope-our-selections dvb_button dvb_button-s">Notre séléction</span>');

                if(settings.sLogoSrc !== $.fn.dvb_view.defaultSettings.sLogoSrc) {
                    if(settings.layout === 'toolbar') {
                        el.watermark = $('<div class="dvb_view_watermark-large svg"></div>');
                    } else {
                        el.watermark = $('<div class="dvb_view_watermark hidden-phone hidden-phablet dvb_responsive_background-size"></div>');

                    }
                }

                if(settings.layout === 'toolbar') {
                    el.toolbar = $('<div class="dvb_view_toolbar"></div>');
                    el.settings = $('<div class="dvb_view_settings svg" title="Paramètres de l\'interface"></div>');
                    el.fullscreenToggle = $('<div class="dvb_view_fullscreen-toggle svg" title="Mode plein écran (si disponible)"></div>');
                    el.share = $('<div class="dvb_view_share-icon svg" title="Partager"></div>');

                    el.settingsMenu = $('<div class="dvb_view_settings-menu" ></div>');
                    el.shareMenu = $('<div class="dvb_view_share-menu"></div>');
                } else {
                    el.social = $('<div class="dvb_view_social hidden-phone hidden-phablet"></div>');
                        el.facebook   = $('<span title="Partager sur Facebook"  data-share="facebook"  class="dvb_view_share dvb_view_social-facebook"></span>');
                        el.googleplus = $('<span title="Partager sur Google+"   data-share="google"    class="dvb_view_share dvb_view_social-googleplus"></span>');
                        el.twitter    = $('<span title="Partager sur Twitter"   data-share="twitter"   class="dvb_view_share dvb_view_social-twitter"></span>');
                      /*el.flickr     = $('<span title="Partager sur Flickr"    data-share="flickr"    class="dvb_view_share dvb_view_social-flickr"></span>');*/
                        el.pinterest  = $('<span title="Partager sur Pinterest" data-share="pinterest" class="dvb_view_share dvb_view_social-pinterest"></span>');
                        el.linkedin   = $('<span title="Partager sur LinkedIn"  data-share="linkedin"  class="dvb_view_share dvb_view_social-linkedin"></span>');
                        el.email      = $('<span title="Partager par email"     data-share="email"     class="dvb_view_share dvb_view_social-email"></span>');
                        el.permalink  = $('<span title="Obtenir un permalien"   data-share="permalink" class="dvb_view_share dvb_view_social-permalink"></span>');
                }

                el.dvb_viewerContainer = $('<div class="dvb_view_dvb_viewer-conainter"></div>');
                    el.dvb_viewers = [];
                    for(var i = 0; i < settings.tId.length; ++i)
                        el.dvb_viewers.push(
                            $('<div class="dvb_viewer" data-index="' + i + '" data-site="' + settings.tId[i] + '"></div>')
                        );
        },
        place: function() {
            // DOM insertion of the elements
            el.dvb_view.append(el.dvb_viewerContainer)
                       .append(el.logo);

            if(settings.tId.length > 1) {
                if(settings.layout === 'toolbar') {
                    el.dvb_view.append(el.sitesMenu);
                    el.toolbar.append(el.menu);
                    el.menu.append('<span class="dvb_view_menu-icon svg" title="Autres points de vue"></span>');

                    var menu_content = [],
                        sitesPerPage,
                        breakIndex;

                    if($(document).width() > 1200) {
                        sitesPerPage = 6;
                        breakIndex = 3;
                    } else if($(document).width() > 767) {
                        sitesPerPage = 4;
                        breakIndex = 2;
                    } else {
                        sitesPerPage = 2;
                        breakIndex = 3; // nevaaa
                    }

                    for(var i = 0, j = 0, page = ''; i < settings.tId.length; ++i, ++j) {
                        if(j === breakIndex) {
                            page += '<br />';
                        }

                        if(j === sitesPerPage) {
                            j = 0;
                            menu_content.push(page);
                            page = '';
                        }
                        var title = (settings.tTitre[i] === undefined ? 'Titre ' + (i + 1) : settings.tTitre[i]);
                        page += '<div class="dvb_view_site-toolbar ' + (i === 0 /*CURRENTVIEWERINDEX*/ ? 'current' : '') + '" data-index="' + i + '">'+
                                    '<img class="dvb_view_site-image-toolbar" src="' + settings.tPhoto[i] + '" />'+
                                    '<span class="dvb_view_site-title-toolbar" title ="' + title + '">' + title + '</span>'+
                                '</div>';
                    }
                    if(page.length) {
                        menu_content.push(page);
                    }
                    el.sitesMenu.dvb_menu({
                        content: menu_content,
                        title: 'Autres points de vue',
                        loop: (menu_content.length > 1 ? true : false),
                        currentPosition: (menu_content.length > 1 ? true : false),
                        fixedDimensions: false
                    });
                } else {
                    for(var i = 0; i < settings.tId.length; ++i) {
                        var title = (settings.tTitre[i] === undefined ? 'Titre ' + (i + 1) : settings.tTitre[i]);
                        el.sites.push(
                            $('<div class="dvb_view_site" data-index="' + i + '">'+
                                '<div class="dvb_view_site-title-container">'+
                                    '<span class="dvb_view_site-title" title ="' + title + '">' + title + '</span>'+
                                '</div>'+
                                '<img class="dvb_view_site-image" src="' + settings.tPhoto[i] + '" />'+
                            '</div>'));
                    }
                    el.dvb_view.append(el.menu);

                    el.menu.append(el.menuPreviousPage)
                           .append(el.sitesContainer);
                    for(var i = 0; i < settings.tId.length; ++i) {
                        el.sitesContainer.append(el.sites[i]);
                    }
                    el.menu.append(el.menuNextPage);
                }
            }

            if(settings.layout === 'toolbar') {
                el.dvb_view.append(el.toolbar)
                           .append(el.settingsMenu)
                           .append(el.shareMenu);


                el.settingsMenu.dvb_menu({
                    content: [
                        ['<label class="dvb_menu-label"><input class="dvb_view_settings-menu_input" data-setting="upper-right-date" type="checkbox" checked/> Date dans le coin supérieur droit</label>',
                         '<label class="dvb_menu-label"><input class="dvb_view_settings-menu_input" data-setting="thumbnails" type="checkbox" /> Vignettes</label>',
                         '<label class="dvb_menu-label"><input class="dvb_view_settings-menu_input" data-setting="zoom-interface" type="checkbox" checked /> Interfaces de zoom</label>',
                         '<label class="dvb_menu-label"><input class="dvb_view_settings-menu_input" data-setting="timescope-slider" type="checkbox" checked /> Barre de navigation</label>',
                         '<label class="dvb_menu-label"><input class="dvb_view_settings-menu_input" data-setting="timescope-slider-marquers" type="checkbox" checked /> Repères temporels sur la barre de navigation</label>'
                        ].join(''),

                        ['<label class="dvb_menu-label"><input class="dvb_view_settings-menu_input" data-setting="keyboard-shortcuts" type="checkbox" checked /> Activer les raccourcis clavier</label>',
                         '<div style="float:left;width:200px">',
                            '<label><span class="keyboard_key" title="Flèche gauche">&larr;</span> Image précédente</label><br />',
                            '<label><span class="keyboard_key" title="Flèche droite">&rarr;</span> Image suivante</label><br />',
                            '<label><span class="keyboard_key" title="Page précédente">&#8670;</span> 10 images en arrière</label><br />',
                            '<label><span class="keyboard_key" title="Page suivante">&#8671;</span> 10 images en avant</label>',
                         '</div>',
                         '<div style="float:right;width:200px">',
                            '<label><span class="keyboard_key" title="Barre d\'espace">&#9251;</span> Mode diaporama</label><br />',
                            '<label><span class="keyboard_key" title="Page précédente">&plus;</span> Zoom avant</label><br />',
                            '<label><span class="keyboard_key" title="Page suivante">&minus;</span> Zoom arrière</label>',
                         '</div>',
                        ].join(''),

                        ['<img style="padding-top:0;padding-bottom:10px" src="http://www.devisubox.com/dv/resource/js/dvb_view/img/logo_large.png" />',
                         'Interface de suivi de chantiers, version ' + version + '<br/>',
                         '&copy; Devisubox, 2014',
                         '<a style="padding:0" href="http://www.devisubox.com">http://www.devisubox.com</a>',
                         '<a style="padding:0" href="mailto:intervention@devisubox.com">intervention@devisubox.com</a>'
                        ].join('')
                    ],
                    title: 'Paramètres',
                    subTitles: ['Interfaces', 'Raccourcis', 'À propos'],
                    loop: true,
                    currentPosition: true
                });

                el.shareMenu.dvb_menu({
                    content: [
                        ['<span title="Partager sur Facebook"  data-share="facebook"  class="dvb_view_share dvb_view_social-facebook"></span>',
                         '<span title="Partager sur Google+"   data-share="google"    class="dvb_view_share dvb_view_social-googleplus"></span>',
                         '<span title="Partager sur Twitter"   data-share="twitter"   class="dvb_view_share dvb_view_social-twitter"></span>',
                         '<span title="Partager sur Pinterest" data-share="pinterest" class="dvb_view_share dvb_view_social-pinterest"></span>',
                         '<span title="Partager sur LinkedIn"  data-share="linkedin"  class="dvb_view_share dvb_view_social-linkedin"></span><br />',
                         '<span title="Partager par email"     data-share="email"     class="dvb_view_share dvb_view_social-email"></span>',
                         '<span title="Obtenir un permalien"   data-share="permalink" class="dvb_view_share dvb_view_social-permalink"></span>'
                        ].join('')
                    ],
                    title: 'Partager',
                    fixedDimensions: false
                });

                    el.toolbar.prepend(el.settings)
                              .append(el.timescopeSelector)
                              .append(el.calendarDate)
                              .append(el.share)
                              .append(el.fullscreenToggle);

                        el.calendarDate.append(el.dateTime)
                               .append(el.dateMonthYear)
                               .append(el.dateDay);
            } else {
                el.dvb_view.append(el.social)
                           .append(el.timescopeSelector);

                el.social.append(el.facebook)
                         .append(el.googleplus)
                         .append(el.twitter)
                         /*.append(el.flickr)*/
                         .append(el.pinterest)
                         .append(el.linkedin)
                         .append('<br/>')
                         .append(el.email)
                         .append(el.permalink);
            }
            el.dvb_view.append(el.date);

            for(var i = 0; i < settings.tId.length; ++i)
                el.dvb_viewerContainer.append(el.dvb_viewers[i]);


                el.timescopeSelector.append(el.timescopeSelectorContent);
                    el.timescopeSelectorContent.append(el.timescopeAll)
                                               /*.append('<br /><br />')
                                               .append(el.timescopeOurSelections)*/;

                if(settings.sLogoSrc !== $.fn.dvb_view.defaultSettings.sLogoSrc) {
                    if(settings.layout === 'toolbar') {
                        el.toolbar.append(el.watermark);
                    } else {
                        el.dvb_view.append(el.watermark);
                    }
                }
        },
        stylize: function() {
            // Dynamic styles

            el.logo.attr('src', settings.sLogoSrc);

            if(settings.fullscreen) {
                el.dvb_view.css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    margin: 0,
                    padding: 0,
                    width: '100%',
                    height: '100%'
                });
            } else {
                el.dvb_view.css({
                    top: el.dvb_view.offset().top,
                    left: el.dvb_view.offset().left
                });
            }

            if(settings.sLogoTarget.length > 0)
                el.logo.css({cursor: 'pointer'});

            if(el.menuPreviousPage) {
                el.menuPreviousPage.css('top', 0);
                el.menuNextPage.css('top', el.menu.height() - el.menuNextPage.height() * 2);
            }

            /*// center menu arrow
            el.menuArrow.css({
                top: el.menu.height() / 2 - el.menuArrow.height() / 2
            });*/


            if(settings.html5Fullscreen)
                $(document).fullScreen(true);
        },
        listen: function() {
            // Listeners intialization

            if(settings.fullscreen) {
                /*el.closeButton.on('click', function() {
                    if(settings.html5Fullscreen)
                        $(document).fullScreen(false);

                    methods.destroy.apply(el.image);
                });*/
                $(document).on('keydown', listeners.keydown);
            }

/*            if(settings.html5Fullscreen)
                $(document).on('fullscreenchange', function() {
                    if(!$(document).fullScreen())
                        methods.destroy();
                });*/

            if(settings.keyboardShortcuts && !settings.fullscreen)
                $(document).on('keydown', listeners.keydown);

            if(settings.hashChange) {
                $(window).on('hashchange', listeners.hashChange);
            }

            $(window).on('resize', listeners.resize);

           /* el.menuArrow.one('click', listeners.hideArrowClick);*/


            if(settings.layout === 'toolbar') {
                el.dvb_view.one('mouseenter', '.dvb_view_logo,.dvb_view_toolbar,.dvb_view_date', listeners.mouseEnterOpacity);
                el.toolbar .one('mouseenter', '.dvb_view_watermark-large', listeners.mouseEnterWatermark);

                el.toolbar.on('click', '.dvb_view_settings:not(.shown)', listeners.showSettingsMenu);
                el.toolbar.on('click', '.dvb_view_settings.shown', listeners.hideSettingsMenu);

                el.toolbar.on('click', '.dvb_view_share-icon:not(.shown)', listeners.showShareMenu);
                el.toolbar.on('click', '.dvb_view_share-icon.shown', listeners.hideShareMenu);

                el.shareMenu.on('click', '.dvb_view_share', listeners.socialClick);
                if(settings.tId.length > 1) {
                    el.toolbar.on('click', '.dvb_view_menu:not(.shown)', listeners.showSitesMenu);
                    el.toolbar.on('click', '.dvb_view_menu.shown', listeners.hideSitesMenu);

                    el.sitesMenu.on('click', '.dvb_view_site-toolbar:not(.current)', listeners.siteClick);
                }

                el.fullscreenToggle.on('click', listeners.fullscreenToggle);

                el.settingsMenu.on('change', listeners.settingChange);
            } else {
                el.dvb_view.one('mouseenter', '.dvb_view_logo,.dvb_view_date,.dvb_view_watermark', listeners.mouseEnterOpacity);

                el.social.on('click', '.dvb_view_share', listeners.socialClick);

                if(settings.tId.length > 1) {
                    el.sitesContainer.on('click', '.dvb_view_site', listeners.siteClick);
                    helpers.collapseMenu(); // After 5 sec

                    el.menuPreviousPage.addClass('disabled');
                    el.menu.on('click', '.dvb_view_menu-previous-page:not(.disabled)', function() {
                        var oldPosition = el.menu.scrollTop(),
                            newPosition = (el.menu.scrollTop() - el.menu.innerHeight() < 0 ?
                                    0 :
                                    el.menu.scrollTop() - el.menu.innerHeight());

                        el.menu.animate({
                            scrollTop: newPosition
                        }, {
                            step: function(step) {
                                el.menuPreviousPage.css(
                                    'top', step
                                );

                                el.menuNextPage.css(
                                    'top', el.menu.height() - el.menuNextPage.height() * 2 + step
                                );
                            },
                            complete: function() {
                                if(el.menu.scrollTop() === 0)
                                    el.menuPreviousPage.addClass('disabled');
                                else
                                    el.menuPreviousPage.removeClass('disabled');

                                if(el.menu.scrollTop() + el.menu.innerHeight() === el.menu.prop('scrollHeight'))
                                    el.menuNextPage.addClass('disabled');
                                else
                                    el.menuNextPage.removeClass('disabled');
                            }
                        });
                    });

                    el.menu.on('click', '.dvb_view_menu-next-page:not(.disabled)', function() {
                        var oldPosition = el.menu.scrollTop(),
                            newPosition = (el.menu.scrollTop() + el.menu.innerHeight() > el.menu.scrollTop() + el.sitesContainer.height() ?
                                    el.menu.scrollTop() + el.sitesContainer.height() :
                                    el.menu.scrollTop() + el.menu.innerHeight());

                        el.menu.animate({
                            scrollTop: newPosition
                        }, {
                            step: function(step) {
                                el.menuPreviousPage.css(
                                    'top', step
                                );

                                el.menuNextPage.css(
                                    'top', el.menu.height() - el.menuNextPage.height() * 2 + step
                                );
                            },
                            complete: function() {
                                if(el.menu.scrollTop() === 0)
                                    el.menuPreviousPage.addClass('disabled');
                                else
                                    el.menuPreviousPage.removeClass('disabled');

                                if(el.menu.scrollTop() + el.menu.innerHeight() === el.menu.prop('scrollHeight'))
                                    el.menuNextPage.addClass('disabled');
                                else
                                    el.menuNextPage.removeClass('disabled');
                            }
                        });
                    });
                }
            }

            if(settings.sLogoTarget.length > 0)
                el.logo.on('click', listeners.logoClick);
            if(settings.sLogoSrc !== $.fn.dvb_view.defaultSettings.sLogoSrc)
                el.watermark.on('click', listeners.watermarkClick);

            // Prevents the default "drag and drop" action on images.
            el.dvb_view.get(0).ondragstart = function() {
                return false;
            };

            el.logo.one('load', function() {
                $(this).addClass('dvb_responsive_dimension');
            });

            el.dvb_viewerContainer.on('dvb_viewer:imageDisplayed', '.dvb_viewer', listeners.imageDisplayed);

            el.timescopeSelector.one('mouseenter', listeners.showTimescopeSelector);
            el.timescopeSelectorContent.on('click', ':not(.dvb_button-selected):not(.dvb_button-disabled)', listeners.changeTimescope);

            if(settings.layout === 'toolbar') {
                el.toolbar.on('click', '.dvb_view_date:not(.shown)', listeners.showCalendario);
                el.toolbar.on('click', '.dvb_view_date.shown', listeners.hideCalendario);
            }
        },
        promptFilter: function() {
            function centerPrompt() {
                promptFilterDiv.offset({
                    top: $(window).height() / 2 - promptFilterDiv.height() / 2,
                    left: $(window).width() / 2 - promptFilterDiv.width() / 2
                });
            }

            function listenToPrompt(e) {
                switch(e.which) {
                    case 13: // Enter
                    if(promptFilterAll.hasClass('dvb_button-selected')) {
                        $.cookie('promptTimescope', 'all');
                        removePrompt();
                    } else {
                        //el.timescopeOurSelections.addClass('dvb_button-selected');
                        el.timescopeAll.removeClass('dvb_button-selected');
                        removePrompt();
                    }
                    return false;
                }
            }

            function removePrompt() {
                $(document).off('keydown', listenToPrompt);
                promptFilterDiv.fadeOut(200, function() {
                    $(this).remove();
                });
            }

            if($.cookie('promptTimescope') === undefined) {
                var promptFilterDiv = $('<div class="dvb_view_prompt-filter"><span class="dvb_view_prompt-title">Séléctionnez le type de photos que vous souhaitez voir :</span></div>'),
                        promptContent = $('<div class="dvb_view_prompt-content"></div>'),
                            promptFilterAll           = $('<span class="dvb_view_prompt-filter-all dvb_button dvb_button-xl  dvb_button-selected">Toutes les photos</span>'),
                            promptFilterOurSelections = $('<span class="dvb_view_prompt-filter-our-selections dvb_button dvb_button-xl">Notre séléction</span>');

                el.dvb_view.append(promptFilterDiv).hide().fadeIn(200);
                        promptFilterDiv.append(promptContent);
                            promptContent.append(promptFilterAll)
                                         .append('<br /><br /><br />')
                                         .append(promptFilterOurSelections);

                centerPrompt();
                $(window).on('resize', centerPrompt);

                promptContent.one('click', '.dvb_view_prompt-filter-all', function() {
                    $.cookie('promptTimescope', 'all');
                    removePrompt();
                });

                promptContent.one('click', '.dvb_view_prompt-filter-our-selections', function() {
                    el.timescopeOurSelections.click();
                    //el.timescopeAll.removeClass('dvb_button-selected');
                    $.cookie('promptTimescope', 'our');
                    removePrompt();
                });
                $(document).on('keydown', listenToPrompt);
            }
        },
        promptBrowser: function() {
            function centerPrompt() {
                promptBrowserDiv.offset({
                    top: $(window).height() / 2 - promptBrowserDiv.height() / 2,
                    left: $(window).width() / 2 - promptBrowserDiv.width() / 2
                });
            }

            function listenToPrompt(e) {
                switch(e.which) {
                    case 13: // Enter
                    removePrompt();
                    return false;
                }
            }

            function removePrompt() {
                $.cookie('promptBrowser', true);

                $(document).off('keydown', listenToPrompt);
                $(document).off('click', removePrompt);
                promptBrowserDiv.fadeOut(200, function() {
                    $(this).remove();
                });
            }

            if($.cookie('promptBrowser') === undefined) {
                var promptBrowserDiv = $('<div class="dvb_view_prompt-browser"><span class="dvb_view_prompt-title">'+
                                         'Nous avons détecté que votre navigateur est obsolète. '+
                                         'Certaines fonctionalités, voire l\'intégralité de l\'interface, ne s\'exécuteront pas correctement.</span>'+
                                         '<br /><br /><br />Voici une sélection de navigateurs modernes, et plus sécurisés,<br /> compatibles avec cette interface :</div>'),
                        promptContent = $('<div class="dvb_view_prompt-content"></div>'),
                            promptBrowserChrome  = $('<span class="dvb_view_prompt-browser-chrome dvb_button dvb_button-xl"><a class="browser-icon chrome-icon"></a>Google Chrome</span>'),
                            promptBrowserFirefox = $('<span class="dvb_view_prompt-browser-firefox dvb_button dvb_button-xl"><a class="browser-icon firefox-icon"></a>Mozilla Firefox</span>');
                            promptBrowserOpera   = $('<span class="dvb_view_prompt-browser-opera dvb_button dvb_button-xl"><a class="browser-icon opera-icon"></a>Opera</span>');

                el.dvb_view.append(promptBrowserDiv).hide().fadeIn(200);
                        promptBrowserDiv.append(promptContent);
                                promptContent.append(promptBrowserChrome)
                                             .append(promptBrowserFirefox)
                                             .append(promptBrowserOpera);

                centerPrompt();
                $(window).on('resize', centerPrompt);

                $(document).one('click', removePrompt);
                promptContent.one('click', '.dvb_view_prompt-browser-chrome', function() {
                    window.open('https://www.google.com/intl/fr/chrome/browser/', '_blank');
                    removePrompt();
                });
                promptContent.one('click', '.dvb_view_prompt-browser-firefox', function() {
                    window.open('http://www.mozilla.org/fr-FR/firefox/', '_blank');
                    removePrompt();
                });
                promptContent.one('click', '.dvb_view_prompt-browser-opera', function() {
                    window.open('http://www.opera.com/fr/', '_blank');
                    removePrompt();
                });
                $(document).on('keydown', listenToPrompt);
            }
        }
    },
    listeners = {
        siteClick: function() {
            if($(this).attr('data-index') != currentViewerIndex) {
                helpers.generateViewer($(this).attr('data-index'));

                if($(this).hasClass('dvb_view_site-toolbar')) {
                    $(this).siblings('.current').removeClass('current');
                    $(this).addClass('current');
                }
            }
        },
        logoClick: function() {
            window.open(settings.sLogoTarget);
        },
        watermarkClick: function() {
            window.open("http://www.devisubox.com");
        },
        keydown: function(e) {
            if(settings.keyboardShortcuts) {
                switch(e.which) {
                    default:
                        return;
                }
                return false;
            }
        },
        resize: function() {
            if(settings.layout === 'toolbar') {
                helpers.adjustToolbar();
            } else {
                el.menuPreviousPage.css(
                    'top', el.menu.scrollTop()
                );
                el.menuNextPage.css(
                    'top', el.menu.height() - el.menuNextPage.height() * 2 + el.menu.scrollTop()
                );

                if(el.menu.scrollTop() === 0)
                    el.menuPreviousPage.addClass('disabled');
                else
                    el.menuPreviousPage.removeClass('disabled');

                if(el.menu.scrollTop() + el.menu.innerHeight() === el.menu.prop('scrollHeight'))
                    el.menuNextPage.addClass('disabled');
                else
                    el.menuNextPage.removeClass('disabled');
            }
        },/*
        hideArrowClick: function() {
            helpers.collapseMenu();
            el.menuArrow.one('click', listeners.showArrowClick);
        },
        showArrowClick: function() {
            helpers.showMenu();
            el.menuArrow.one('click', listeners.hideArrowClick);
        },*/
        mouseEnterOpacity: function() {
            $(this).animate({
                filter: 'alpha(opacity=100)',
                opacity: 1.0
            }, 150);

            if (settings.layout === 'toolbar')
                el.dvb_view.one('mouseleave', '.dvb_view_logo,.dvb_view_toolbar,.dvb_view_date', listeners.mouseLeaveOpacity);
            else
                el.dvb_view.one('mouseleave', '.dvb_view_logo,.dvb_view_date,.dvb_view_watermark', listeners.mouseLeaveOpacity);
        },
        mouseLeaveOpacity: function() {
            $(this).animate({
                filter: 'alpha(opacity=60)',
                opacity: 0.6
            }, 150);

            setTimeout(function() {
                if (settings.layout === 'toolbar')
                    el.dvb_view.one('mouseenter', '.dvb_view_logo,.dvb_view_toolbar,.dvb_view_date', listeners.mouseEnterOpacity);
                else
                    el.dvb_view.one('mouseenter', '.dvb_view_logo,.dvb_view_date,.dvb_view_watermark', listeners.mouseEnterOpacity);
            }, 150);
        },
        mouseEnterWatermark: function(e) {
            $(e.target).animate({
                left: 5
            }, 150);

            el.toolbar.one('mouseleave', '.dvb_view_watermark-large', listeners.mouseLeaveWatermark);
        },
        mouseLeaveWatermark: function(e) {
            $(e.target).animate({
                left: 205
            }, 150);

            setTimeout(function() {
                el.toolbar.one('mouseenter', '.dvb_view_watermark-large', listeners.mouseEnterWatermark);
            }, 150);
        },
        socialClick: function(e) {
            switch ($(e.currentTarget).attr('data-share')) {
                case "facebook" :
                    window.open(
                        'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(helpers.getPermalink())/* + '&p[images]=' + encodeURIComponent('http://www.devisubox.com/dv/resource/js/dvb_view/img/logo.png')*/,
                        '_blank',
                        'menubar=no,toolbar=no,height=626,width=436'
                    );
                    break;
                case "twitter":
                    window.open(
                        'https://twitter.com/share?via=devisubox&url=' + encodeURIComponent(helpers.getPermalink()),
                        '_blank',
                        'menubar=no,toolbar=no,height=626,width=500'
                    );
                    break;
                case "google":
                    window.open(
                        'https://plus.google.com/share?url=' + encodeURIComponent(helpers.getPermalink()),
                        '_blank',
                        'menubar=no,toolbar=no,height=600,width=600'
                    );
                    break;
                case "linkedin":
                    window.open(
                        'https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(helpers.getPermalink())+'&title=&summary=&source=devisubox.com',
                        '_blank',
                        'menubar=no,toolbar=no,height=600,width=600'
                    );
                    break;
                case "flickr":

                    break;
                case "pinterest":
                    window.open(
                        'https://www.pinterest.com/pin/create/button/?url=' + encodeURIComponent(helpers.getPermalink()) + '&media=' + encodeURIComponent(helpers.getImageURL()),
                        '_blank',
                        'menubar=no,toolbar=no,height=600,width=600'
                    );
                    break;
                case "email":
                    window.open(
                        'mailto:?to=&subject=Devisubox&body=' + encodeURIComponent(helpers.getPermalink()),
                        '_blank',
                        'menubar=no,toolbar=no,height=750,width=500'
                    );
                    break;
                case "permalink":
                    prompt("Voici l'adresse permanante pour accéder à cette image :", helpers.getPermalink());
                    break;
                default:

            }
        },
        collapseTimescopeSelector: function() {
            timescopeTimeoutId = setTimeout(function () {
                el.timescopeSelector.animate({height: 57});
            }, 500);

            el.timescopeSelector.one('mouseenter', listeners.showTimescopeSelector);
        },
        showTimescopeSelector: function() {
            if(timescopeTimeoutId !== undefined) {
                clearTimeout(timescopeTimeoutId);
                timescopeTimeoutId = undefined;
            }
            el.timescopeSelector.animate({height: 175});
            el.timescopeSelector.one('mouseleave', listeners.collapseTimescopeSelector);
        },
        hashChange: function() {
/*            if(window.location.href.indexOf('#') === -1)
                return;

            var targetImage = window.location.href.substr(window.location.href.indexOf('#') + 1, window.location.href.length);
            var targetSite = window.location.href.substr(window.location.href.indexOf('S_') + 2, window.location.href.indexOf('/') - 1);

            if(targetSite !== settings.tId[currentViewerIndex]) {
                if(settings.tId.indexOf(targetSite) === -1)
                    return;
                settings.startingImage = targetImage;
                generateViewer(settings.tId.indexOf(targetSite));
                settings.startingImage = undefined;
            }

            if(el.dvb_viewers[targetSite].find('.dvb_viewer_image').prop('src').indexOf(targetImage) !== -1)
                return;

            el.dvb_viewers[targetSite].data('dvb_viewerInstance').imagesSrc.forEach(function (src, index) {
                if(src.indexOf(targetImage) !== -1) {
                    el.dvb_viewers[targetSite].dvb_viewer('jumpTo', index);
                    return false;
                }
            });*/
        },
        imageDisplayed: function(e, src, index) {
            var time = src.substr(src.length - 10, 6);
                time = time.substr(0, 2) + ':' + time.substr(2, 2)/* + ':' +time.substr(4, 2)*/;
            var date = src.substr(src.length - 17, 6);
                date = date.substr(4, 4) + '/' + date.substr(2, 2) + '/20' + date.substr(0, 2);

            if(settings.layout === 'toolbar') {
                el.calendarDate.attr('title', date + ' à ' + time);

                var months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'],
                    month = months[parseInt(src.substr(src.length - 15, 2), 10) - 1],
                    year = src.substr(src.length - 17, 2),
                    day = src.substr(src.length - 13, 2);

                el.dateMonthYear.html(month + ' ' + year);
                el.dateDay.html(day);
                el.dateTime.html(time.substr(0, 2) +  '<br /><span style="position:relative;top:-1px">:</span><br />' + time.substr(-2, 2)/* + ':' +time.substr(4, 2)*/);
            }

            el.date.html(date + ' à ' + time);
        },
        changeTimescope: function() {
            var data = {
                orderBy: settings.sOrderBy,
                pgl: ($(this).hasClass('dvb_view_timescope-all') ?
                        'Photo/FetchPhotoDistinctLabeledMotions' :
                        'Photo/FetchMotion')
            };

            data[settings.sIdType] = settings.tId[currentViewerIndex];

            if($.isArray(settings.nLimit)) {
                if(settings.nLimit[index] !== undefined)
                    data['nLimit'] = settings.nLimit[index];
                else
                    data['nLimit'] = $.fn.dvb_view.defaultSettings.nLimit;
            } else
                data['nLimit'] = settings.nLimit;

            $(this).siblings('.dvb_button-selected').removeClass('dvb_button-selected');
            $(this).addClass('dvb_button-selected');

            el.dvb_viewers[currentViewerIndex].dvb_viewer('display', $(this).data('id'), {
                type:'post',
                url: 'http://www.devisubox.com/dv/dv.php5',
                data: data
            });

/*
            if($(this).hasClass('dvb_view_timescope-our-selections')) {
                //el.timescopeOurSelections.addClass('dvb_button-selected');
                el.timescopeAll.removeClass('dvb_button-selected');

                el.dvb_viewers[currentViewerIndex].dvb_viewer('display', 'our-selections',
                {
                    type:'post',
                    url: 'http://www.devisubox.com/dv/dv.php5',
                    data: data
                });
            } else if($(this).hasClass('dvb_view_timescope-all')) {
                el.timescopeAll.addClass('dvb_button-selected');
                //el.timescopeOurSelections.removeClass('dvb_button-selected');

                data.pgl = 'Photo/FetchPhotoDistinctMotions';
                el.dvb_viewers[currentViewerIndex].dvb_viewer('display', 'all',
                {
                    type:'post',
                    url: 'http://www.devisubox.com/dv/dv.php5',
                    data: data
                });
            }
*/      },
        showCalendario: function (e) {
            el.dvb_viewers[currentViewerIndex].dvb_viewer('showCalendario', e);
            el.calendarDate.addClass('shown');

/*            setTimeout(function() {
                $(document).on('click', {selector: '.dvb_calendario-calendar-wrap', callback: listeners.hideCalendario}, listeners.hideOnClickSomewhereElse);
            }, 100);*/
        },
        hideCalendario: function (e) {
            /*$(document).off('click', listeners.hideOnClickSomewhereElse);*/
            el.dvb_viewers[currentViewerIndex].dvb_viewer('hideCalendario', e);
            el.calendarDate.removeClass('shown');
        },
        showSettingsMenu: function (e) {
            var menuWrap = el.settingsMenu.parent().parent();
            menuWrap.show();
            el.settingsMenu.dvb_menu('forceCellPlacement');
            var centerX = $(e.target).offset().left + $(e.target).width() / 2,
                offsetX = centerX - menuWrap.width() / 2 + 10,
                offsetY = 56;

            if(offsetX < 0) {
                offsetX = 10;
            } else if(offsetX + menuWrap.width() > $(window).width() - 10) {
                offsetX = $(window).width() - menuWrap.width() - 10;
            }

            menuWrap.css({
                opacity: 0,
                left: offsetX,
                bottom: offsetY - 50
            }).animate({
                opacity: 1,
                bottom: offsetY
            }, 300);

            el.settings.addClass('shown');

            setTimeout(function() {
                $(document).on('click', {selector: '.dvb_menu-wrap:eq(1)', callback: listeners.hideSettingsMenu}, listeners.hideOnClickSomewhereElse);
            }, 100);
        },
        hideSettingsMenu: function (e) {
            $(document).off('click', listeners.hideOnClickSomewhereElse);
            var menuWrap = el.settingsMenu.parent().parent();
            menuWrap.animate({
                opacity: 0,
                bottom: parseInt(menuWrap.css('bottom'), 10) - 50
            }, 300, function () {
                menuWrap.hide();
            });

            el.settings.removeClass('shown');
        },
        showShareMenu: function (e) {
            var menuWrap = el.shareMenu.parent().parent();
            menuWrap.show();
            el.shareMenu.dvb_menu('forceCellPlacement');
            var centerX = $(e.target).offset().left + $(e.target).width() / 2,
                offsetX = centerX - menuWrap.width() / 2 + 10,
                offsetY = 56;

            if(offsetX < 0) {
                offsetX = 10;
            } else if(offsetX + menuWrap.width() > $(window).width() - 10) {
                offsetX = $(window).width() - menuWrap.width() - 10;
            }

            menuWrap.css({
                opacity: 0,
                left: offsetX,
                bottom: offsetY - 50
            }).animate({
                opacity: 1,
                bottom: offsetY
            }, 300);

            el.share.addClass('shown');

            setTimeout(function() {
                $(document).on('click', {selector: '.dvb_menu-wrap:eq(2)', callback: listeners.hideShareMenu}, listeners.hideOnClickSomewhereElse);
            }, 100);
        },
        hideShareMenu: function (e) {
            $(document).off('click', listeners.hideOnClickSomewhereElse);
            var menuWrap = el.shareMenu.parent().parent();
            menuWrap.animate({
                opacity: 0,
                bottom: parseInt(menuWrap.css('bottom'), 10) - 50
            }, 300, function () {
                menuWrap.hide();
            });

            el.share.removeClass('shown');
        },
        showSitesMenu: function (e) {
            var menuWrap = el.sitesMenu.parent().parent();
            menuWrap.show();
            el.sitesMenu.dvb_menu('forceCellPlacement');
            var centerX = $(e.target).offset().left + $(e.target).width() / 2,
                offsetX = centerX - menuWrap.width() / 2 + 10,
                offsetY = 56;

            if(offsetX < 0) {
                offsetX = 10;
            } else if(offsetX + menuWrap.width() > $(window).width() - 10) {
                offsetX = $(window).width() - menuWrap.width() - 10;
            }

            menuWrap.css({
                opacity: 0,
                left: offsetX,
                bottom: offsetY - 50
            }).animate({
                opacity: 1,
                bottom: offsetY
            }, 300);

            el.menu.addClass('shown');

            setTimeout(function() {
                $(document).on('click', {selector: '.dvb_menu-wrap:eq(0)', callback: listeners.hideSitesMenu}, listeners.hideOnClickSomewhereElse);
            }, 100);
        },
        hideSitesMenu: function (e) {
            $(document).off('click', listeners.hideOnClickSomewhereElse);
            var menuWrap = el.sitesMenu.parent().parent();
            menuWrap.animate({
                opacity: 0,
                bottom: parseInt(menuWrap.css('bottom'), 10) - 50
            }, 300, function () {
                menuWrap.hide();
            });

            el.menu.removeClass('shown');
        },
        hideOnClickSomewhereElse: function(e) {
            if(!$.contains($(e.data.selector)[0], e.target)) {
                e.data.callback();
                return false;
            }
        },
        fullscreenOn: function() {
            $(document).fullScreen(true);
            if(settings.layout === 'toolbar') {
                el.toolbar.animate({
                    bottom: -el.toolbar.height()
                }, function() {
                    el.toolbar.hide();
                    el.fullscreenToggle.addClass('off').appendTo(el.dvb_view);
                });
            }
        },
        fullscreenOff: function() {
            $(document).fullScreen(false);
            if(settings.layout === 'toolbar') {
                el.toolbar.show().animate({
                    bottom: 0
                }, function() {
                    el.fullscreenToggle.removeClass('off').insertAfter(el.share);
                });
            }
        },
        fullscreenToggle: function(e) {
            console.log(e);
            if($(this).hasClass('off')) {
                listeners.fullscreenOff();
            } else {
                listeners.fullscreenOn();
            }
        },
        settingChange: function(e) {
            var $target = $(e.target),
                isChecked = $target.prop('checked');
            if(!$target.hasClass('dvb_view_settings-menu_input'))
                return;

            switch($target.data('setting')) {
                case 'upper-right-date':
                    if(isChecked) {
                        el.date.fadeOut(200);
                        el.calendarDate.width(80);
                        el.dateTime.show();
                    } else {
                        el.date.fadeIn(200);
                        el.calendarDate.width(60);
                        el.dateTime.hide();
                    }
                    break;
                case 'thumbnails':
                    if(isChecked) {

                    } else {

                    }
                    break;
                case 'zoom-interface':
                    if(isChecked) {

                    } else {

                    }
                    break;
                case 'timescope-slider':
                    if(isChecked) {

                    } else {

                    }
                    break;
                case 'timescope-slider-marquers':
                    if(isChecked) {

                    } else {

                    }
                    break;
                case 'keyboard-shortcuts':
                    if(isChecked) {

                    } else {

                    }
                    break;
                default:
            }

        }
    },
    methods = {
        initialize: function(options) {
            // If already initalized, return .dvb_view

            helpers.upgradeBrowserCompatibilty();

            init.set(options);
            /** TEMP FIX **/

            init.generate(this);
            init.place();

            init.stylize();
            init.listen();

            if(svgify)
                svgify();

            if(el.dvb_viewers[settings.startingSite] === undefined) {
                $.each(el.dvb_viewers, function(index) {
                    if($(this).attr('data-site') == settings.startingSite) {
                        settings.startingSite = index;
                        return false;
                    }
                });
                if(el.dvb_viewers[settings.startingSite] === undefined) {
                    settings.startingSite = 0;
                }
            }
            helpers.generateViewer(settings.startingSite);

            if($.browser.msie && parseInt($.browser.version, 10) < 9) {
                init.promptBrowser();
            }

            helpers.checkVersion();
            setInterval(helpers.checkVersion, 3600000);

            return this;
        },
        destroy: function() {
            el.dvb_view.removeClass('dvb_view');
            $(document).off('keydown', listeners.keydown);

            return this;
        },
        option: function(option, value) {
            if(value === undefined) {
                return settings.value;
            }
            else {
                settings.value = value;
                return this;
            }
        },
        forceToolbarAdjustment: function() {
            helpers.adjustToolbar();
            $(window).trigger('resize');
            return this;
        }
    };

    $.fn.dvb_view = function(method) {
        if (methods[method])
            return methods[method].apply(this, [].slice.call(arguments, 1));
        else
            return methods.initialize.apply(this, arguments);
    };

    $.fn.dvb_view.defaultSettings = {
        tId: [],
        tTitre: [],
        tPhoto: [],
        startingView: 0,
        /*startingSite: settings.tId[0],*/
        sIdType: 'dv_photo_nIdSite',
        sOrderBy: '',
        nLimit: (($.browser.msie && $.browser.version < 9) ? 200 : 100000),
        sLogoSrc: 'http://www.devisubox.com/dv/resource/js/dvb_view/img/logo.png',
        sLogoTarget : 'http://www.devisubox.com/',
        startingImage: '',
        slideTransition: 'none', // ['fadeOutIn']
        siteTransition: 'none', // ['slide']
        timeout: 2000, // !!!! none !== 0 !!!!!
        thumbsPosition: 'bottom',
        loop: true,
        fullscreen: false,
        html5Fullscreen: false,
        keyboardShortcuts: false,
        hashChange: true,
        playOnStart: false,
        promptFilter: false,
        promptBrowser: true,
        layout: 'toolbar'
    };
}(window.jQuery));