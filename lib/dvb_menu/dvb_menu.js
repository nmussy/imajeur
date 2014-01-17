/**
 * jquery.dvb_menu.js v0.1.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Jimmy Gaussen, Devisubox
 *
 *
 * Based on Flexible Calendar
 * http://www.codrops.com
 *
 */

;(function($, window, undefined) {

	'use strict';

	$.dvb_menu = function(options, element) {

		this.$el = $(element);
		this._init(options);

	};

	$.dvb_menu.helpers = {
	    domPlace: function (element, targetElement, targetIndex) {
	        if(targetIndex === 0)
	            $(element).prependTo(targetElement);
	        else if(targetIndex === targetElement.children().size() - 1)
	            $(element).appendTo(targetElement);
	        else
	            $(element).insertAfter(targetElement.children().eq(targetIndex - 1));
	    },
		updateCustomHeaders: function() {
			var $h2   = this.$wrapper.find('.dvb_menu-h2'),
				$h3   = this.$wrapper.find('.dvb_menu-h3'),
				$next = this.$wrapper.find('.dvb_menu-next'),
				$prev = this.$wrapper.find('.dvb_menu-prev');

			$h2.html(this.options.title);
			if(this.options.subTitles[this.index])
				$h3.html(this.options.subTitles[this.index]);
			else
				$h3.html('');

			if(!this.options.loop) {
				if(this.index <= 0) {
					$prev.addClass('disabled');
				} else {
					$prev.removeClass('disabled');
				}

				if(this.index >= this.pages.length - 1) {
					$next.addClass('disabled');
				} else {
					$next.removeClass('disabled');
				}
			}

			this.$wrapper.find('.fm-menu, .dvb_menu-h3').animate({
				position: 'static',
				left: 0
			}, 200);
		}
	}

	$.dvb_menu.listeners = {
		headerClick: function(e) {
		},
		prevButtonMousedown: function(e) {
			$(document).one('mouseup', function() {
				if(this.mousedownTimeout) {
					clearTimeout(this.mousedownTimeout);
					this.mousedownTimeout = 0;
				}
				if(this.mousedownInterval) {
					clearInterval(this.mousedownInterval);
					this.mousedownInterval = 0;
					this.preventArrowClick = true;
				}
				this.$wrapper.one('mousedown', '.dvb_menu-prev:not(.disabled)', $.dvb_menu.listeners.prevButtonMousedown.bind(this));
			}.bind(this));

			this.mousedownTimeout = setTimeout(quickPrevButtonClick.bind(this), 500);
			function quickPrevButtonClick() {
				this.mousedownInterval = setInterval($.dvb_menu.listeners.prevButtonClick.bind(this), 700);
			}
		},
		prevButtonClick: function(e) {
			if(e && this.preventArrowClick) { // Do not click after mousedown/mouseup
				this.preventArrowClick = false;
				return;
			}

			this.gotoPreviousPage($.dvb_menu.helpers.updateCustomHeaders.bind(this), 'slideRight');
		},
		nextButtonMousedown: function(e) {
			$(document).one('mouseup', function() {
				if(this.mousedownTimeout) {
					clearTimeout(this.mousedownTimeout);
					this.mousedownTimeout = 0;
				}

				if(this.mousedownInterval) {
					clearInterval(this.mousedownInterval);
					this.mousedownInterval = 0;
					this.preventArrowClick = true;
				}
				this.$wrapper.one('mousedown', '.dvb_menu-next:not(.disabled)', $.dvb_menu.listeners.nextButtonMousedown.bind(this));
				e.stopPropagation();
			}.bind(this));

			this.mousedownTimeout = setTimeout(quickNextButtonClick.bind(this), 500);
			function quickNextButtonClick() {
				this.mousedownInterval = setInterval($.dvb_menu.listeners.nextButtonClick.bind(this), 700);
			}
		},
		nextButtonClick: function(e) {
			if(e && this.preventArrowClick) { // Do not click after mousedown/mouseup
				this.preventArrowClick = false;
				return;
			}
			this.gotoNextPage($.dvb_menu.helpers.updateCustomHeaders.bind(this), 'slideLeft');
		},
		dragX: function(e) {
			if(Math.abs(e.gesture.deltaX) < 3)
				return;

			var ratio = 1;
			if(e.gesture.deltaX > 0 && this.$wrapper.find('.dvb_menu-prev').hasClass('disabled')
				|| e.gesture.deltaX < 0 && this.$wrapper.find('.dvb_menu-next').hasClass('disabled')) {
				ratio = 0.3;
			}

			this.$wrapper.find('.fm-menu, .dvb_menu-h3').css({
				position: 'relative',
				left: e.gesture.deltaX * ratio
			});
			e.gesture.preventDefault();
		},
		dragEnd: function(e) {
			var offset = parseInt(this.$menu.css('left'), 10);

			if(offset >= this.$menu.width() * 0.3) {
				if(this.$wrapper.find('.dvb_menu-prev').hasClass('disabled')) {
					this.$wrapper.find('.fm-menu, .dvb_menu-h3').animate({
						position: 'static',
						left: 0
					}, 200);
					return;
				}

				this.$wrapper.find('.fm-menu, .dvb_menu-h3').animate({
					position: 'relative',
					left: this.$wrapper.width()
				}, 200).promise().done($.dvb_menu.listeners.prevButtonClick.bind(this));
			} else if(offset < 0 && - offset >= this.$menu.width() * 0.3) {
				if(this.$wrapper.find('.dvb_menu-next').hasClass('disabled')) {
					this.$wrapper.find('.fm-menu, .dvb_menu-h3').animate({
						position: 'static',
						left: 0
					}, 200);
					return;
				}

				this.$wrapper.find('.fm-menu, .dvb_menu-h3').animate({
					position: 'relative',
					left: - this.$wrapper.width()
				}, 200).promise().done($.dvb_menu.listeners.nextButtonClick.bind(this));
			} else {
				this.$wrapper.find('.fm-menu, .dvb_menu-h3').animate({
					position: 'static',
					left: 0
				}, 200);
			}
			e.gesture.preventDefault();
			e.gesture.stopPropagation();
		}
	}

	// the options
	$.dvb_menu.defaults = {
		content: [
			'<label>Placeholder <input type="checkbox"> </label>'
		],
		startingIndex: 0,
		title: 'Menu',
		limits: [],
		subTitles: [],
		loop: false,
		currentPosition: false,
		fixedDimensions: true
	};

	$.dvb_menu.prototype = {
		_init: function(options) {
			// options
			this.options = $.extend(true, {}, $.dvb_menu.defaults, options);

			this._initPages.apply(this);

			this.index = this.options.startingIndex;
			this._generateTemplate.apply(this);
			this._initEvents();

			this._generateWrapper();
			if(this.options.currentPosition)
				this._initPosition.apply(this);
			this._initListeners.apply(this);
			$.dvb_menu.helpers.updateCustomHeaders.apply(this);
		},
		_initPages: function (argument) {
			var head = '<div class="fm-body">',
				tail = '</div>';

			if(!$.isArray(this.options.content)) {
				this.options.content = [this.options.content];
			}

			var _this = this;
			this.pages = [];
			$.each(this.options.content, function(key, content) {
				_this.pages.push($(head + content + tail).attr('data-index', key));
			});

			if(this.options.fixedDimensions) {
				var maxWidth = 0,
					maxHeight = 0;

				$.each(this.pages, function(key, $page) {
					_this.$el.html($('<div class="fm-menu"></div>').html($page));
					if($page.width() > maxWidth) {
						maxWidth = $page.width();
					}
					if($page.height() > maxHeight) {
						maxHeight = $page.height();
					}
				});

				this.fixedDimensions = {
					width: maxWidth,
					height: maxHeight
				};

				this.$el.css({
					width: this.fixedDimensions.width,
					height: this.fixedDimensions.height + (this.options.currentPosition ? 40 : 0)
				}).empty();
			}
		},
		_initEvents: function() {
			$(window).on('resize', this._placeCells.bind(this));
		},
		_initListeners: function() {
			this.$wrapper.on('click',      '.dvb_menu-next:not(.disabled)', $.dvb_menu.listeners.nextButtonClick.bind(this))
						 .one('mousedown', '.dvb_menu-next:not(.disabled)', $.dvb_menu.listeners.nextButtonMousedown.bind(this));

			this.$wrapper.on('click',      '.dvb_menu-prev:not(.disabled)', $.dvb_menu.listeners.prevButtonClick.bind(this))
						 .one('mousedown', '.dvb_menu-prev:not(.disabled)', $.dvb_menu.listeners.prevButtonMousedown.bind(this));

			this.$wrapper.hammer().on('dragleft',  $.dvb_menu.listeners.dragX.bind(this))
								  .on('dragright', $.dvb_menu.listeners.dragX.bind(this))
								  .on('dragend', $.dvb_menu.listeners.dragEnd.bind(this));
		},
		_initPosition: function (argument) {
			var $currentContainer = this.$wrapper.children('.dvb_menu-current-container'),
				i = 0;
			for(; i < this.options.content.length; ++i) {
				$currentContainer.append('<span class="dvb_menu-current-bubble" data-index="' + i + '"></span>');
			};

			$($currentContainer.children()[this.index]).addClass('current');

			$currentContainer.on('click', '.dvb_menu-current-bubble:not(.current)', function (e) {
				this.gotoIndex($(e.target).data('index'), $.dvb_menu.helpers.updateCustomHeaders.bind(this));
			}.bind(this));
		},
		_placeCells: function() {
			$.each(this.$menu.find('.fm-el'), function() {
				var parent = $(this).parent();
				$(this).css({
					top: parent.height() / 2 - $(this).height() / 2,
					left: parent.width() / 2 - $(this).width() / 2,
					position: 'relative'
				});
			});
		},
		_generateWrapper: function() {
			this.$wrapper = $(
				'<div class="dvb_menu-wrap">'+
					'<div class="dvb_menu-inner">'+
						'<div class="dvb_menu-header clearfix">'+
							'<div>'+
								'<span class="dvb_menu-prev"></span>'+
								'<span class="dvb_menu-next"></span>'+
							'</div>'+
							'<h2 class="dvb_menu-h2"></h2>'+
							'<br />'+
							'<h3 class="dvb_menu-h3"></h3>'+
						'</div>'+
					'</div>'+
					(this.options.currentPosition ? '<div class="dvb_menu-current-container"></div>' : '')+
				'</div>'
			);

			$.dvb_menu.helpers.domPlace(this.$wrapper, this.$el.parent(), this.$el.index());
			this.$wrapper.children('.dvb_menu-inner').append(this.$el);
		},
		_generateTemplate: function(callback, animation) {
			if(this.$menu && this.$menu.children('.fm-body').data('index'))
				this.pages[this.$menu.children('.fm-body').data('index')] = this.$menu.children('.fm-body');


			this.$menu = $('<div class="fm-menu"></div>').append($(this.pages[this.index]).clone());

			if(this.fixedDimensions) {
				this.$menu.css(this.fixedDimensions);
			}

			// lock dimensions
			var _this = this;
			switch(animation) {
				case 'slideLeft':
                    _this.$el.find('div.fm-menu').effect('slide', {direction: 'left', mode : 'hide'}, 200, function() {
                        _this.$el.find('div.fm-menu').remove().end().append(_this.$menu);
                    	_this.$menu.hide().effect('slide', {direction: 'right', mode : 'show'}, 200, function() {
                    		if(callback) callback();
                    	});
                    	_this._placeCells();
                    });
					break;
				case 'slideRight':
                    _this.$el.find('div.fm-menu').effect('slide', {direction: 'right', mode : 'hide'}, 200, function() {
                        _this.$el.find('div.fm-menu').remove().end().append(_this.$menu);
                    	_this.$menu.hide().effect('slide', {direction: 'left', mode : 'show'}, 200, function() {
                    		if(callback) callback();
                    	});
                    	_this._placeCells();
                    });
                    break;
				case 'slideUp':
                    _this.$el.find('div.fm-menu').effect('slide', {direction: 'up', mode : 'hide'}, 200, function() {
                        _this.$el.find('div.fm-menu').remove().end().append(_this.$menu);
                    	_this.$menu.hide().effect('slide', {direction: 'down', mode : 'show'}, 200, function() {
                    		if(callback) callback();
                    	});
                    	_this._placeCells();
                    });
					break;
				case 'slideDown':
                    _this.$el.find('div.fm-menu').effect('slide', {direction: 'down', mode : 'hide'}, 200, function() {
                        _this.$el.find('div.fm-menu').remove().end().append(_this.$menu);
                    	_this.$menu.hide().effect('slide', {direction: 'up', mode : 'show'}, 200, function() {
                    		if(callback) callback();
                    	});
                    	_this._placeCells();
                    });
                    break;
				default:
					_this.$el.find('.fm-menu').remove().end().append(_this.$menu);
					_this._placeCells();
					if(callback) callback();
			}
		},
		_move: function(dir, callback, jumpBy, animation) {
			if(!jumpBy)
				jumpBy = 1;

			if(dir === 'previous') {
				this.index -= jumpBy;
			}
			else {
				this.index += jumpBy;
			}

			if(this.index < 0) {
				if(this.options.loop) {
					this.index = this.pages.length - 1;
				} else {
					this.index = 0;
				}
			}
			if(this.index > this.pages.length - 1) {
				if(this.options.loop) {
					this.index = 0;
				} else {
					this.index = this.pages.length - 1;
				}
			}

			if(this.options.currentPosition) {
				var $currentContainer = this.$wrapper.children('.dvb_menu-current-container');
				$currentContainer.children('.current').removeClass('current');
				$($currentContainer.children()[this.index]).addClass('current');
			}

			this._generateTemplate.apply(this, [callback, animation]);

		},
		/*************************
		******PUBLIC METHODS *****
		**************************/
		getIndex: function() {
			return this.index;
		},
		getPages: function() {
			return this.pagess;
		},
		// sets the current index to a given index
		setIndex: function(index) {
			this.index = index;
			this._generateTemplate.apply(this, [callback]);
		},
		// goes to specific index, with animation
		gotoIndex: function(index, callback) {
			if(index == this.index) {
				if(callback) {
					callback();
				}
				return;
			}

			if(index > this.index) {
				this._move.apply(this, ['next', callback, index - this.index, 'slideLeft']);
			} else {
				this._move.apply(this, ['previous', callback, this.index - index, 'slideRight']);
			}
		},
		gotoPreviousPage: function(callback, animation) {
			this._move.apply(this, ['previous', callback, 1, animation]);
		},
		gotoNextPage: function(callback, animation) {
			this._move.apply(this, ['next', callback, 1, animation]);
		},
		forceCellPlacement: function() {
			this._placeCells.apply(this);
		}
	};

	var logError = function(message) {
		if (window.console) {
			window.console.error(message);

		}
	};

	$.fn.dvb_menu = function(options) {
		var instance = $.data(this, 'dvb_menu');

		if (typeof options === 'string') {
			var args = Array.prototype.slice.call(arguments, 1);

			this.each(function() {
				if (!instance) {
					logError("cannot call methods on dvb_menu prior to initialization; " +
					"attempted to call method '" + options + "'");
					return;

				}

				if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
					logError("no such method '" + options + "' for dvb_menu instance");
					return;

				}

				instance[options].apply(instance, args);

			});
		}
		else {
			if (instance) {
				instance._init();
			}
			else {
				instance = $.data(this, 'dvb_menu', new $.dvb_menu(options, this));
			}
		}
		return this;

	};

})(jQuery, window);
