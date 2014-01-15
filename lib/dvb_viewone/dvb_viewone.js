;(function ($) {
    'use strict';

    var dvb_viewoneClass = function(image, options) {
        this.mapScale,
        this.settings = options,
        this.imageDimensions,
        this.availableZoomInterfaces = ['slider', 'hsilder', 'vslider', 'buttons', 'none'],
        this.availableSliderEngines = ['html', 'jqueryui'],
        this.el = {image: image},
        this.helpers = {
            domPlace: function(element, targetElement, targetIndex) {
                if(targetIndex === 0)
                    $(element).prependTo(targetElement);
                else if(targetIndex === targetElement.children().size() - 1)
                    $(element).appendTo(targetElement);
                else
                    $(element).insertAfter(targetElement.children().eq(targetIndex - 1));
            },
            getImageDimensions: function(src, callback) {
                var img = $('<img />').css('visibility', 'hidden').prop('src', src).appendTo('body');
                this.imageDimensions = {
                    width:  img.width(),
                    height: img.height()
                };
                img.remove();

                if(callback)
                    callback.apply(this);
            },
            adaptSelector: function() {
                this.mapScale = {top: this.el.image.height() / this.el.minimapImage.height(),
                         left: this.el.image.width() / this.el.minimapImage.width()};

                this.el.minimapSelector.css({
                    width: this.el.imageContainer.width() / this.mapScale.left,
                    height: this.el.imageContainer.height() / this.mapScale.top
                });

                var selectorPos = {
                    left: this.el.minimapSelector.offset().left,
                    top: this.el.minimapSelector.offset().top
                };

                if(this.el.minimapSelector.width() > this.el.minimapImage.width()) {
                    selectorPos.left = this.el.minimapImage.offset().left;

                    var oldWidth = this.el.minimapSelector.width();
                    this.el.minimapSelector.width(this.el.minimapImage.width());
                    this.el.minimapSelector.height(this.el.minimapSelector.width() * this.el.minimapSelector.height() / oldWidth);
                } else {
                    if(selectorPos.left < this.el.minimapImage.offset().left)
                        selectorPos.left = this.el.minimapImage.offset().left;
                    else if(selectorPos.left + this.el.minimapSelector.width() > this.el.minimapImage.offset().left + this.el.minimapImage.width())
                        selectorPos.left = this.el.minimapImage.offset().left + this.el.minimapImage.width() - this.el.minimapSelector.width();
                }

                if(this.el.minimapSelector.height() > this.el.minimapImage.height()) {
                    selectorPos.top = this.el.minimapImage.offset().top;

                    var oldHeight = this.el.minimapSelector.height();
                    this.el.minimapSelector.height(this.el.minimapImage.height());
                    this.el.minimapSelector.width(this.el.minimapSelector.height() * this.el.minimapSelector.width() / oldHeight);
                } else {
                    if(selectorPos.top < this.el.minimapImage.offset().top)
                        selectorPos.top = this.el.minimapImage.offset().top;
                    else if(selectorPos.top + this.el.minimapSelector.height() > this.el.minimapImage.offset().top + this.el.minimapImage.height())
                        selectorPos.top = this.el.minimapImage.offset().top + this.el.minimapImage.height() - this.el.minimapSelector.height();
                }

                this.el.minimapSelector.offset({
                    left: selectorPos.left,
                    top: selectorPos.top
                });

                if(this.el.minimapSelector.height() > this.el.minimapImage.height())
                    this.el.minimapSelector.height(this.el.minimapImage.height())
                if(this.el.minimapSelector.width() > this.el.minimapImage.width())
                    this.el.minimapSelector.width(this.el.minimapImage.width())
            },
            adaptImage: function() {/*
                if(this.el.image.width() < this.el.imageContainer.width() || this.el.image.height() < this.el.imageContainer.height())
                    this.el.image.udraggable(
                        'option', {containment: [0,
                                   0,
                                   0,
                                   0]}
                    );
                else*/
                    this.el.image.udraggable(
                        'option', {containment: [this.el.imageContainer.width() - this.el.image.width(),
                                   this.el.imageContainer.height() - this.el.image.height(),
                                   0,
                                   0]}
                    );
            },
            forceCenter: function() {
                this.el.image.css({
                    top:  -((this.el.image.height() - this.el.imageContainer.height()) / 2),
                    left: -((this.el.image.width() - this.el.imageContainer.width()) / 2)
                });

                this.el.minimapSelector.css({
                    top:  -((this.el.minimapSelector.height() - this.el.minimapImage.height()) / 2),
                    left: -((this.el.minimapSelector.width() - this.el.minimapImage.width()) / 2)
                });
            },
            putBackInBounds: function() {
                if(this.el.image.offset().top > this.el.imageContainer.offset().top) {
                    this.el.image.offset({top: this.el.imageContainer.offset().top});
                    this.el.minimapSelector.offset({top: this.el.minimapImage.offset().top});
                }
                else if(this.el.image.offset().top + this.el.image.height() < this.el.imageContainer.offset().top + this.el.imageContainer.height()) {
                    this.el.image.offset({top: this.el.imageContainer.offset().top + this.el.imageContainer.height() - this.el.image.height()});
                    this.el.minimapSelector.offset({top: this.el.minimapImage.offset().top + this.el.minimapImage.height() - this.el.minimapSelector.height()});
                }

                if(this.el.image.offset().left > this.el.imageContainer.offset().left) {
                    this.el.image.offset({left: this.el.imageContainer.offset().left});
                    this.el.minimapSelector.offset({left: this.el.minimapImage.offset().left});
                }
                else if(this.el.image.offset().left + this.el.image.width() < this.el.imageContainer.offset().left + this.el.imageContainer.width()) {
                    this.el.image.offset({left: this.el.imageContainer.offset().left + this.el.imageContainer.width() - this.el.image.width()});
                    this.el.minimapSelector.offset({left: this.el.minimapImage.offset().left + this.el.minimapImage.width() - this.el.minimapSelector.width()});
                }

                if(this.el.image.width() < this.el.imageContainer.width()) { // too big
                    this.el.image.offset({left: this.el.imageContainer.offset().left + (this.el.imageContainer.width() - this.el.image.width()) / 2});
                    this.el.minimapSelector.offset({left: this.el.minimapImage.offset().left + (this.el.minimapImage.width() - this.el.minimapSelector.width()) / 2});
                } else if(this.el.image.height() < this.el.imageContainer.height()) { // too big
                    this.el.image.offset({top: this.el.imageContainer.offset().top + (this.el.imageContainer.height() - this.el.image.height()) / 2});
                    this.el.minimapSelector.offset({top: this.el.minimapImage.offset().top + (this.el.minimapImage.height() - this.el.minimapSelector.height()) / 2});
                }
            },
            zoom: function(value, zoomType) {
                var oldImageDimensions = {
                    width: this.el.image.width(),
                    height: this.el.image.height()
                }, oldSelectorDimensions = {
                    width: this.el.minimapSelector.width(),
                    height: this.el.minimapSelector.height()
                };

                if(this.el.imageContainer.width() >= this.el.imageContainer.height()) {
                    switch(zoomType) {
                        case 'in':
                            this.el.image.width(this.el.image.width() + this.el.image.width() * value / 100);
                            break;
                        case 'out':
                            this.el.image.width(this.el.image.width() - this.el.image.width() * value / 100);
                            break;
                        case 'to':
                            if(value === 'auto') {
                                this.el.image.css({
                                    'width':  this.el.imageContainer.width(),
                                    'height': 'auto' /*this.imageDimensions.width*/
                                });
                            } else {
                                this.el.image.width(this.imageDimensions.width * value / 100);
                            }
                    }
                    this.el.image.height(this.el.image.width() * (this.imageDimensions.height / this.imageDimensions.width));
                }
                else {
                    switch(zoomType) {
                        case 'in':
                            this.el.image.height(this.el.image.height() + this.el.image.height() * value / 100);
                            break;
                        case 'out':
                            this.el.image.height(this.el.image.height() - this.el.image.height() * value / 100);
                            break;
                        case 'to':
                            if(value === 'auto') {
                                this.el.image.css({
                                    'width':  'auto' /*this.imageDimensions.height*/,
                                    'height': this.el.imageContainer.height()
                                });
                            } else {
                                this.el.image.height(this.imageDimensions.height * value / 100);
                            }
                    }
                    this.el.image.width(this.el.image.height() * (this.imageDimensions.width / this.imageDimensions.height));
                }
/*
                if('zoomButtons' in this.el)
                    this.helpers.toggleZoomButtons.apply(this);*/
                this.helpers.adaptImage.apply(this);

                this.mapScale = {top: this.el.image.height() / this.el.minimapImage.height(),
                         left: this.el.image.width() / this.el.minimapImage.width()};

                this.el.minimapSelector.css({
                    width: this.el.imageContainer.width() / this.mapScale.left,
                    height: this.el.imageContainer.height() / this.mapScale.top
                });

                if(this.el.minimapSelector.height() > this.el.minimapImage.height())
                    this.el.minimapSelector.height(this.el.minimapImage.height())
                if(this.el.minimapSelector.width() > this.el.minimapImage.width())
                    this.el.minimapSelector.width(this.el.minimapImage.width())

                // Center zoom
                this.el.image.offset({
                    top: this.el.image.offset().top - (this.el.image.height() / 2) + (oldImageDimensions.height / 2),
                    left: this.el.image.offset().left - (this.el.image.width() / 2) + (oldImageDimensions.width / 2)
                });

                this.el.minimapSelector.offset({
                    top: this.el.minimapSelector.offset().top - (this.el.minimapSelector.height() / 2) + (oldSelectorDimensions.height / 2),
                    left: this.el.minimapSelector.offset().left - (this.el.minimapSelector.width() / 2) + (oldSelectorDimensions.width / 2)
                });
            },
            toggleZoomButtons: function() {
                if(this.el.image.width() >= this.imageDimensions.width
                    && this.el.image.height() >= this.imageDimensions.height) {
                    /*this.el.image.css({
                        'max-width': this.imageDimensions.width,
                        'max-height': this.imageDimensions.height
                    });*/
                    this.el.zoomButtons.prop('disabled', true);
                }
                else
                    this.el.zoomButtons.prop('disabled', false);

/*                if(this.el.image.width() <= this.el.imageContainer.width() || this.el.image.height() <= this.el.imageContainer.height()) {
                    this.el.zoomMinus.prop('disabled', true);
                    if(this.el.imageContainer.width() >= this.el.imageContainer.height())
                        this.el.image.css(
                            'max-width', this.el.imageContainer.width()
                        );
                    else
                        this.el.image.css(
                            'max-height', this.el.imageContainer.height()
                        );
                }
                else
                    this.el.zoomMinus.prop('disabled', false);*/
            },
            adjustZoomSlider: function() {
                var min, max;
                if(this.el.imageContainer.width() / this.el.image.width() >= this.el.imageContainer.height() / this.el.image.height()) {
                    min = this.el.imageContainer.height();
                    max = this.imageDimensions.height;
                } else {
                    min = this.el.imageContainer.width();
                    max = this.imageDimensions.width;
                }

                if(this.settings.sliderEngine === 'jqueryui') {
                    this.el.zoomSlider.slider('option', 'min', (min / max * 100 > 0 ? min / max * 100 : 0))
                                      .slider('option', 'max', 200);
                }
                else if(this.settings.sliderEngine === 'html')
                    this.el.zoomSlider.prop('min', (min / max * 100 > 0 ? min / max * 100 : 0))
                                      .prop('max', 200);

                this.helpers.placeZoomSlider.apply(this);
            },
            placeZoomSlider: function (value) {
                if(value === undefined)
                    value = this.el.image.width() / this.imageDimensions.width * 100;

                if(this.settings.sliderEngine === 'jqueryui')
                    this.el.zoomSlider.slider('option', 'value', parseFloat(value));
                else if(this.settings.sliderEngine === 'html')
                    this.el.zoomSlider.val(value);
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
        this.init = {
            set: function() {
                // Import available this.settings. set defaults if not given

                if(this.settings === undefined) // options was undefined
                    this.settings = {};

                // HTML5 fullscreen, true/false
                if(this.settings.html5Fullscreen === undefined || typeof Boolean(this.settings.html5Fullscreen) !== 'boolean')
                    this.settings.html5Fullscreen = $.fn.dvb_viewone.defaultSettings.html5Fullscreen;
                if(typeof this.settings.html5Fullscreen !== 'boolean')
                    this.settings.html5Fullscreen = Boolean(this.settings.html5Fullscreen);

                // 100%/100% CSS fullscreen, true/false
                if(this.settings.html5Fullscreen)
                    this.settings.fullscreen = true;
                else {
                    if(this.settings.fullscreen === undefined || typeof Boolean(this.settings.fullscreen) !== 'boolean')
                        this.settings.fullscreen = $.fn.dvb_viewone.defaultSettings.fullscreen;
                    if(typeof this.settings.fullscreen !== 'boolean')
                        this.settings.fullscreen = Boolean(this.settings.fullscreen);
                }

                // Minimap positionning, e.g. ['bottom', 'right']
                if(!$.isArray(this.settings.interfacesPosition) || this.settings.interfacesPosition.length !== 2)
                    this.settings.interfacesPosition = $.fn.dvb_viewone.defaultSettings.interfacesPosition;

                // Minimap size in a CSS parameters object, e.g. {'max-width': 150, height: auto}
                if(!$.isPlainObject(this.settings.minimapSize))
                    this.settings.minimapSize = $.fn.dvb_viewone.defaultSettings.minimapSize;

                // Center image on initialization, true/false
                if(this.settings.center === undefined || typeof Boolean(this.settings.center) !== 'boolean')
                    this.settings.center = $.fn.dvb_viewone.defaultSettings.center;
                if(typeof this.settings.center !== 'boolean')
                    this.settings.center = Boolean(this.settings.center);

                // Zoomed image original size, either defined in percent of its original size
                // or with a CSS parameters object
                if(typeof this.settings.startingSize !== 'string' && !$.isPlainObject(this.settings.startingSize))
                    this.settings.startingSize = $.fn.dvb_viewone.defaultSettings.startingSize;

                // Zoom interface type, e.g. 'vslider'
                if(typeof this.settings.zoomInterface !== 'string'
                    || $.inArray(this.settings.zoomInterface, this.availableZoomInterfaces) === -1)
                    this.settings.zoomInterface = $.fn.dvb_viewone.defaultSettings.zoomInterface;


                // Slider engine, e.g. 'html' (not compatible pre-IE10 and pre-Firefox 22)
                if(typeof this.settings.sliderEngine !== 'string'
                    || $.inArray(this.settings.sliderEngine, this.availableSliderEngines) === -1)
                    this.settings.sliderEngine = $.fn.dvb_viewone.defaultSettings.sliderEngine;

                // Zooming factor for the button interface,
                // used as default values for .minimap('zoomIn') and .minimap('zoomOut') methods.
                if(this.settings.zoomingFactor === undefined || typeof parseInt(this.settings.zoomingFactor, 10) !== 'number')
                    this.settings.zoomingFactor = $.fn.dvb_viewone.defaultSettings.zoomingFactor;
                if(typeof this.settings.center !== 'number') // Si tapé '20%' au lieu de 20
                    this.settings.zoomingFactor = parseInt(this.settings.zoomingFactor, 10);

                // Use navigation keys to move the image, + and - to zoom in and out,
                // and Space to center. true/false (default becomes true if fullscreen is)
                if(this.settings.keyboardShortcuts === undefined || typeof Boolean(this.settings.keyboardShortcuts) !== 'boolean')
                    this.settings.keyboardShortcuts = this.settings.fullscreen;
                if(typeof this.settings.keyboardShortcuts !== 'boolean')
                    this.settings.keyboardShortcuts = Boolean(this.settings.keyboardShortcuts);

                // Layout
                if(typeof this.settings.layout !== 'string')
                    this.settings.layout = $.fn.dvb_viewone.defaultSettings.layout;
            },
            generate: function() {
                // Elements generation

                this.el.dvb_viewone = $('<div class="dvb_viewone"></div>');
                /*if(this.settings.fullscreen)
                    this.el.closeButton = $('<button class="close">&times;</button>');*/

                    this.el.imageContainer = $('<div class="dvb_viewone_image-container"></div>');
                        this.el.image.addClass('dvb_viewone_image');
                    this.el.interfaces =$('<div class="dvb_viewone_interfaces hidden-phone hidden-phablet"></div>');
                        this.el.minimap = $('<div class="dvb_viewone_minimap"></div>');
                            this.el.minimapImage = $('<img class="dvb_viewone_minimap-image" src="' + this.el.image.prop('src') + '" />');
                            this.el.minimapSelector = $('<div class="dvb_viewone_minimap-selector"></div>');
                        this.el.zoomInterface = $('<div class="dvb_viewone_zoom-interface"></div>');

                if(this.settings.zoomInterface === 'slider' || this.settings.zoomInterface === 'hslider') {
                    if(this.settings.sliderEngine ==='jqueryui')
                        this.el.zoomSlider = $('<div class="dvb_viewone_jqueryui-hslider"></div>');
                    else if(this.settings.sliderEngine ==='html')
                        this.el.zoomSlider = $('<input class="dvb_viewone_html-hslider" type="range" />');
                }
                else if(this.settings.zoomInterface === 'vslider') {
                    if(this.settings.sliderEngine ==='jqueryui')
                        this.el.zoomSlider = $('<div class="dvb_viewone_jqueryui-vslider"></div>');
                    else if(this.settings.sliderEngine ==='html')
                        this.el.zoomSlider = $('<input class="dvb_viewone_html-vslider" type="range" />');
                }
                else if(this.settings.zoomInterface === 'buttons') {
                        this.el.zoomInterface.addClass('dvb_viewone_buttons');

                        /*this.el.zoomMinus  = $('<span class="dvb_viewone_zoom-minus svg"></span>');*/
                        /*this.el.zoomAdjust = $('<span class="dvb_viewone_zoom-adjust svg"></span>');*/
                        this.el.zoomButtons   = $('<span class="dvb_viewone_zoom-buttons"></span>');
                }
                this.el.bumper = $('<img class="dvb_viewone_bumper" />');
            },
            place: function() {
                // DOM insertion of the elements

                this.helpers.domPlace.apply(this, [this.el.dvb_viewone, this.el.image.parent(), this.el.image.index()]);

                    this.el.dvb_viewone.append(this.el.imageContainer);
                        this.el.imageContainer.append(this.el.image);


    /*            if(this.settings.fullscreen)
                    this.el.dvb_viewone.append(this.el.closeButton);*/


                if(this.settings.layout === 'toolbar') {
                    this.el.dvb_viewone.parent().parent().parent().siblings('.dvb_view_toolbar')
                                      .append(this.el.interfaces);
                } else {
                       this.el.dvb_viewone.append(this.el.interfaces);
                }
                    this.el.interfaces.append(this.el.minimap)
                                      .append(this.el.zoomInterface);
                    this.el.minimap.append(this.el.minimapSelector);


                        this.el.minimap.append(this.el.minimapImage)

                        this.el.zoomInterface.append(this.el.zoomSlider);

                if('zoomSlider' in this.el)
                        this.el.zoomInterface.append(this.el.zoomSlider);
                else if('zoomButtons' in this.el)
                        this.el.zoomInterface.append(this.el.zoomButtons)
                                             /*.append(this.el.zoomAdjust)*/;
                else
                    this.el.zoomInterface.hide();

                this.helpers.domPlace.apply(this, [this.el.bumper, this.el.dvb_viewone.parent(), this.el.dvb_viewone.index() + 1]);
            },
            stylize: function() {
                // Dynamic styles

                this.el.bumper.css({
                    width:        this.el.image.css('width'),
                    height:       this.el.image.css('height'),
                    'max-width':  this.el.image.css('max-width'),
                    'max-height': this.el.image.css('max-height'),
                    margin:       this.el.image.css('margin'),
                    border:       this.el.image.css('border'),
                    padding:      this.el.image.css('padding'),
                    display:      this.el.image.css('display'),
                    position:     this.el.image.css('position'),
                    top:          this.el.image.css('top'),
                    left:         this.el.image.css('left')
                })
                .prop('src', this.el.image.prop('src')); // Firefox

                this.el.minimap.css({
                    width: this.settings.minimapSize.width,
                    height: this.settings.minimapSize.height
                });

                if($.inArray('top', this.settings.interfacesPosition) !== -1)
                    this.el.interfaces.css('top', '75px');
                if($.inArray('left', this.settings.interfacesPosition) !== -1)
                    this.el.interfaces.css('left', '15px');
                if($.inArray('bottom', this.settings.interfacesPosition) !== -1)
                    this.el.interfaces.css('bottom', '15px');
                if($.inArray('right', this.settings.interfacesPosition) !== -1)
                    this.el.interfaces.css('right', '45px');

                if(this.settings.layout === 'toolbar') {
                    this.el.minimapImage.css('max-height', '52px');
                } else {
                    this.el.minimapImage.css(this.settings.minimapSize);
                }

                if(this.settings.fullscreen) {
                    this.el.dvb_viewone.css({
                        width: '100%',
                        height: '100%',
                        left: 0,
                        top: 0
                    });

                    this.el.image.css({
/*                      'max-width':  imageDimensions.width,
                        'max-height': imageDimensions.height,*/
                        'width':     'auto',
                        'height':    'auto'
                    });

                    this.el.imageContainer.css({
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    });
                } else {
                    this.el.dvb_viewone.css({
                        width:  this.el.image.width(),
                        height: this.el.image.height(),
                        left:   this.el.image.offset().left,
                        top:    this.el.image.offset().top
                    });

                    this.el.imageContainer.css({
                        width:  this.el.image.width(),
                        height: this.el.image.height()
                    });
                }

                if(this.settings.html5Fullscreen)
                    $(document).fullScreen(true);

                this.el.image.css({
                    width: 'auto',
                    height: 'auto',
                    'max-width': 'none',
                    'max-height': 'none',
                    margin: 0
                });

                if(typeof this.settings.startingSize === 'string') {
                    if(this.settings.startingSize === 'auto') {
                        if(this.el.imageContainer.width() / this.el.image.width() >= this.el.imageContainer.height() / this.el.image.height()) {
                            this.el.image.css({
                                'width':  this.el.imageContainer.width(),
                                'height': 'auto' /*this.imageDimensions.width*/
                            });
                        } else {
                            this.el.image.css({
                                'width':  'auto' /*this.imageDimensions.height*/,
                                'height': this.el.imageContainer.height()
                            });
                        }
                    } else {
                        this.el.image.css({
                            'width':  this.imageDimensions.width * parseInt(this.settings.startingSize, 10) / 100,
                            'height': this.imageDimensions.height * parseInt(this.settings.startingSize, 10) / 100
                        });
                    }
                } else {
                    this.el.image.css(this.settings.startingSize);
                }

                if(this.settings.zoomInterface === 'vslider' && this.settings.sliderEngine === 'jqueryui')
                      this.el.zoomInterface.css({height: this.el.zoomInterface.width()});
            },
            listen: function() {
                // Listeners intialization

                $(window).on('resize', {'this': this}, this.listeners.resize);
                this.el.minimap.on('click', '.dvb_viewone_minimap-image:not(.dvb_viewone_minimap-selector)', {'this': this}, this.listeners.placeMinimap);
                if('zoomSlider' in this.el) {
                    if(this.settings.sliderEngine === 'jqueryui') {
                        if(this.settings.zoomInterface === 'vslider')
                            this.el.zoomSlider.slider({
                                orientation: "vertical",
                                min: parseFloat(10),
                                max: parseFloat(100),
                                change: this.listeners.sliderChange.bind(this),
                                slide: this.listeners.sliderChange.bind(this)
                            });
                        else
                            this.el.zoomSlider.slider({
                                min: parseFloat(10),
                                max: parseFloat(100),
                                change: this.listeners.sliderChange.bind(this),
                                slide: this.listeners.sliderChange.bind(this)
                            });
                    }
                    else if(this.settings.sliderEngine === 'html')
                        this.el.zoomSlider.on('change', {'this': this}, this.listeners.zoomTo);
                }
                else if('zoomButtons' in this.el) {
                    /*this.el.zoomMinus.on('click', {factor: this.settings.zoomingFactor, 'this': this}, this.listeners.zoomOut);*/
/*                    this.el.zoomAdjust.on('click', function() {
                        this.listeners.zoomTo.apply(this, [100]);
                        this.helpers.forceCenter.apply(this);
                    }.bind(this));*/
                    this.el.zoomButtons.on('click', {'this': this}, this.listeners.zoomButtonsClick);
                }

                if(this.settings.fullscreen) {
                    $(document).on('keydown',  {'this': this}, this.listeners.keydown);
                }

                if(this.settings.html5Fullscreen)
                    $(document).on('fullscreenchange', function() {
                        if(!$(document).fullScreen())
                            methods.destroy.apply(this.el.image);
                    });

                if(this.settings.keyboardShortcuts && !this.settings.fullscreen)
                    $(document).on('keydown',  {'this': this}, this.listeners.keydown);

                this.el.minimapSelector.udraggable({
                    containment: this.el.minimapImage,
                    drag: this.listeners.dragImage,
                    context: this
                });

                this.el.image.udraggable({
                    containment: [this.el.imageContainer.width() - this.el.image.width(),
                                  this.el.imageContainer.height() - this.el.image.height(),
                                  0,
                                  0],
                    drag: this.listeners.dragMinimap,
                    context: this
                });

                $(window).on('dvb_responsive:layout-change', {'this': this}, this.listeners.layoutChange);
                $(window).trigger('dvb_responsive:force-update');

                this.el.dvb_viewone.parent().hammer(/*{
                    transform_always_block: true,
                    drag_min_distance: 1,
                    swipe_velocity: 0.1,
                    prevent_default: true
                    }*/).on('doubletap pinch pinchin pinchout', this.listeners.gesture.bind(this));

                // Prevents the default "drag and drop" action on images.
                this.el.dvb_viewone.get(0).ondragstart = function() {
                    return false;
                };

                this.el.dvb_viewone.hammer().on('dragleft dragright dragup dragdown', function(e) {
                    var ratio = 0.7,
                        $message = $('<div class="dvb_viewone_drag-message"></div>'),
                        currentImage = this.el.dvb_viewone.parent().parent().dvb_viewer('getCurrentImage');

                    switch(e.type) {
                        case 'dragleft':
                        case 'dragright':
                            if(this.el.image.width() > $(window).width() || Math.abs(e.gesture.deltaX) < 15)
                                return;

                            if((currentImage.index === 0 && e.gesture.deltaX > 0)
                                || (currentImage.index === currentImage.total - 1 && e.gesture.deltaX < 0)) {
                                ratio = 0.1;
                                $message.addClass('disabled');
                            }

                            this.el.dvb_viewone.css({
                                position: 'relative',
                                left: e.gesture.deltaX * ratio
                            });

                            if(!$('body').has('.dvb_viewone_drag-message').length) {
                                if(e.gesture.deltaX > 0) {
                                    // message à gauche, photo précédente ?
                                    $message.addClass('left')
                                        .html('Image précédente');
                                } else {
                                    // message à droite, photo suivante ?
                                    $message.addClass('right')
                                        .html('Image suivante');
                                }
                                $message.hide()
                                        .appendTo('body')
                                        .css('top', $(window).height() / 2 - $message.height() / 2)
                                        .fadeIn(200);
                            }
                            break;
                        case 'dragup':
                        case 'dragdown':
                            if(this.el.image.height() > $(window).height() || Math.abs(e.gesture.deltaY) < 15)
                                return;

                            if((currentImage.index === 0 && e.gesture.deltaY > 0)
                                || (currentImage.index === currentImage.total - 1 && e.gesture.deltaY < 0)) {
                                ratio = 0.1;
                                $message.addClass('disabled');
                            }

                            this.el.dvb_viewone.css({
                                position: 'relative',
                                top: e.gesture.deltaY * ratio
                            });

                            if(!$('body').has('.dvb_viewone_drag-message').length) {
                                if(e.gesture.deltaY > 0) {
                                    // message en haut, photo précédente ?
                                    $message.addClass('top')
                                        .html('Image précédente');
                                } else {
                                    // message en bas, photo suivante ?
                                    $message.addClass('bottom')
                                        .html('Image suivante');
                                }
                                $message.hide()
                                        .appendTo('body')
                                        .css('left', $(window).width() / 2 - $message.width() / 2)
                                        .fadeIn(200);
                            }
                            break;
                        default:
                            return;
                    }

                    e.gesture.preventDefault();
                    e.gesture.stopPropagation();
                }.bind(this)).on('dragend', function(e) {
                    $('body').children('.dvb_viewone_drag-message').fadeOut(200, function() {
                        $(this).remove();
                    });

                    var currentImage = this.el.dvb_viewone.parent().parent().dvb_viewer('getCurrentImage'),
                        offset,
                        dimension,
                        direction,
                        dimensionValue;

                    if(parseInt(this.el.dvb_viewone.position().left, 10)) {
                        offset = parseInt(this.el.dvb_viewone.css('left'), 10);
                        dimension = 'width';
                        direction = 'left';
                        dimensionValue = this.el.dvb_viewone.width();
                    } else if(parseInt(this.el.dvb_viewone.position().top, 10)) {
                        offset = parseInt(this.el.dvb_viewone.css('top'), 10);
                        dimension = 'height';
                        direction = 'top';
                        dimensionValue = this.el.dvb_viewone.height();
                    } else {
                        this.el.dvb_viewone.animate({
                            position: 'static',
                            top: 0,
                            left: 0
                        }, 200);
                        return;
                    }

                    if(offset >= dimensionValue * 0.3) {
                        if(currentImage.index === 0) {
                            var animation = {
                                position: 'static'
                            };
                            animation[direction] = 0;
                            this.el.dvb_viewone.animate(animation, 200);
                            return;
                        }

                        var animation = {
                            position: 'relative'
                        };
                        animation[direction] = 0;
                        this.el.dvb_viewone.animate(animation, 200).promise().done(this.el.dvb_viewone.parent().parent().dvb_viewer('jumpBy', -1));
                    } else if(offset < 0 && - offset >= dimensionValue * 0.3) {
                        if(currentImage.index === currentImage.total - 1) {
                            var animation = {
                                position: 'static'
                            };
                            animation[direction] = 0;
                            this.el.dvb_viewone.animate(animation, 200);
                            return;
                        }

                        var animation = {
                            position: 'relative'
                        };
                        animation[direction] = - 0;
                        this.el.dvb_viewone.animate(animation, 200).promise().done(this.el.dvb_viewone.parent().parent().dvb_viewer('jumpBy', 1));
                    } else {
                        var animation = {
                            position: 'static'
                        };
                        animation[direction] = 0;
                        this.el.dvb_viewone.animate(animation, 200);
                    }
                    e.gesture.preventDefault();
                    e.gesture.stopPropagation();
                }.bind(this));
            }
        },
        this.listeners = {
            resize: function(e) {
                var _this;
                if(e.data === undefined)
                    _this = this;
                else
                    _this = e.data['this'];

                _this.helpers.adaptSelector.apply(_this);
                _this.helpers.adaptImage.apply(_this);
                _this.helpers.putBackInBounds.apply(_this);

                if('zoomSlider' in _this.el)
                    _this.helpers.adjustZoomSlider.apply(_this);/*
                else if('zoomButtons' in _this.el)
                    _this.helpers.toggleZoomButtons.apply(_this);*/
            },
            dragMinimap: function(e, ui) {
                this.el.minimapSelector.css({
                    top: - ui.offset.top / this.mapScale.top,
                    left: - ui.offset.left / this.mapScale.left
                });
            },
            dragImage: function(e, ui) {
                this.el.image.css({
                    top: - ui.offset.top * this.mapScale.top,
                    left: - ui.offset.left * this.mapScale.left
                });

                if(this.el.image.offset().top + this.el.image.height() < this.el.imageContainer.offset().top + this.el.imageContainer.height())
                    this.el.image.offset({top: this.el.imageContainer.offset().top + this.el.imageContainer.height() - this.el.image.height()});

                if(this.el.image.offset().left + this.el.image.width() < this.el.imageContainer.offset().left + this.el.imageContainer.width())
                    this.el.image.offset({left: this.el.imageContainer.offset().left + this.el.imageContainer.width() - this.el.image.width()});
            },
            placeMinimap: function(e) {
                var _this;
                if(e.data === undefined)
                    _this = this;
                else
                    _this = e.data['this'];

                var selectorPos = {
                    left: e.pageX - _this.el.minimapSelector.width() / 2,
                    top: e.pageY - _this.el.minimapSelector.height() / 2
                },  minimapImageOffset = {
                    left: _this.el.minimapImage.offset().left,
                    top: _this.el.minimapImage.offset().top
                };

                if(selectorPos.left < minimapImageOffset.left)
                    selectorPos.left = minimapImageOffset.left;
                else if(selectorPos.left + _this.el.minimapSelector.width() > minimapImageOffset.left + _this.el.minimapImage.width())
                    selectorPos.left = minimapImageOffset.left + _this.el.minimapImage.width() - _this.el.minimapSelector.width();

                if(selectorPos.top < minimapImageOffset.top)
                    selectorPos.top = minimapImageOffset.top;
                else if(selectorPos.top + _this.el.minimapSelector.height() > minimapImageOffset.top + _this.el.minimapImage.height())
                    selectorPos.top = minimapImageOffset.top + _this.el.minimapImage.height() - _this.el.minimapSelector.height();

                _this.el.minimapSelector.offset({
                    left: selectorPos.left,
                    top: selectorPos.top
                });

                _this.el.image.css({
                    top: - _this.el.minimapSelector.position().top * _this.mapScale.top,
                    left: - _this.el.minimapSelector.position().left * _this.mapScale.left
                });
                _this.helpers.putBackInBounds.apply(_this);
            },
            zoomIn: function(factor) {
                var _this;
                if(typeof factor === 'object') {
                    _this = factor.data['this']; // factor was an event
                    factor = factor.data.factor;
                } else
                    _this = this;

                _this.helpers.zoom.apply(_this, [factor, 'in']);
            },
            zoomOut: function(factor) {
                var _this;
                if(typeof factor === 'object') {
                    _this = factor.data['this'];
                    factor = factor.data.factor; // factor was an event
                } else
                    _this = this;

                _this.helpers.zoom.apply(_this, [factor, 'out']);

                // if zoom or center put image out of bounds, put it back.
                _this.helpers.putBackInBounds.apply(_this);
            },
            sliderChange: function(event, ui) {
                this.listeners.zoomTo.apply(this, [ui.value]);
                event.stopPropagation();
            },
            zoomTo: function(target) {
/*                if(typeof target === 'object') { // target was an event
                    if(this.settings.sliderEngine === 'jqueryui')
                        target = ui.value[0];
                    else if(this.settings.sliderEngine === 'html')
                        target = this.el.zoomSlider.val();
                }*/

                this.helpers.zoom.apply(this, [target, 'to']);

                // if zoom or center put image out of bounds, put it back.
                this.helpers.putBackInBounds.apply(this);
            },
            keydown: function(e) {
                var _this;
                if(e.data === undefined)
                    _this = this;
                else
                    _this = e.data['this'];

                if(e.which === 27 && _this.settings.fullscreen) // ESC
                    _this.methods.destroy.apply(_this.el.image);
                if(_this.settings.keyboardShortcuts) {
                    switch(e.which) {
/*                        case 32: // space
                            _this.helpers.forceCenter.apply(_this);
                            break;
                        case 37: // left arrow
                            _this.el.image.offset({left: _this.el.image.offset().left + _this.el.image.width() * 0.1});
                            _this.el.minimapSelector.offset({left: _this.el.minimapSelector.offset().left - _this.el.minimapImage.width() * 0.1});
                            break;
                        case 38: // up arrow
                            _this.el.image.offset({top: _this.el.image.offset().top + _this.el.image.height() * 0.1});
                            _this.el.minimapSelector.offset({top: _this.el.minimapSelector.offset().top - _this.el.minimapImage.height() * 0.1});
                            break;
                        case 39: // right arrow
                            _this.el.image.offset({left: _this.el.image.offset().left - _this.el.image.width() * 0.1});
                            _this.el.minimapSelector.offset({left: _this.el.minimapSelector.offset().left + _this.el.minimapImage.width() * 0.1});
                            break;
                        case 40: // down arrow
                            _this.el.image.offset({top: _this.el.image.offset().top - _this.el.image.height() * 0.1});
                            _this.el.minimapSelector.offset({top: _this.el.minimapSelector.offset().top + _this.el.minimapImage.height() * 0.1});
                            break;*/
                        case 107: // num plus
                        case 187: // plus
                            _this.methods.zoomIn.apply(_this, [_this.settings.zoomingFactor]);
                            break;
                        case 54: // minus
                        case 109: // num minus
                            _this.methods.zoomOut.apply(_this, [_this.settings.zoomingFactor]);
                            break;
                        default:
                            return;
                    }
                    _this.helpers.adaptSelector.apply(_this);
                    _this.helpers.putBackInBounds.apply(_this);

                    return false;
                }
            },
            layoutChange: function(e, layout) {
/*                if(layout === 'phone' || layout === 'phablet') {
                    e.data['this'].el.interfaces.hide();
                } else {
                    e.data['this'].el.interfaces.show();
                }*/
            },
            gesture: function(e) {
                switch(e.type) {
                    case 'doubletap':
                        if(this.el.image.width() !== $(window).width() && this.el.image.height() !== $(window).height()) {
                            this.listeners.zoomTo.apply(this, ['auto']);
                        } else {
                            this.listeners.zoomTo.apply(this, [200]);
                        }
                    break;
                    case 'pinch':
                    break;
                    case 'pinchin':
                    break;
                    case 'pinchout':
                    break;
                };
            },
            zoomButtonsClick: function(e) {
                if((e.offsetY === undefined ? e.pageY - $(this).offset().top : e.offsetY) < Math.floor(e.data['this'].el.zoomButtons.height() / 2)) {
                    e.data['this'].listeners.zoomIn.apply(e.data['this'], [10]);
                } else {
                    e.data['this'].listeners.zoomOut.apply(e.data['this'], [10]);
                }
            }
        },
        this.methods = {
            initialize: function() {
                this.helpers.upgradeBrowserCompatibilty();

                this.el.image.on('load', function() {
                    this.helpers.getImageDimensions.apply(this, [this.el.image.prop('src')]);

                    this.init.set.apply(this);
                    this.init.generate.apply(this);
                    this.init.place.apply(this);
                    this.init.stylize.apply(this);
                    this.init.listen.apply(this);

                    this.mapScale = {top: this.el.image.height() / this.el.minimapImage.height(),
                                     left: this.el.image.width() / this.el.minimapImage.width()};

                    this.helpers.adaptSelector.apply(this);

                    if(this.settings.center)
                        this.helpers.forceCenter.apply(this);

                    if('zoomSlider' in this.el) {
                        this.helpers.adjustZoomSlider.apply(this);
                        if(isNaN(parseInt(this.settings.startingSize, 10))) {
                            if(this.settings.startingSize === 'auto') {
                                if(this.el.imageContainer.width() / this.el.image.width() >= this.el.imageContainer.height() / this.el.image.height()) {
                                    this.el.image.width(this.el.imageContainer.width());
                                    this.el.image.height(this.el.image.width() * (this.imageDimensions.height / this.imageDimensions.width));
                                } else {
                                    this.el.image.height(this.el.imageContainer.height());
                                    this.el.image.width(this.el.image.height() * (this.imageDimensions.width / this.imageDimensions.height));
                                }
                            }
                        } else {
                            this.helpers.placeZoomSlider.apply(this, [parseInt(this.settings.startingSize, 10)]);
                        }
                    }
/*
                    else if('zoomButtons' in this.el)
                        this.helpers.toggleZoomButtons.apply(this);*/

                    if(this.settings.layout === 'toolbar') {
                        this.el.dvb_viewone.parent().parent().parent().parent().dvb_view('forceToolbarAdjustment');
                    }

                }.bind(this));

                return this;
            },
            center: function() {
                this.helpers.forceCenter.apply(this);
                return this.el.image;
            },
            zoomTo: function(target) {
                if(this.el.image.width() > this.el.imageContainer.width() && this.el.image.height() > this.el.imageContainer.height()) {
                    this.listeners.zoomTo.apply(this, [parseInt(target, 10)]);

                    if(this.el.image.width() <= this.el.imageContainer.width() || this.el.image.height() <= this.el.imageContainer.height())
                        if(this.el.imageContainer.width() >= this.el.imageContainer.height())
                            this.el.image.width(this.el.imageContainer.width());
                        else
                            this.el.image.height(this.el.imageContainer.height());
                }

                return this.el.image;
            },
            zoomIn: function(factor) {
                this.listeners.zoomIn.apply(this, [(factor === undefined ? this.settings.zoomingFactor : factor)]);
                if('zoomSlider' in this.el)
                    this.helpers.placeZoomSlider.apply(this);/*
                else if('zoomButtons' in this.el)
                    this.helpers.toggleZoomButtons.apply(this);*/
                return this.el.image;
            },
            zoomOut: function(factor) {
                if(this.el.image.width() > this.el.imageContainer.width() && this.el.image.height() > this.el.imageContainer.height()) {
                    this.listeners.zoomOut.apply(this, [(factor === undefined ? this.settings.zoomingFactor : factor)]);
                    if('zoomSlider' in this.el)
                        this.helpers.placeZoomSlider.apply(this);
                    else if('zoomButtons' in this.el) {/*
                        this.helpers.toggleZoomButtons.apply(this);*/
                        return this.el.image;
                    }

                    if(this.el.image.width() <= this.el.imageContainer.width() || this.el.image.height() <= this.el.imageContainer.height())
                        if(this.el.imageContainer.width() >= this.el.imageContainer.height())
                            this.el.image.width(this.el.imageContainer.width());
                        else
                            this.el.image.height(this.el.imageContainer.height());
                }

                return this.el.image;
            },
            hide: function() {
                if(this.settings.layout === 'toolbar') {
                    this.el.interfaces.hide();
                }
            },
            show: function() {
                if(this.settings.layout === 'toolbar') {
                    this.el.interfaces.show();
                }
            },
            destroy: function() {
                // If already destroyed, interupt so as not to remove the this.el.image
                if($(this).parent('.dvb_viewone_image-container').size() === 0)
                    return false;

                this.helpers.domPlace.apply(this, [this.el.image.remove(), this.el.dvb_viewone.parent(), this.el.dvb_viewone.index()]);
                this.el.dvb_viewone.remove();

                this.el.image.css({
                    width:        this.el.bumper.css('width'),
                    height:       this.el.bumper.css('height'),
                    'max-width':  this.el.bumper.css('max-width'),
                    'max-height': this.el.bumper.css('max-height'),
                    margin:       this.el.bumper.css('margin'),
                    border:       this.el.bumper.css('border'),
                    padding:      this.el.bumper.css('padding'),
                    display:      this.el.bumper.css('display'),
                    position:     this.el.bumper.css('position'),
                    top:          this.el.bumper.css('top'),
                    left:         this.el.bumper.css('left')
                });

                $(window).off('resize', this.listeners.resize);
                if(this.settings.fullscreen)
                    $(document).off('keydown', this.listeners.keydown);
                if(this.settings.html5Fullscreen)
                    $(document).off('fullscreenchange');

                setTimeout(this.helpers.putBackInBounds, 1500);

                this.el.bumper.remove();
                return this.el.image;
            },
            image: function(img) {
                this.el.image = img;
                this.el.minimapImage.attr('src', img.attr('src'));
                this.el.image.appendTo(this.el.imageContainer).udraggable({
                    containment: [this.el.imageContainer.width() - this.el.image.width(),
                                  this.el.imageContainer.height() - this.el.image.height(),
                                  0,
                                  0],
                    drag: this.listeners.dragMinimap,
                    context: this
                });

                if(this.el.image.offset().left > 0) {
                    if(this.el.image.width() < this.el.imageContainer.width()) {
                        this.el.image.offset({left: this.el.imageContainer.offset().left + (this.el.imageContainer.width() - this.el.image.width()) / 2});
                        this.el.minimapSelector.offset({left: this.el.minimapImage.offset().left + (this.el.minimapImage.width() - this.el.minimapSelector.width()) / 2});
                    } else {
                        this.el.image.offset({left: 0});
                    }
                } else if(this.el.image.offset().left < -$(window).width()) {
                    this.el.image.offset({left: 0});
                }/*

                if(this.el.image.width() < this.el.imageContainer.width()) { // too big
                    this.el.image.offset({left: this.el.imageContainer.offset().left + (this.el.imageContainer.width() - this.el.image.width()) / 2});
                } else if(this.el.image.height() < this.el.imageContainer.height()) { // too big
                    this.el.image.offset({top: this.el.imageContainer.offset().top + (this.el.imageContainer.height() - this.el.image.height()) / 2});
                    this.el.minimapSelector.offset({top: this.el.minimapImage.offset().top + (this.el.minimapImage.height() - this.el.minimapSelector.height()) / 2});
                }*/
            },
            option: function(option, value) {
                if(value === undefined) {
                    return settings.value;
                }
                else {
                    settings.value = value;
                    return this;
                }
            }
        };
    }

    $.fn.dvb_viewone = function(method) {
        if(method === undefined || method[0] === 'init' || $.isPlainObject(method)) {
            if($(this).data('dvb_viewoneInstance') !== undefined)
                return $(this);

            $(this).data('dvb_viewoneInstance', new dvb_viewoneClass($(this), method));
            $(this).data('dvb_viewoneInstance', $(this).data('dvb_viewoneInstance').methods.initialize.apply($(this).data('dvb_viewoneInstance')));
        } else if($(this).data('dvb_viewoneInstance'))
            $(this).data('dvb_viewoneInstance').methods[method].apply($(this).data('dvb_viewoneInstance'), [].slice.call(arguments, 1));

        return $(this);

        /*if (methods[method])
            return methods[method].apply(this, [].slice.call(arguments, 1));
        else
            return methods.initialize.apply(this, arguments);*/
    };

    $.fn.dvb_viewone.defaultSettings = {
        fullscreen: false,
        html5Fullscreen: false,
        interfacesPosition: ['top', 'right'],
        minimapSize: {width: 'auto', height: 'auto'},
        center: true,
        startingSize: 'auto',
        zoomInterface: 'slider',
        sliderEngine: 'jqueryui', // 'html'
        zoomingFactor: '10%',
        keyboardShortcuts: false,
        layout: 'toolbar'
    };
}(window.jQuery));