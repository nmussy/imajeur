// Viewer dimensions fixes
// show()/hide()

;(function ($) {
    'use strict';

    var dvb_viewerClass = function(viewer, options) {
        this.settings = options,
        this.el = {dvb_viewer: viewer},
        this.slideTimer,
        this.slideDimensions,
        this.motions = [],
        this.imagesIds = [],
        this.imagesSrc = [],
        this.thumbsSrc = [],
        this.images = [],
        this.thumbs = [],
        this.cachedImages = [],
        this.imagesTotal = [],
        this.fullImagesSrc,
        this.spinnerTimeout,
        this.currentMotion = 'all',
        this.displayImageTimeoutId,
        this.cacheImagesTimeoutId,
        this.currentImageIndex,
        this.milestones = [],
        this.availableThumbsPosition = ['top', 'bottom', 'left', 'right'],
        this.helpers = {
            getImageDimensions: function(el) {
                var result;
                if(el.attr('data-max-width') !== undefined) {
                    result = {width:  el.attr('data-max-width'),
                              height: el.attr('data-max-height')};
                } else {
                    var img = $('<img />').css('visibility', 'hidden').prop('src', el.prop('src')).appendTo('body');
                    result = {
                        width:  img.width(),
                        height: img.height()
                    };
                    img.remove();
                    el.attr('data-max-width', result.width).attr('data-max-height', result.height);
                }
                return result;
            },
            getIndexFromDate: function(motionIndex, date) {
                var imageIndex = this.imagesIds[motionIndex].length - 1;
                // dumb method
                for(; imageIndex > 0; --imageIndex) {
                    var src = this.imagesIds[motionIndex][imageIndex],
                        srcDate = new Date('20' + src.substr(src.length - 13, 2), parseInt(src.substr(length - 11, 2), 10) - 1, src.substr(src.length - 9, 2));
                    if(srcDate.getTime() >= date.getTime()) {
                        break;
                    }
                }
                return this.imagesIds[motionIndex].length - imageIndex;
            },
            displayNthImage: function(index, onLoadHandler, overrideIndexCheck, overrideCursorCheck) {
                if(index == this.el.slideContainer.find('.dvb_viewone_image').data('index') && overrideIndexCheck !== true)
                    return;
                var src = this.imagesSrc[this.currentMotion],
                    cache = this.cachedImages[this.currentMotion];

                if(this.displayImageTimeoutId !== undefined) {
                    clearTimeout(this.displayImageTimeoutId);
                    this.displayImageTimeoutId = undefined;
                }
                this.slideDimensions = undefined;
                if(this.cacheImagesTimeoutId !== undefined) {
                    clearTimeout(this.cacheImagesTimeoutId);
                    this.cacheImagesTimeoutId = undefined;
                }
                if(index >= src.length) {
                    if(this.settings.loop)
                        index = 0;
                    else {
                        this.methods.pause.apply(this);
                        index = src.length - 1;
                    }
                } else if(index < 0) {
                    if(this.settings.loop)
                        index = src.length - 1;
                    else
                        index = 0;
                }
                if(!this.settings.loop) {
                    if(index <= 0)
                        this.el.previousButton.addClass('disabled');
                    else
                        this.el.previousButton.removeClass('disabled');

                    if(index >= src.length - 1 && !this.settings.loop) {
                        this.el.nextButton.addClass('disabled');
                        this.el.playResumeButton.addClass('loopback');
                    }
                    else {
                        this.el.nextButton.removeClass('disabled');
                        this.el.playResumeButton.removeClass('loopback');
                    }
                }

                if(index == this.el.slideContainer.find('.dvb_viewone_image').data('index')
                    && overrideIndexCheck !== true)
                    return;

                if(this.imagesSrc[this.currentMotion][index] === undefined) {
                    var data = {};
                    data.dv_photo_nIdSite = this.el.dvb_viewer.data('site');
                    data.orderBy  = 'ORDER BY dv_photo.nDatePost ASC';

                    data.nLimit = 100;

                    data.nLimitOffset = (index - 50 < 0 ? 0 : index - 50);


                    data.pgl = 'Photo/FetchPhoto';
                    this.async.fetchPhoto.apply(this, [{
                        type:'post',
                        url: 'http://www.devisubox.com/dv/dv.php5',
                        data: data
                    }, true]);

                    return false;
                }

                var rearmTimer = false;
                if(this.slideTimer !== undefined && this.slideTimer.isArmed()) {
                    this.settings.playOnStart = false;
                    this.slideTimer.stop();
                    this.slideTimer = undefined;
                    rearmTimer = true;
                } else if(this.settings.playOnStart) {
                    rearmTimer = true;
                }

/*                if(this.spinnerTimeout !== undefined) {
                    clearTimeout(this.spinnerTimeout);
                    this.spinnerTimeout = undefined;
                    this.el.spinner.hide();
                }*/
                if(typeof onLoadHandler !== 'function')
                    this.displayImageTimeoutId = setTimeout(callDisplayFunction.bind(this), 300);
                else
                    callDisplayFunction.apply(this);

                function callDisplayFunction() {
                    if(this.images[this.currentMotion][index] === undefined || !cache[index]) {
                        this.helpers.displayUncachedImage.apply(this, [src, cache, index, rearmTimer, onLoadHandler]);
                    } else {
                        this.helpers.displayCachedImage.apply(this, [src, index, rearmTimer, onLoadHandler]);
                        this.cacheImagesTimeoutId = setTimeout(this.helpers.cacheImages.bind(this, index, 2), 1000);
                    }
                }

                if(this.settings.displayThumbs)
                    $.each(this.el.thumbContainer.children(), function() {
                        $(this).removeClass('selected');
                    });

                var _index = this.currentImageIndex;
                this.currentImageIndex = index;

                if(overrideCursorCheck !== true) {
                    if(this.el.timescopeSlider.hasClass('allPhotos')) {
                        var currentId = this.imagesIds[this.currentMotion][index],
                            currentDate = new Date('20' + currentId.substr(currentId.length - 13, 2), parseInt(currentId.substr(currentId.length - 11, 2), 10) - 1, currentId.substr(currentId.length - 9, 2));
                        this.el.timescopeSlider.slider('option', 'value', this.el.timescopeSlider.slider('option', 'value') + index - _index);
                    } else {
                        this.el.timescopeSlider.slider('option', 'value', index);
                    }
                }

                if(this.settings.displayThumbs)
                    this.helpers.placeThumbs.apply(this);
            },
            displayUncachedImage: function(src, cache, index, rearmTimer, onLoadHandler) {
                var transition = this.settings.transition;


                if(($.browser.msie && $.browser.version < 9) || typeof onLoadHandler === 'function')
                    transition = 'none';

                if(($.browser.msie && $.browser.version < 9) || $.browser.safari || $.browser.iphone) {
                    this.spinnerTimeout = setTimeout(function() {
                        this.el.spinner.show();
                    }.bind(this), 500);

                    this.images[this.currentMotion][index] = $('<img data-index="' + index + '" class="dvb_viewer_slide" src="' + src[index] + '" />');

                    var newSlide = this.images[this.currentMotion][index];

                    switch(transition) {
                        case 'none':
                            this.el.slide.hide().attr('src', this.images[this.currentMotion][index].attr('src'));
                        break;
                        case 'fadeSync':
                            newSlide
                                .hide()
                                .css({
                                    height: this.el.slide.height(),
                                    width:  this.el.slide.width(),
                                    top:    this.el.slide.offset().top,
                                    left:   this.el.slide.offset().left
                                })
                                .appendTo(this.el.slide.parent());
                        break;
                    }
                    newSlide.one('load', {'this': this}, function(e) {
                        /*newSlide.show();*/
                        cache[index] = true;
                        if(e.data['this'].spinnerTimeout !== undefined) {
                            clearTimeout(e.data['this'].spinnerTimeout);
                            e.data['this'].spinnerTimeout = undefined;
                        }
                        e.data['this'].el.spinner.hide();
                        switch(transition) {
                            case 'none':
                                e.data['this'].el.slide.show().attr('data-index', index);
                                if(typeof onLoadHandler === 'function')
                                    onLoadHandler.apply(e.data['this']);
                                e.data['this'].el.dvb_viewer.trigger('dvb_viewer:imageDisplayed', [src[index], index]);
                            break;
                            case 'fadeSync':
                                newSlide.fadeIn(400);
                                e.data['this'].el.slide.fadeOut(800, function() {
                                    $.each(this.el.slideContainer.find('.dvb_viewone_image'), function(index) {
                                        if(($(this).data('dvb_viewoneInstance') !== undefined)) {
                                            newSlide.data('dvb_viewoneInstance', $(this).data('dvb_viewoneInstance'));
                                            $(this).removeData('dvb_viewoneInstance');
                                            newSlide.addClass('dvb_viewone_image').dvb_viewone('image', newSlide);
                                            return false;
                                        }
                                    });
                                    newSlide.siblings('img').remove();
                                    this.el.slide = newSlide;
                                    if(typeof onLoadHandler === 'function')
                                        onLoadHandler.apply(this);
                                    this.el.dvb_viewer.trigger('dvb_viewer:imageDisplayed', [src[index], index]);
                                }.bind(e.data['this']));
                            break;
                        }
                        if(rearmTimer) {
                            e.data['this'].slideTimer = new e.data['this'].helpers.timer(e.data['this'].listeners.timeout, e.data['this'].settings.timeout, e.data['this']);
                            if(e.data['this'].settings.playOnStart) {
                                e.data['this'].settings.playOnStart = false;
                                e.data['this'].helpers.displayFlashingIcon('play');
                            }
                        }
                        e.data['this'].helpers.cacheImages.apply(e.data['this'], [index, 2]);
                    });
                    return;
                }

                var imageId = src[index].substr(this.settings.imagesPrefix.length, src[index].length - this.settings.imagesPrefix.length - this.settings.imagesSuffix.length);

                $.ajax({
                    xhr: function() {
                        var xhr = new XMLHttpRequest();
                        if(xhr.addEventListener)
                            xhr.addEventListener("progress", function(e) {
                                this.el.progressBar.show().css('width', e.loaded / e.total * 100 + '%');
                            }.bind(this));

                        return xhr;
                    }.bind(this),
                    data: {
                        pgl: 'Photo/SendBase64',
                        sIdPhoto: imageId
                    },
                    success: function(data) {
                        this.el.progressBar.fadeOut(400, function() {
                            $(this).width(0);
                        });

                        this.images[this.currentMotion][index] =
                            $('<img data-index="' + index + '" class="dvb_viewer_slide" src="data:image/png;base64,' + data + '" data-src="' + src[index] + '" />');
                        var newSlide = this.images[this.currentMotion][index];

                        switch(transition) {
                            case 'none':
                                this.el.slide.hide().attr('src', newSlide.attr('src'));
                                if(newSlide.data('src'))
                                    this.el.slide.attr('data-src', newSlide.attr('data-src'));
                            break;
                            case 'fadeSync':
                                newSlide
                                    .hide()
                                    .css({
                                        height: this.el.slide.height(),
                                        width:  this.el.slide.width(),
                                        top:    this.el.slide.offset().top,
                                        left:   this.el.slide.offset().left
                                    })
                                    .appendTo(this.el.slide.parent());
                            break;
                        }

                        cache[index] = true;
                        switch(transition) {
                            case 'none':
                                this.el.slide.show().attr('data-index', index);

                                if(typeof onLoadHandler === 'function')
                                    onLoadHandler.apply(this);
                                this.el.dvb_viewer.trigger('dvb_viewer:imageDisplayed', [src[index], index]);
                                break;
                            case 'fadeSync':
                                newSlide.fadeIn(400);
                                this.el.slide.fadeOut(800, function() {
                                    $.each(this.el.slideContainer.find('.dvb_viewone_image'), function(index) {
                                        if(($(this).data('dvb_viewoneInstance') !== undefined)) {
                                            newSlide.data('dvb_viewoneInstance', $(this).data('dvb_viewoneInstance'));
                                            $(this).removeData('dvb_viewoneInstance');
                                            newSlide.addClass('dvb_viewone_image').dvb_viewone('image', newSlide);
                                            return false;
                                        }
                                    });
                                    newSlide.siblings('img').remove();
                                    this.el.slide = newSlide;
                                    if(typeof onLoadHandler === 'function')
                                        onLoadHandler.apply(this);
                                    this.el.dvb_viewer.trigger('dvb_viewer:imageDisplayed', [src[index], index]);
                                }.bind(this));
                                break;
                        }

                        if(rearmTimer) {
                            this.slideTimer = new this.helpers.timer(this.listeners.timeout, this.settings.timeout, this);
                            if(this.settings.playOnStart) {
                                this.settings.playOnStart = false;
                                this.helpers.displayFlashingIcon('play');
                            }
                        }
                        this.helpers.cacheImages.apply(this, [index, 2]);
                    }.bind(this)
                });
            },
            displayCachedImage: function(src, index, rearmTimer, onLoadHandler) {
                var newSlide = this.images[this.currentMotion][index],
                    transition = this.settings.transition;

                if(($.browser.msie && $.browser.version < 9) || typeof onLoadHandler === 'function')
                    transition = 'none';

                switch(transition) {
                    case 'none':
                        this.el.slide.attr('src', this.images[this.currentMotion][index].attr('src'))
                                     .attr('data-index', index);
                        break;
                    case 'fadeSync':
                        newSlide.hide()
                                .css({
                                    height: this.el.slide.height(),
                                    width:  this.el.slide.width(),
                                    top:    this.el.slide.offset().top,
                                    left:   this.el.slide.offset().left
                                })
                                .attr('data-index', index)
                                .appendTo(this.el.slide.parent())
                                .fadeIn(400);
                        this.el.slide.fadeOut(800, function() {
                            $.each(this.el.slideContainer.find('.dvb_viewone_image'), function(index) {
                                if(($(this).data('dvb_viewoneInstance') !== undefined)) {
                                    newSlide.data('dvb_viewoneInstance', $(this).data('dvb_viewoneInstance'));
                                    $(this).removeData('dvb_viweoneInstance');
                                    newSlide.addClass('dvb_viewone_image').dvb_viewone('image', newSlide);
                                    return false;
                                }
                            });
                            newSlide.siblings('img').remove();
                            this.el.slide = newSlide;
                        }.bind(this));
                    break;
                }
                if(rearmTimer) {
                    this.slideTimer = new this.helpers.timer(this.listeners.timeout, this.settings.timeout, this);
                    if(this.settings.playOnStart) {
                        this.settings.playOnStart = false;
                        this.helpers.displayFlashingIcon('play');
                    }
                }
                this.el.dvb_viewer.trigger('dvb_viewer:imageDisplayed', [src[index], index]);
                if(typeof onLoadHandler === 'function')
                    onLoadHandler.apply(this);
            },
            timer: function(callback, delay, context) {
                var timerId, start, remaining = delay, isArmed = false;

                this.pause = function() {
                    clearTimeout(timerId);
                    remaining -= new Date().getTime() - start.getTime();
                    isArmed = false;
                };

                this.resume = function() {
                    start = new Date();
                    if(context !== undefined)
                        timerId = setTimeout(callback.bind(context), remaining);
                    else
                        timerId = setTimeout(callback, remaining);
                    isArmed = true;
                };

                this.stop = function() {
                    clearTimeout(timerId);
                    isArmed = false;
                };

                this.isArmed = function() {
                    return isArmed;
                }

                this.resume();
            },
            adaptSlide: function(conserveZoom) {
                this.el.slideContainer.css({
                    height: this.el.dvb_viewer.height() - (this.settings.displayThumbs ? this.el.thumbContainer.height() : 0)
                });

                if(this.slideDimensions === undefined)
                    this.slideDimensions = this.helpers.getImageDimensions(this.el.slide);

                if(conserveZoom !== true)
                    this.el.slide.css({
                        height: '100%',
                        width: '100%'
                    });

                if(this.el.slide.width() < this.el.slideContainer.width()) {
                    this.el.slide.css({
                        height: 'none',
                        width: this.el.slideContainer.width()
                    });
                    this.el.slide.css({
                        top: -(this.el.slide.height() - this.el.slideContainer.height()) / 2,
                        left: 0
                    });
                } else if(this.el.slide.height() < this.el.slideContainer.height()) {
                    this.el.slide.css({
                        height: this.el.slideContainer.height(),
                        width: 'none'
                    });
                    this.el.slide.css({
                        top: 0,
                        left: -(this.el.slide.width() - this.el.slideContainer.width()) / 2
                    });
                } else if(conserveZoom !== true) {
                    this.el.slide.css({
                        left: 0,
                        top: 0
                    });
                }

                if(this.el.slide.width() + 1 < this.el.slideContainer.width()) {
                } else if(this.el.slide.height() + 1 < this.el.slideContainer.height()) {
                }

/*                this.el.nextButton.offset({
                    top: this.el.slideContainer.offset().top + this.el.slideContainer.height() / 2,
                    left: this.el.slideContainer.offset().left + this.el.slideContainer.width() - this.el.nextButton.width()
                });

                this.el.previousButton.offset({
                    top: this.el.slideContainer.offset().top + this.el.slideContainer.height() / 2,
                    left: this.el.slideContainer.offset().left
                });*/
            },
            placeThumbs: function() {
                if(!this.thumbs[this.currentMotion])
                    this.thumbs[this.currentMotion] = [];

                this.el.thumbContainer.children(':first').css('margin-left', 2);
                var maxPlacableThumbs = Math.floor(this.el.thumbContainer.outerWidth() / 64), /* 60px + margin:2*/
                    start = this.currentImageIndex - Math.floor(maxPlacableThumbs / 2);
                if(maxPlacableThumbs > this.imagesTotal[this.currentMotion])
                    maxPlacableThumbs = this.imagesTotal[this.currentMotion];

                if(isNaN(start) || start < 0/* || this.thumbsSrc[this.currentMotion][start - 0] === undefined*/)
                    start = 0;
                else if(start + maxPlacableThumbs > this.imagesTotal[this.currentMotion] - 1)
                    start = this.imagesTotal[this.currentMotion] - maxPlacableThumbs;

                this.el.thumbContainer.empty();
                for(var i = start; i < start + maxPlacableThumbs; ++i) {
                    if(this.thumbs[this.currentMotion][i] === undefined)
                        this.thumbs[this.currentMotion][i] = $('<img data-index="' + i + '" class="dvb_viewer_thumb" src="' + this.thumbsSrc[this.currentMotion][i] + '" />');

                    this.el.thumbContainer.append(this.thumbs[this.currentMotion][i]);
                }

                this.el.thumbContainer.children(':first').css('margin-left', (this.el.thumbContainer.outerWidth() / 64 - maxPlacableThumbs) * 32);
                this.el.thumbContainer.children('[data-index="' + this.currentImageIndex + '"]') .addClass('selected');

                this.helpers.cacheThumbs.apply(this, [start, 3, maxPlacableThumbs]);
            },
            displayFlashingIcon: function(icon) {
                if(icon === 'play')
                    icon = 'http://www.devisubox.com/dv/resource/js/dvb_viewer/img/play_big_green.png';
                else if (icon === 'pause')
                    icon = 'http://www.devisubox.com/dv/resource/js/dvb_viewer/img/pause_big_green.png';

                var image = $('<img src="' + icon + '" style="display:none" />');
                image.appendTo($('body')).one('load', function() {
                    image.css({
                        display: 'block',
                        position: 'absolute',
                        left: $(document).width() / 2 - 125,
                        top: $(document).height() / 2 - 125
                    }).animate({
                        opacity: 0
                    }, 800, function(){$(this).remove();});
                });
            },
            cacheThumbs: function(from, range, max) {
                var src = this.thumbsSrc[this.currentMotion];

                if(src === undefined)
                    return;
                var cachingStart = (from - range > 0 ? from - range : 0),
                    cachingEnd = (from + max + range <= this.imagesTotal[this.currentMotion] ? from + max + range : src.length),
                    cachingImage
;
                for(i = cachingStart; i < from; ++i)
                    if(this.thumbs[this.currentMotion][i] === undefined && this.thumbsSrc[this.currentMotion][i] !== undefined)
                        this.thumbs[this.currentMotion][i] = $('<img data-index="' + i + '" class="dvb_viewer_thumb" src="' + this.thumbsSrc[this.currentMotion][i] + '" />');

                for(i = from + max; i < cachingEnd; ++i)
                    if(this.thumbs[this.currentMotion][i] === undefined && this.thumbsSrc[this.currentMotion][i] !== undefined)
                        this.thumbs[this.currentMotion][i] = $('<img data-index="' + i + '" class="dvb_viewer_thumb" src="' + this.thumbsSrc[this.currentMotion][i] + '" />');
            },
            cacheImages: function(from, range) {
                var src = this.imagesSrc[this.currentMotion],
                    cachingStart = (from - range > 0 ? from - range : 0),
                    cachingEnd = (from + range <= src.length ? from + range : src.length),
                    cachingImage;

                for(var i = cachingStart; i < from; ++i) {
                    if(this.images[this.currentMotion][i] === undefined) {
                        this.images[this.currentMotion][i] = $('<img data-index="' + i + '" class="dvb_viewer_slide" src="' + src[i] + '" />');
                        this.cachedImages[this.currentMotion][i] = false;
                        this.images[this.currentMotion][i].on('load', {'this': this, index: i}, this.listeners.markAsLoaded);
                    }
                }

                for(i = from; i < cachingEnd; ++i) {
                    if(this.images[this.currentMotion][i] === undefined) {
                        this.images[this.currentMotion][i] = $('<img data-index="' + i + '" class="' + this.el.slide.attr('class') + '" src="' + src[i] + '" />');
                        this.cachedImages[this.currentMotion][i] = false;
                        this.images[this.currentMotion][i].on('load', {'this': this, index: i}, this.listeners.markAsLoaded);
                    }
                }

            },
            initCalendario: function() {
                var limits = [];
                if(this.firstDay && this.firstDay.length === 10) {
                    limits[0] = new Date(this.firstDay);
                }
                if(this.lastDay && this.lastDay.length === 10) {
                    limits[1] = new Date(this.lastDay);
                }
                this.el.timescopeCalendario.addClass('fc-calendar-container').calendario({
                    displayWeekAbbr : true,
                    year: limits[1].getFullYear(),
                    month: limits[1].getMonth() + 1,
                    limits: limits
                }).on('calendario:dayClick', this.listeners.timescopeCalendarioDayClick.bind(this));
            },
            addTimescopeSliderMakings: function() {
                this.el.timescopeSlider.children(':not(.ui-slider-handle)').remove();
                this.el.timescopeSlider.siblings().remove();

                var monthLabels  = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'],
                    monthNames  = ['Javier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

                if(this.el.timescopeSlider.hasClass('allPhotos')) {
                    var diff  = (this.tailingDate.getTime() - this.startingDate.getTime()) / 86400000;
                    if(diff < 30) {
                        return;
                    } else if(diff < 365) {
                        return;
                        var months = Math.ceil(diff / 365 / 12),
                            firstNewMonth = diff % 365 / 12;
                    } else {
                        var firstNewYear  = new Date(this.startingDate.getFullYear() + 1, 0, 1),
                            firstNewMonth = new Date(this.startingDate.getFullYear(), this.startingDate.getMonth() + 1, 1),
                            marquers = {
                                'big': [-(this.startingDate.getTime() - firstNewYear.getTime()) / 86400000],
                                'sma': [-(this.startingDate.getTime() - firstNewMonth.getTime()) / 86400000]/*,
                                'sea': [0]*/
                            };
                        var yearlyInc = firstNewYear;
                        while((yearlyInc = new Date(yearlyInc.getFullYear() + 1, 0, 1)) < this.tailingDate) {
                            marquers.big.push(-(this.startingDate.getTime() - yearlyInc.getTime()) / 86400000);
                        }
                        var monthlyInc = firstNewMonth;
                        while((monthlyInc = new Date(monthlyInc.getFullYear(), monthlyInc.getMonth() + 1, 1)) < this.tailingDate) {
                            marquers.sma.push(-(this.startingDate.getTime() - monthlyInc.getTime()) / 86400000);
                        }

                        var cummulativeWidth = 0;
                        $.each(marquers.big, function (index, value) {
                            var valueOffset = value * this.el.timescopeSlider.width() / this.el.timescopeSlider.slider('option', 'value');

                            this.el.timescopeSlider.append(
                                $('<span class="dvb_viewer_timescope-slider-big-marquer"></span>')
                                    .css({position:'absolute', left: valueOffset}));

                            var $text = $('<span class="dvb_viewer_timescope-slider-big-text">' + (index + parseInt(this.startingDate.getFullYear().toString().substr(-2), 10) + 1) + '</span>').insertBefore(this.el.timescopeSlider);
                            valueOffset -= cummulativeWidth + $text.width() / 2;
                            $text.css({left: valueOffset});
                            cummulativeWidth += $text.width();
                        }.bind(this));

                        $.each(marquers.sma, function (index, value) {
                            var valueSlider = value * (this.imagesIds[this.currentMotion].length - 1) / diff,
                                valueOffset = value * this.el.timescopeSlider.width() / diff;

                            this.el.timescopeSlider.append(
                                $('<span class="dvb_viewer_timescope-slider-small-marquer"></span>')
                                    .css({position:'absolute', left: valueOffset}));

                            if((index - firstNewMonth.getMonth() - 12) % 4 === 0) {
                                var $text = $('<span class="dvb_viewer_timescope-slider-small-text" title="' + monthNames[(firstNewMonth.getMonth() + index) % 12] + '">'
                                                + monthLabels[(firstNewMonth.getMonth() + index) % 12] + '</span>').insertBefore(this.el.timescopeSlider);
                                valueOffset -= cummulativeWidth;
                                $text.css({left: valueOffset});
                                cummulativeWidth += $text.width();
                            }
                        }.bind(this));
                    }
                } else {
                    var start         = new Date(this.firstDay),
                        end           = new Date(this.lastDay),
                        diff          = (end.getTime() - start.getTime()) / 86400000,
    /*                  seasonsDate   = [78, 171, 264, 354],
                        seasonsLength = [93, 93, 90, 89],
                        seasonsLabel  = ["spring", "summer", "autumn", "winter"],*/
                        firstNewYear  = (new Date((start.getFullYear() + 1), 0, 1) - start) / 86400000,
                        firstNewMonth = (new Date((start.getMonth() === 11 ? (start.getFullYear() + 1) : start.getFullYear()) + '-' + (start.getMonth() === 11 ? 1 : start.getMonth() + 2) + '-01') - start) / 86400000,
                        numberOfDaysIntoCurrentYear = 365 - firstNewYear,
                        currentSeason;/*

                    if(numberOfDaysIntoCurrentYear < seasonsDate[0])
                        currentSeason = 3;
                    else if(numberOfDaysIntoCurrentYear < seasonsDate[1])
                        currentSeason = 0;
                    else if(numberOfDaysIntoCurrentYear < seasonsDate[2])
                        currentSeason = 1;
                    else
                        currentSeason = 2;*/

                    if(diff < 30) {
                        return;
                    } else if(diff < 365) {
                        return;
                        var months = Math.ceil(diff / 365 / 12),
                            firstNewMonth = diff % 365 / 12;
                    } else {
                        var years         = Math.ceil(diff / 365),
                            marquers = {
                                'big': [firstNewYear],
                                'sma': [firstNewMonth]/*,
                                'sea': [0]*/
                            };

                        for(var i = firstNewYear + 365; i < diff; i += 365) {
                            marquers.big.push(i);
                        }
                        for(i = firstNewMonth + 365 / 12; i < diff; i += 365 / 12) {
                            marquers.sma.push(i);
                        }/*

                        for(var seasonIndex = currentSeason,
                                i = seasonsDate[currentSeason] - numberOfDaysIntoCurrentYear;
                              i < diff; seasonIndex = (seasonIndex + 1 === 4 ? 0 : seasonIndex + 1), i += seasonsLength[seasonIndex]) {
                            if(i < 0)
                                continue;
                            marquers.sea.push(i);
                        }*/
                    }

                    var cummulativeWidth = 0;
                    $.each(marquers.big, function (index, value) {
                        var valueSlider = value * this.imagesTotal[this.currentMotion] / diff,
                            valueOffset = value * this.el.timescopeSlider.width() / diff;

                        this.el.timescopeSlider.append(
                            $('<span class="dvb_viewer_timescope-slider-big-marquer"></span>')
                                .css({position:'absolute', left: valueOffset}));

                        var $text = $('<span class="dvb_viewer_timescope-slider-big-text">' + (index + parseInt(start.getFullYear().toString().substr(-2), 10) + 1) + '</span>').insertBefore(this.el.timescopeSlider);
                        valueOffset -= cummulativeWidth + $text.width() / 2;
                        $text.css({left: valueOffset});
                        cummulativeWidth += $text.width();
                    }.bind(this));

                    $.each(marquers.sma, function (index, value) {
                        var valueSlider = value * this.imagesTotal[this.currentMotion] / diff,
                            valueOffset = value * this.el.timescopeSlider.width() / diff;

                        this.el.timescopeSlider.append(
                            $('<span class="dvb_viewer_timescope-slider-small-marquer"></span>')
                                .offset({left: valueOffset}));

                        if((index - firstNewMonth - 12) % 4 === 0) {
                            var $text = $('<span class="dvb_viewer_timescope-slider-small-text" title="' + monthNames[(firstNewMonth + index) % 12] + '">'
                                            + monthLabels[(firstNewMonth + index) % 12] + '</span>').insertBefore(this.el.timescopeSlider);
                            valueOffset -= cummulativeWidth;
                            $text.css({left: valueOffset});
                            cummulativeWidth += $text.width();
                        }
                    }.bind(this));
    /*
                    $.each(marquers.sea, function (index, value) {
                        var valueSlider = value * this.imagesTotal[this.currentMotion] / diff,
                            valueOffset = value * this.el.timescopeSlider.width() / diff,
                            valueWidth;

                        if(index === marquers.sea.length - 1) {
                            valueWidth = this.el.timescopeSlider.width() - valueOffset;
                        } else {
                            valueWidth = (marquers.sea[index + 1] * this.el.timescopeSlider.width() / diff) - valueOffset
                        }


                        this.el.timescopeSlider.append(
                            $('<span class="dvb_viewer_timescope-slider-season-marquer"></span>')
                                .addClass(seasonsLabel[(currentSeason + index) % 4])
                                .offset({left: valueOffset})
                                .width(valueWidth));
                    }.bind(this));
                    this.el.timescopeSlider.children('.dvb_viewer_timescope-slider-season-marquer').first().css({
                        'border-top-left-radius': 4,
                        'border-bottom-left-radius': 4
                    });
                    this.el.timescopeSlider.children('.dvb_viewer_timescope-slider-season-marquer').last().css({
                        'border-top-right-radius': 4,
                        'border-bottom-right-radius': 4
                    });*/
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
        this.async = {
            fetchPhoto: function(ajaxSettings, displayFirstImage) {
                if(this.settings.ajaxSettings === null && ajaxSettings === undefined)
                    return;
                if(ajaxSettings !== undefined)
                    this.settings.ajaxSettings = ajaxSettings;

                var userSuccess = function() {};
                if(typeof this.settings.ajaxSettings.success === 'function')
                    userSuccess = this.settings.ajaxSettings.success;

                this.settings.ajaxSettings.context = this;
                this.settings.ajaxSettings.success = function(data) {
                    userSuccess(data);
                    data = JSON.parse(data);
                    if(data.tMotion !== undefined) { // FetchPhotoDistinctLabeledMotions
                        this.imagesIds[this.currentMotion] = data.tPhoto;
                        this.imagesTotal[this.currentMotion] = data.nTotal;
                        this.motions = data.tMotion;
                        if(this.imagesTotal[this.currentMotion] - 1 === parseInt(data.tRange.end, 10) - parseInt(data.tRange.start, 10)) {
                            this.async.initAllPhotos.apply(this, [displayFirstImage]);
                        } else {
                            this.async.initPhotos.apply(this, [parseInt(data.tRange.start, 10), parseInt(data.tRange.end, 10), displayFirstImage]);
                        }


                        if(!this.milestones || !this.milestones.length)
                            this.async.fetchMilestone.apply(this);
                    } else if(data.tRange !== undefined) { // FetchPhoto
                        this.async.appendPhotos.apply(this, [parseInt(data.tRange.start, 10), parseInt(data.tRange.end, 10), data.tPhoto, displayFirstImage]);
                    }  else { // fetchMotion
                        this.imagesIds[this.currentMotion] = data;
                        this.async.initMotions.apply(this);
                    }
                }.bind(this);

                $.ajax(this.settings.ajaxSettings);
            },
            fetchMilestone: function() {
                var data = this.settings.ajaxSettings.data;
                data.pgl = 'Photo/FetchMilestones';
                data.nMilestones = this.settings.milestones;

                $.ajax({
                    type:'post',
                    url: 'http://www.devisubox.com/dv/dv.php5',
                    data: data,
                    success: function(data) {
                        data = JSON.parse(data);
                        $.each(data, function(index, id) {
                            this.milestones.push(
                                this.settings.thumbsPrefix + id + this.settings.thumbsSuffix
                            );
                        }.bind(this));
                        this.firstDay = data[0].replace(/([^\/]*\/){2}(..)(..)(..).*/, '20$2-$3-$4');
                        this.lastDay = data[data.length - 1].replace(/([^\/]*\/){2}(..)(..)(..).*/, '20$2-$3-$4');
                        this.helpers.initCalendario.apply(this);
                        this.helpers.addTimescopeSliderMakings.apply(this);
                    }.bind(this)
                });
            },
            initAllPhotos: function(displayFirstImage) {
                this.imagesSrc[this.currentMotion] = [];
                this.thumbsSrc[this.currentMotion] = [];
                this.cachedImages[this.currentMotion] = [];
                this.images[this.currentMotion] = [];
                this.thumbs[this.currentMotion] = [];

                $.each(this.imagesIds[this.currentMotion], function(index, src) {
                    this.imagesSrc[this.currentMotion][this.imagesIds[this.currentMotion].length - 1 - index] = this.settings.imagesPrefix + src + this.settings.imagesSuffix;
                    this.thumbsSrc[this.currentMotion][this.imagesIds[this.currentMotion].length - 1 - index] = this.settings.thumbsPrefix + src + this.settings.thumbsSuffix;
                }.bind(this));

                if(typeof this.settings.startingImage === 'string' && !isNaN(parseInt(this.settings.startingImage, 10))) {
                    this.settings.startingImage = parseInt(this.settings.startingImage, 10);
                }

                /** TEMP FIX **/
                if(typeof this.settings.startingImage !== 'number')
                    this.settings.startingImage = this.imagesIds[this.currentMotion].length - 1;
                this.currentImageIndex = this.settings.startingImage;

                this.startingDate = this.imagesIds[this.currentMotion][this.imagesIds[this.currentMotion].length - 1];
                this.tailingDate = this.imagesIds[this.currentMotion][0];

                var dayInMs = 86400000;

                this.startingDate = new Date('20' + this.startingDate.substr(this.startingDate.length - 13, 2), parseInt(this.startingDate.substr(this.startingDate.length - 11, 2), 10) - 1, this.startingDate.substr(this.startingDate.length - 9, 2));
                this.tailingDate  = new Date('20' + this.tailingDate.substr(this.tailingDate.length - 13, 2), parseInt(this.tailingDate.substr(this.tailingDate.length - 11, 2), 10) - 1, this.tailingDate.substr(this.tailingDate.length - 9, 2));


                if(!this.el.timescopeSlider.hasClass('ui-slider')) {
                    this.el.timescopeSlider.slider({
                        min: 0,
                        max: (this.tailingDate.getTime() - this.startingDate.getTime()) / dayInMs,
                        value: (this.tailingDate.getTime() - this.startingDate.getTime()) / dayInMs,
                        change: this.listeners.timescopeSliderChange.bind(this),
                        slide: this.listeners.timescopeSliderSlide.bind(this)
                    }).addClass('allPhotos');

                    if(Modernizr.svg) {
                        this.el.timescopeSlider.children('.ui-slider-handle').addClass('svg');
                    }

                }

                if(displayFirstImage !== false) {
                    /*this.helpers.placeThumbs.apply(this);*/
                    if(this.el.slide.attr('src') !== undefined) {
                        this.helpers.displayNthImage.apply(this, [this.settings.startingImage, function() {
                            this.async.stylize.apply(this);
                        }.bind(this), undefined, true, true]);
                    } else
                        this.helpers.displayNthImage.apply(this, [this.settings.startingImage, function() {
                            this.async.stylize.apply(this);
                        }.bind(this), undefined, true, true]);
                }
            },
            initPhotos: function(rangeStart, rangeEnd, displayFirstImage) {
                if(!this.imagesSrc[this.currentMotion] || !this.imagesSrc[this.currentMotion].length) {
                    this.imagesSrc[this.currentMotion] = [];
                    this.thumbsSrc[this.currentMotion] = [];
                    this.cachedImages[this.currentMotion] = [];
                    this.images[this.currentMotion] = [];
                    this.thumbs[this.currentMotion] = [];

                    $.each(this.imagesIds[this.currentMotion], function(index, src) {
                        this.imagesSrc[this.currentMotion][rangeEnd - index] = this.settings.imagesPrefix + src + this.settings.imagesSuffix;
                        this.thumbsSrc[this.currentMotion][rangeEnd - index] = this.settings.thumbsPrefix + src + this.settings.thumbsSuffix;
                    }.bind(this));
                } else {
                    $.each(this.imagesIds[this.currentMotion], function (index, src) {
                        this.thumbsSrc[this.currentMotion].push(this.settings.thumbsPrefix + src + this.settings.thumbsSuffix);
                    }.bind(this));
                }

                if(typeof this.settings.startingImage === 'string' && !isNaN(parseInt(this.settings.startingImage, 10))) {
                    this.settings.startingImage = parseInt(this.settings.startingImage, 10);
                }

                /** TEMP FIX **/
                if(typeof this.settings.startingImage !== 'number')
                    this.settings.startingImage = rangeEnd;
                this.currentImageIndex = this.settings.startingImage;

                if(!this.el.timescopeSlider.hasClass('ui-slider')) {
                    this.el.timescopeSlider.slider({
                        min: 0,
                        max: parseFloat(this.imagesTotal[this.currentMotion] - 1),
                        value: rangeEnd,
                        change: this.listeners.timescopeSliderChange.bind(this),
                        slide: this.listeners.timescopeSliderSlide.bind(this)
                    });

                    if(Modernizr.svg) {
                        this.el.timescopeSlider.children('.ui-slider-handle').addClass('svg');
                    }

                }

                if(displayFirstImage !== false) {
                    /*this.helpers.placeThumbs.apply(this);*/
                    if(this.el.slide.attr('src') !== undefined) {
                        this.helpers.displayNthImage.apply(this, [this.settings.startingImage, function() {
                            this.async.stylize.apply(this);
                        }.bind(this), true]);
                    } else
                        this.helpers.displayNthImage.apply(this, [this.settings.startingImage, function() {
                            this.async.stylize.apply(this);
                        }]);
                }
            },
            appendPhotos: function(rangeStart, rangeEnd, additionalIds, displayFirstImage) {
                $.each(additionalIds, function (index, src) {
                    this.imagesSrc[this.currentMotion][rangeStart + index] = this.settings.imagesPrefix + src + this.settings.imagesSuffix;
                    this.thumbsSrc[this.currentMotion][rangeStart + index] = this.settings.thumbsPrefix + src + this.settings.thumbsSuffix;
                }.bind(this));


                if(displayFirstImage !== false) {
                    this.helpers.displayNthImage.apply(this, [this.el.timescopeSlider.slider('option', 'value')]);
                    if(this.settings.displayThumbs)
                        this.helpers.placeThumbs.apply(this);
                }

                return false;
            },
            initMotions: function(motion) {
                if(this.motionsSrc === undefined) {
                    this.motionsSrc = {};
                    for(var motion in this.motions) {
                        this.motionsSrc[motion] = [];
                        $.each(this.motionsIds[motion], function (index, src) {
                            this.motionsSrc[motion][index] = this.settings.imagesPrefix + src + this.settings.imagesSuffix;
                            this.thumbsSrc[this.currentMotion].push(this.settings.thumbsPrefix + src + this.settings.thumbsSuffix);
                        }.bind(this));
                        this.cachedMotions[motion] = [];
                        this.motions[motion] = [];
                    }
                }
                else {
                    for(var motion in this.motionsIds) {
                        $.each(this.motionsIds[motion], function (index, src) {
                            this.thumbsSrc[this.currentMotion].push(this.settings.thumbsPrefix + src + this.settings.thumbsSuffix);
                        }.bind(this));
                        break;
                    }
                }
                if(this.settings.displayThumbs)
                    this.helpers.placeThumbs.apply(this);

                if(this.el.slide.attr('src') !== undefined) {
                    this.helpers.displayNthImage.apply(this, [this.settings.startingImage, function() {
                        this.async.stylize.apply(this);
                    }.bind(this), true]);
                } else
                    this.helpers.displayNthImage.apply(this, [this.settings.startingImage, function() {
                        this.async.stylize.apply(this);
                    }]);

            },
            stylize: function() {
                this.helpers.adaptSlide.apply(this);
            }
        },
        this.init = {
            set: function() {
                // Import available settings, set defaults if not given

                if(this.settings === undefined) // options was undefined
                    this.settings = {};

                // Object containing the settings of an optional AJAX ($.ajax) request, parsing the name of all the image sources to display
                if(!$.isPlainObject(this.settings.ajaxSettings))
                    this.settings.ajaxSettings = $.fn.dvb_viewer.defaultSettings.ajaxSettings;

                // Prefix to add at the begenning of every image source asynchronously fetched or manually given in this.imagesSrc
                if(typeof this.settings.imagesPrefix !== 'string')
                    this.settings.imagesPrefix = $.fn.dvb_viewer.defaultSettings.imagesPrefix;

                // Suffix to add at the end of every image source asynchronously fetched or manually given in this.imagesSrc
                if(typeof this.settings.imagesSuffix !== 'string')
                    this.settings.imagesSuffix = $.fn.dvb_viewer.defaultSettings.imagesSuffix;

                // Prefix to add at the begenning of every thumbnail source asynchronously fetched or manually given in this.thumbsSrc
                if(typeof this.settings.thumbsPrefix !== 'string')
                    this.settings.thumbsPrefix = $.fn.dvb_viewer.defaultSettings.thumbsPrefix;

                // Suffix to add at the end of every thumbnail source asynchronously fetched or manually given in this.thumbsSrc
                if(typeof this.settings.thumbsSuffix !== 'string')
                    this.settings.thumbsSuffix = $.fn.dvb_viewer.defaultSettings.thumbsSuffix;

                // First image of this.imagesSrc to display
                if(this.settings.startingImage === undefined || (typeof this.settings.startingImage !== 'string' && typeof parseInt(this.settings.startingImage, 10) !== 'number'))
                    this.settings.startingImage = $.fn.dvb_viewer.defaultSettings.startingImage;
                if(typeof this.settings.startingImage !== 'number' && typeof this.settings.startingImage !== 'string')
                    this.settings.startingImage = parseInt(this.settings.startingImage, 10);

                // Array containing the thumbnails of the this.imagesSrc
                if(typeof this.settings.thumbsPosition !== 'string' || availableThumbsPosition.indexOf(thumbsPosition) === -1)
                    this.settings.thumbsPosition = $.fn.dvb_viewer.defaultSettings.thumbsPosition;

                // HTML5 fullscreen, true/false
                if(this.settings.html5Fullscreen === undefined || typeof Boolean(this.settings.html5Fullscreen) !== 'boolean')
                    this.settings.html5Fullscreen = $.fn.dvb_viewer.defaultSettings.html5Fullscreen;
                if(typeof this.settings.html5Fullscreen !== 'boolean')
                    this.settings.html5Fullscreen = Boolean(this.settings.html5Fullscreen);

                // 100%/100% CSS fullscreen, true/false
                if(this.settings.html5Fullscreen)
                    this.settings.fullscreen = true;
                else {
                    if(this.settings.fullscreen === undefined || typeof Boolean(this.settings.fullscreen) !== 'boolean')
                        this.settings.fullscreen = $.fn.dvb_viewer.defaultSettings.fullscreen;
                    if(typeof this.settings.fullscreen !== 'boolean')
                        this.settings.fullscreen = Boolean(this.settings.fullscreen);
                }

                // Transitions
                if(typeof this.settings.transition !== 'string')
                    this.settings.transition = $.fn.dvb_viewer.defaultSettings.transition;

                // Whether or not the slideshow should be started on init, true/false
                if(this.settings.playOnStart === undefined || typeof Boolean(this.settings.playOnStart) !== 'boolean')
                    this.settings.playOnStart = $.fn.dvb_viewer.defaultSettings.playOnStart;
                if(typeof this.settings.playOnStart !== 'boolean')
                    this.settings.playOnStart = Boolean(this.settings.playOnStart);


                // Loopback when going back before the first image or after the last one, true/false
                if(this.settings.loop === undefined || typeof Boolean(this.settings.loop) !== 'boolean')
                    this.settings.loop = $.fn.dvb_viewer.defaultSettings.loop;
                if(typeof this.settings.loop !== 'boolean')
                    this.settings.loop = Boolean(this.settings.loop);

                // When to automatically switch to the next image, in ms
                if(this.settings.timeout === undefined || typeof parseInt(this.settings.timeout, 10) !== 'number')
                    this.settings.timeout = $.fn.dvb_viewer.defaultSettings.timeout;
                if(typeof this.settings.center !== 'number')
                    this.settings.timeout = parseInt(this.settings.timeout, 10);

                // Time control positionning, e.g. ['bottom', 'right']
                if(!$.isArray(this.settings.timeControlPosition) || this.settings.timeControlPosition.length !== 2)
                    this.settings.timeControlPosition = $.fn.dvb_viewer.defaultSettings.timeControlPosition;

                // Whether or not the thumbnails should be displayed
                if(this.settings.displayThumbs === undefined || typeof Boolean(this.settings.displayThumbs) !== 'boolean')
                    this.settings.displayThumbs = $.fn.dvb_viewer.defaultSettings.displayThumbs;
                if(typeof this.settings.displayThumbs !== 'boolean')
                    this.settings.displayThumbs = Boolean(this.settings.displayThumbs);

                // Keyboard shortcuts, for navigation and play/pause
                if(this.settings.keyboardShortcuts === undefined || typeof Boolean(this.settings.keyboardShortcuts) !== 'boolean')
                    this.settings.keyboardShortcuts = this.settings.fullscreen;
                if(typeof this.settings.keyboardShortcuts !== 'boolean')
                    this.settings.keyboardShortcuts = Boolean(this.settings.keyboardShortcuts);

                // First image of this.imagesSrc to display
                if(this.settings.milestones === undefined || (typeof this.settings.milestones !== 'string' && typeof parseInt(this.settings.milestones, 10) !== 'number'))
                    this.settings.milestones = $.fn.dvb_viewer.defaultSettings.milestones;
                if(typeof this.settings.milestones !== 'number' && typeof this.settings.milestones !== 'string')
                    this.settings.milestones = parseInt(this.settings.milestones, 10);

                // Layout
                if(typeof this.settings.layout !== 'string')
                    this.settings.layout = $.fn.dvb_viewer.defaultSettings.layout;
            },
            generate: function(viewerDiv) {
                // Elements generation
                this.el.dvb_viewer.addClass('dvb_viewer');

                    this.el.slideContainer = $('<div class="dvb_viewer_slide-container"></div>');
                        this.el.slide = $('<img class="dvb_viewer_slide"/>');

                    this.el.timeControl = $('<div class="dvb_viewer_time-control hidden-phone hidden-phablet dvb_responsive_dimension"></div>');
                        this.el.previousButton = $('<div class="dvb_viewer_previous-button dvb_responsive_background-size ' + (Modernizr.svg ? 'svg' : '') + '"></div>');
                        if(this.settings.timeout !== 'none') {
                            this.el.playResumeButton = $('<div class="dvb_viewer_play-resume-button dvb_responsive_background-size ' + (Modernizr.svg ? 'svg' : '') + '" data-action="play"></div>');
                        }
                        this.el.nextButton = $('<div class="dvb_viewer_next-button dvb_responsive_background-size ' + (Modernizr.svg ? 'svg' : '') + '"></div>');

                    if(this.settings.displayThumbs)
                        this.el.thumbContainer = $('<div class="dvb_viewer_thumb-container"></div>');

                    this.el.spinner = $('<img class="dvb_viewer_spinner" style="display:none" src="http://www.devisubox.com/dv/resource/js/dvb_viewer/img/spinner.gif"/>');
                    this.el.progressBar = $('<div class="dvb_viewer_progress-bar" style="display:none"> <div class="dvb_viewer_progress-bar-bubble"></div> </div>');

                    this.el.timescope = $('<div class="dvb_viewer_timescope"></div>');
                        this.el.timescopeSlider = $('<div class="dvb_viewer_timescope-slider"></div>');
                        this.el.timescopeCalendario = $('<div class="dvb_viewer_timescope-calendario dvb_responsive_text"></div>');

                    this.el.timescopeMilestone = $('<div class="dvb_viewer_timescope-milestone" style="display:none;"></div>');
                        this.el.timescopeMilestoneThumb = $('<img class="dvb_viewer_timescope-milestone-thumb" />');
            },
            place: function() {
                // DOM insertion of the elements

                $('body').append(this.el.timescopeMilestone);

                this.el.dvb_viewer.append(this.el.slideContainer)
                             .append(this.el.spinner)
                             .append(this.el.progressBar)
                             .append(this.el.timescope);

                if(this.settings.displayThumbs)
                    this.el.dvb_viewer.append(this.el.thumbContainer)


                    this.el.slideContainer.append(this.el.slide);


                    if(this.settings.layout === 'toolbar') {
                        this.el.dvb_viewer.parent().siblings('.dvb_view_toolbar')
                                          .append(this.el.timescope)
                                          .append(this.el.timeControl);
                    } else {
                        this.el.dvb_viewer.append(this.el.timescope)
                                          .append(this.el.timescopeMilestone);
                        this.el.slideContainer.append(this.el.timeControl);
                    }

                    this.el.timeControl.append(this.el.previousButton);
                    if(this.settings.timeout !== 'none')
                        this.el.timeControl.append(this.el.playResumeButton);
                    this.el.timeControl.append(this.el.nextButton);

                    this.el.timescope.append(this.el.timescopeSlider);

                    if(this.settings.layout === 'toolbar') {
                        this.el.dvb_viewer.append(this.el.timescopeCalendario);
                    } else {
                        this.el.timescope.append(this.el.timescopeCalendario);
                    }


                    this.el.timescopeMilestone.append(this.el.timescopeMilestoneThumb);
            },
            stylize: function() {
                // Dynamic styles

                if(this.settings.fullscreen) {
                    this.el.dvb_viewer.css({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        margin: 0,
                        padding: 0,
                        width: '100%',
                        height: '100%'
                    });
                    this.el.slide.css({
                        width: '100%',
                        height: '100%',
                        'margin-left': 'auto',
                        'margin-right': 'auto'
                    });
                } else {
                    this.el.dvb_viewer.css({
                        top: this.el.dvb_viewer.offset().top,
                        left: this.el.dvb_viewer.offset().left
                    });
                }

                if($.inArray('top', this.settings.timeControlPosition) !== -1)
                    this.el.timeControl.css('top', '15px');
                if($.inArray('left', this.settings.timeControlPosition) !== -1)
                    this.el.timeControl.css('left', '15px');
                if($.inArray('bottom', this.settings.timeControlPosition) !== -1)
                    this.el.timeControl.css('bottom', '15px');
                if($.inArray('right', this.settings.timeControlPosition) !== -1)
                    this.el.timeControl.css('right', '15px');

                if(this.settings.html5Fullscreen)
                    $(document).fullScreen(true);

                this.el.slideContainer.css({
                    height: this.el.dvb_viewer.height() - (this.settings.displayThumbs ? this.el.thumbContainer.height() : 0)
                });

                this.el.spinner.css({
                    top: $(document).height() / 2 - 125,
                    left: $(document).width() / 2 - 125
                });

                this.el.spinner.css({
                    top: $(document).height() / 2 - 125,
                    left: $(document).width() / 2 - 125
                });
            },
            listen: function() {
                // Listeners intialization

                this.el.timeControl.on('click', '.dvb_viewer_next-button:not(.disabled)', {'this': this}, this.listeners.nextClick);
                this.el.timeControl.on('click', '.dvb_viewer_previous-button:not(.disabled)', {'this': this}, this.listeners.previousClick);

                if(this.settings.displayThumbs)
                    this.el.thumbContainer.on('click', '.dvb_viewer_thumb', {'this': this}, this.listeners.thumbClick);

                if(this.settings.fullscreen) {
                    /*this.el.closeButton.on('click', function() {
                        if(this.settings.html5Fullscreen)
                            $(document).fullScreen(false);

                        methods.destroy.apply(this.el.image);
                    });*/
                    $(document).on('keydown', {'this': this}, this.listeners.keydown);
                }

                if(this.settings.html5Fullscreen)
                    $(document).on('fullscreenchange', function() {
                        if(!$(document).fullScreen())
                            this.methods.destroy.apply(this);
                    });

                if(this.settings.timeout !== 'none')
                    this.el.playResumeButton.one('click', {'this': this, action: (this.settings.playOnStart ? 'pause' : 'play')}, this.listeners.playResumeClick);

                if(this.settings.keyboardShortcuts && !this.settings.fullscreen)
                    $(document).on('keydown', {'this': this}, this.listeners.keydown);

/*              if(this.settings.timeout !== 'none' && this.settings.playOnStart) {
                    this.helpers.displayFlashingIcon('play');
                    this.slideTimer = new this.helpers.timer(this.listeners.timeout, this.settings.timeout, this);
                }*/

                $(window).on('resize', {'this': this}, this.listeners.resize);

                $(window).on('dvb_responsive:layout-change', {'this': this}, this.listeners.layoutChange);
                $(window).trigger('dvb_responsive:force-update');

                /*this.el.timescope.one('mouseenter', {'this': this}, this.listeners.riseTimescope);*/

                // Prevents the default "drag and drop" action on images.
                this.el.dvb_viewer.get(0).ondragstart = function() {
                    return false;
                };
            }
        },
        this.listeners = {
            nextClick: function(e) {
                if(e.data['this'].currentImageIndex !== undefined) {
                    if(e.data['this'].slideTimer !== undefined && e.data['this'].slideTimer.isArmed()) {
                        e.data['this'].el.playResumeButton.click();
                    }
                    e.data['this'].helpers.displayNthImage.apply(e.data['this'], [parseInt(e.data['this'].currentImageIndex, 10) + 1]);
                }
            },
            previousClick: function(e) {
                if(e.data['this'].currentImageIndex !== undefined) {
                    if(e.data['this'].slideTimer !== undefined && e.data['this'].slideTimer.isArmed()) {
                        e.data['this'].el.playResumeButton.click();
                    }
                    e.data['this'].helpers.displayNthImage.apply(e.data['this'], [parseInt(e.data['this'].currentImageIndex, 10) - 1]);
                }
            },
            playResumeClick: function(e) {
                if($(this).hasClass('loopback')) {
                    e.data['this'].el.timescopeSlider.slider('option', 'value', 0);
                    e.data['this'].helpers.displayNthImage.apply(e.data['this'], [0]);
                    e.data['this'].el.playResumeButton
                        .one('click', {'this': e.data['this'], action: 'play'}, e.data['this'].listeners.playResumeClick)
                        .attr('data-action', 'play');
                    return false;
                }

                var src = e.data['this'].imagesSrc[e.data['this'].currentMotion],
                    action;
                if(e.data !== undefined && e.data.action !== undefined) {
                    action = e.data.action;
                } else {
                    action = e.data['this'].el.playResumeButton.attr('data-action');
                }
                if(action === 'play') {
                    e.data['this'].el.playResumeButton
                        .one('click', {'this': e.data['this'], action: 'pause'}, e.data['this'].listeners.playResumeClick)
                        .attr('data-action', 'pause');
                    e.data['this'].helpers.displayFlashingIcon('play');
                    if(e.data['this'].slideTimer === undefined) {
                        if(e.data['this'].currentImageIndex !== undefined) {
                            /*e.data['this'].helpers.displayNthImage.apply(e.data['this'], [parseInt(e.data['this'].currentImageIndex, 10) + 1]);*/
                            if(e.data['this'].currentImageIndex < src.length - 1 || e.data['this'].settings.loop)
                                e.data['this'].slideTimer = new e.data['this'].helpers.timer(e.data['this'].listeners.timeout, e.data['this'].settings.timeout, e.data['this']);
                        }
                    }
                    else if(!e.data['this'].slideTimer.isArmed())
                        e.data['this'].slideTimer.resume();
                } else {
                    e.data['this'].el.playResumeButton
                        .one('click', {'this': e.data['this'], action: 'play'}, e.data['this'].listeners.playResumeClick)
                        .attr('data-action', 'play');
                    e.data['this'].helpers.displayFlashingIcon('pause');
                    if(e.data['this'].slideTimer !== undefined  && e.data['this'].slideTimer.isArmed())
                        e.data['this'].slideTimer.pause();
                }
            },
            thumbClick: function(e) {
                if(e.data['this'].currentImageIndex !== undefined) {
                    if(e.data['this'].slideTimer !== undefined  && e.data['this'].slideTimer.isArmed()) {
                        e.data['this'].el.playResumeButton.click();
                    }
                    e.data['this'].helpers.displayNthImage.apply(e.data['this'], [parseInt($(this).attr('data-index'), 10)]);
                }
            },
            timeout: function() {
                var src = this.imagesSrc[this.currentMotion];

                this.slideTimer = undefined;
                if(this.currentImageIndex !== undefined) {
                    this.helpers.displayNthImage.apply(this, [parseInt(this.currentImageIndex, 10) + 1]);

                    if(this.currentImageIndex < src.length - 1 || this.settings.loop)
                        this.slideTimer = new this.helpers.timer(this.listeners.timeout, this.settings.timeout, this);
                }
            },
            keydown: function(e) {
                if(e.data['this'].settings.keyboardShortcuts) {
                    switch(e.which) {
                        case 38: // up arrow
                        case 37: // left arrow
                            if(e.data['this'].slideTimer !== undefined  && e.data['this'].slideTimer.isArmed()) {
                                e.data['this'].el.playResumeButton.click();
                            }
                            e.data['this'].methods.jumpBy.apply(e.data['this'], [-1]);
                            break;
                        case 33: // page up
                            if(e.data['this'].slideTimer !== undefined  && e.data['this'].slideTimer.isArmed()) {
                                e.data['this'].el.playResumeButton.click();
                            }
                            e.data['this'].methods.jumpBy.apply(e.data['this'], [-10]);
                            break;
                        case 40: // down arrow
                        case 39: // right arrow
                            if(e.data['this'].slideTimer !== undefined  && e.data['this'].slideTimer.isArmed()) {
                                e.data['this'].el.playResumeButton.click();
                            }
                            e.data['this'].methods.jumpBy.apply(e.data['this'], [1]);
                            break;
                        case 34: // page down
                            if(e.data['this'].slideTimer !== undefined  && e.data['this'].slideTimer.isArmed()) {
                                e.data['this'].el.playResumeButton.click();
                            }
                            e.data['this'].methods.jumpBy.apply(e.data['this'], [10]);
                            break;
                        case 32: // spacebar
                            e.data['this'].el.playResumeButton.trigger('click');
                            break;
                        default:
                            return;
                    }
                    return false;
                }
            },
            resize: function(e) {
                e.data['this'].helpers.adaptSlide.apply(e.data['this'], [true]);

                if(e.data['this'].settings.displayThumbs && e.data['this'].thumbsSrc[e.data['this'].currentMotion])
                    e.data['this'].helpers.placeThumbs.apply(e.data['this']);

                e.data['this'].el.spinner.css({
                    top: $(document).height() / 2 - 125,
                    left: $(document).width() / 2 - 125
                });

                if(e.data['this'].firstDay)
                    e.data['this'].helpers.addTimescopeSliderMakings.apply(e.data['this']);
            },
            layoutChange: function(e, layout) {
                if(layout === 'phone' || layout === 'phablet') {
                    e.data['this'].el.timescope.css('right', 30);
                } else {
                    e.data['this'].el.timescope.css('right', 300);
                }
            },
            markAsLoaded: function(e) {
                e.data['this'].cachedImages[e.data['this'].currentMotion][e.data.index] = true;
            },
            collapseTimescope: function(e) {
                e.data['this'].timescopeTimeoutId = setTimeout(function () {
                    e.data['this'].el.timescope.animate({height: 6}, {
                        step: function(now, tween) {
                            e.data['this'].el.timescopeSlider.css({
                                top: now - 6
                            });
                        }
                    });
                }, 500);

                e.data['this'].el.timescope.one('mouseenter', {'this': e.data['this']}, e.data['this'].listeners.riseTimescope);
            },
            riseTimescope: function(e) {
                if(e.data['this'].timescopeTimeoutId !== undefined) {
                    clearTimeout(e.data['this'].timescopeTimeoutId);
                    e.data['this'].timescopeTimeoutId = undefined;
                }

                e.data['this'].el.timescope.animate({height: 405}, {
                    step: function(now, tween) {
                        e.data['this'].el.timescopeSlider.css({
                            top: now - 6
                        });
                    }
                });
                e.data['this'].el.timescope.one('mouseleave', {'this': e.data['this']}, e.data['this'].listeners.collapseTimescope);
            },
            timescopeSliderChange: function(e, ui) {
                this.el.timescopeMilestone.hide();
                if(this.el.timescopeSlider.hasClass('allPhotos')) {
                    var index = this.helpers.getIndexFromDate.apply(this,
                                    [this.currentMotion, new Date(this.startingDate.getTime() + this.el.timescopeSlider.slider('option', 'value') * 86400000)]
                                );
                    if(index != this.currentImageIndex) {
                        this.helpers.displayNthImage.apply(this, [index, undefined, false, true]);
                    }
                } else if(this.el.timescopeSlider.slider('option', 'value') != this.currentImageIndex) {
                    this.helpers.displayNthImage.apply(this, [
                        this.el.timescopeSlider.slider('option', 'value')
                    ], undefined, false, true);
                }

                return false;
            },
            timescopeSliderSlide: function(e, ui) {
                var milestoneIndex = Math.floor(ui.value / (this.imagesTotal[this.currentMotion] / this.settings.milestones));

                this.el.timescopeMilestoneThumb.attr('src', this.milestones[milestoneIndex]);
                this.el.timescopeMilestone.show()
                      .offset({
                        left: e.clientX - this.el.timescopeMilestone.width() / 2,
                        top: this.el.timescopeSlider.offset().top - this.el.timescopeMilestone.height() - 10
                      });
            },
            timescopeCalendarioDayClick: function(e, $wrapper, dateProperties) {
                if(this.el.timescopeSlider.hasClass('allPhotos')) {
                    var index = this.helpers.getIndexFromDate.apply(this,
                                    [this.currentMotion, new Date(dateProperties.iso)]
                                );
                    if(index != this.currentImageIndex) {
                        this.helpers.displayNthImage.apply(this, [index]);
                    }
                } else {
                    $.ajax({
                        url: 'http://www.devisubox.com/dv/dv.php5',
                        data: {
                            pgl: 'Photo/GetPhotoId',
                            dv_photo_nIdSite: this.settings.ajaxSettings.data.dv_photo_nIdSite,
                            dv_photo_nDatePost: '20' + dateProperties.deviso + '000000'
                        },
                        success: function (data) {
                            data = JSON.parse(data);
                            this.helpers.displayNthImage.apply(this, [data.nIndex]);
                        }.bind(this)
                    });
                }
            }
        },
        this.methods = {
            initialize: function() {
                // If already initalized, return .dvb_viewer
                this.helpers.upgradeBrowserCompatibilty();

                this.init.set.apply(this);
                this.init.generate.apply(this);
                this.init.place.apply(this);

                this.async.fetchPhoto.apply(this);

                this.init.stylize.apply(this);
                this.init.listen.apply(this);

                return this;
            },
            getCurrentImage: function() {
                var index = parseInt(this.currentImageIndex, 10),
                    src = this.imagesSrc[this.currentMotion],
                    ids = this.imagesIds[this.currentMotion],
                    total = this.imagesTotal[this.currentMotion],
                    result = {
                        url: src[index],
                        id: ids[index],
                        index: index,
                        total: total
                    };

                return result;
            },
            jumpTo: function(index) {
                this.helpers.displayNthImage.apply(this, [index]);
            },
            jumpBy: function(n) {
                if(this.currentImageIndex !== undefined) {
                    this.helpers.displayNthImage.apply(this, [parseInt(this.currentImageIndex, 10) + parseInt(n, 10)]);
                }
            },
            pause: function() {
                if(this.el.playResumeButton.attr('data-action') === 'pause')
                    this.el.playResumeButton.click();
            },
            resume: function() {
                this.methods.play.apply(this);
            },
            play: function() {
                if(this.el.playResumeButton.attr('data-action') === 'play')
                    this.el.playResumeButton.click();
            },
/*          stop: function() {
                if(this.slideTimer !== undefined) {
                    this.slideTimer.stop();
                    this.slideTimer = undefined;
                }
            },*/
            display: function(currentMotion, ajaxSettings) {
                this.currentMotion = currentMotion;
                if(this.cacheImagesTimeoutId !== undefined) {
                    clearTimeout(this.cacheImagesTimeoutId);
                    this.cacheImagesTimeoutId = undefined;
                }
                if(this.settings.displayThumbs) {
                    if(currentMotion === 'all') {
                        this.el.thumbContainer.fadeOut(200, function(ajaxSettings) {
                            this.thumbsSrc = [];
                            this.el.thumbContainer.empty().fadeIn(200);
                            if(this.imagesSrc.length === 0) {
                                this.async.fetchPhoto.apply(this, [ajaxSettings]);
                            } else {
                                this.async.initPhotos.apply(this);
                            }
                        }.bind(this, ajaxSettings));
                    } else if(currentMotion === 'our-selections') {
                        this.el.thumbContainer.fadeOut(200, function(ajaxSettings) {
                            this.thumbsSrc = [];
                            this.el.thumbContainer.empty().fadeIn(200);
                            if(this.motionsSrc === undefined) {
                                this.async.fetchPhoto.apply(this, [ajaxSettings]);
                            } else {
                                this.async.initMotions.apply(this);
                            }
                        }.bind(this, ajaxSettings));
                    }
                }
            },
            show: function() {
                if(this.settings.fullscreen || this.settings.keyboardShortcuts)
                    $(document).on('keydown', {'this': this}, this.listeners.keydown);

                $(window).on('resize', {'this': this}, this.listeners.resize).trigger('resize');

                this.el.dvb_viewer.show();


                if(this.settings.layout === 'toolbar') {
                    this.el.timescopeSlider.show();
                    this.el.timeControl.show();
                    this.el.slideContainer.find('.dvb_viewone_image').dvb_viewone('show');
                }

                $(window).resize();

                if(this.el.slide.data('src'))
                    this.el.dvb_viewer.trigger('dvb_viewer:imageDisplayed', [this.el.slide.data('src'), this.el.slide.data('index')]);
                else
                    this.el.dvb_viewer.trigger('dvb_viewer:imageDisplayed', [this.el.slide.attr('src'), this.el.slide.data('index')]);
            },
            hide: function() {
                this.methods.pause.apply(this);

                $(document).off('keydown', this.listeners.keydown);


                $(window).off('resize', this.listeners.resize);

                this.el.dvb_viewer.hide();

                if(this.settings.layout === 'toolbar') {
                    this.el.timescope.hide();
                    this.el.timeControl.hide();
                    this.el.slideContainer.find('.dvb_viewone_image').dvb_viewone('hide');
                }
            },
            destroy: function() {
                this.el.dvb_viewer.removeClass('dvb_viewer');
                $(document).off('keydown', this.listeners.keydown);

                if(this.slideTimer !== undefined)
                    this.slideTimer.stop();

                this.el.slideContainer.remove();
                if(this.settings.displayThumbs)
                    this.el.thumbContainer.remove();
                delete this;
            },
            showCalendario: function (e) {
                var _this = this;
                if(($('body').data('layout-type') === 'phone' || $('body').data('layout-type') === 'phablet') && Modernizr.inputtypes.date) {
                    $('<input type="date" class="dvb_view-input_date" min="' + this.startingDate.toISOString().substr(0, 10) + '" max="' + this.tailingDate.toISOString().substr(0, 10) + '" />')
                        .appendTo($('body'))
                        .on('change', function() {
                            if(!$(this).val())
                                return;
                            var result = new Date($(this).val()),
                                index = _this.helpers.getIndexFromDate.apply(_this,
                                            [_this.currentMotion, result]
                                        );

                            console.log(result);
                            console.log(index);
                            if(index != _this.currentImageIndex) {
                                _this.helpers.displayNthImage.apply(_this, [index, undefined, false, true]);
                            }

                        }).focus().click();
                } else {
                    var calendarioWrap = this.el.timescopeCalendario.parent().parent();
                    calendarioWrap.show();
                    this.el.timescopeCalendario.calendario('forceCellPlacement');
                    var centerX = $(e.target).offset().left + $(e.target).width() / 2,
                        offsetX = centerX - calendarioWrap.width() / 2 + 10,
                        offsetY = 56;


                    if(offsetX < 0) {
                        offsetX = 10;
                    } else if(offsetX + calendarioWrap.width() > $(window).width() - 10) {
                        offsetX = $(window).width() - calendarioWrap.width() - 10;
                    }

                    calendarioWrap.css({
                        opacity: 0,
                        left: offsetX,
                        bottom: offsetY - 50
                    }).animate({
                        opacity: 1,
                        bottom: offsetY
                    }, 300);
                }
            },
            hideCalendario: function (e) {
                if(($('body').data('layout-type') === 'phone' || $('body').data('layout-type') === 'phablet') && Modernizr.inputtypes.date)
                    return;

                var calendarioWrap = this.el.timescopeCalendario.parent().parent();
                calendarioWrap.animate({
                    opacity: 0,
                    bottom: parseInt(calendarioWrap.css('bottom'), 10) - 50
                }, 300, function () {
                    calendarioWrap.hide();
                });
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
        }
    };

    $.fn.dvb_viewer = function(method) {
        if(method === undefined || method[0] === 'init' || $.isPlainObject(method)) {
            if($(this).data('dvb_viewerInstance') !== undefined)
                return $(this);

            $(this).data('dvb_viewerInstance', new dvb_viewerClass($(this), method));
            $(this).data('dvb_viewerInstance', $(this).data('dvb_viewerInstance').methods.initialize.apply($(this).data('dvb_viewerInstance')));
        } else
           return $(this).data('dvb_viewerInstance').methods[method].apply($(this).data('dvb_viewerInstance'), [].slice.call(arguments, 1));

        return this;

        /*if (methods[method])
            return methods[method].apply(this, [].slice.call(arguments, 1));
        else
            return methods.initialize.apply(this, arguments);*/
    };

    $.fn.dvb_viewer.defaultSettings = {
        startingImage: '',
        transition: 'none', // ['fadeOutIn']
        timeout: 5000, // !!!! 'none' !== 0 !!!!!
        playOnStart: true,
        displayThumbs: false,
        thumbsPosition: 'bottom',
        timeControlPosition: ['bottom', 'left'],
        loop: false,
        fullscreen: false,
        html5Fullscreen: false,
        keyboardShortcuts: false,
        ajaxSettings: {},
        imagesPrefix: '',
        fullImagesPrefix: '',
        thumbsPrefix: '',
        imagesSuffix: '',
        fullImagesSuffix: '',
        thumbsSuffix: '',
        milestones: 15,
        layout: 'toolbar'
    };
}(window.jQuery));