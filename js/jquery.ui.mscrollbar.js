/*!
 * @author Jerry Chan
 * https://github.com/dottie/dottie
 *
 * Version 1.0
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
(function($) {
	$.widget("dottie.mscrollbar", {
		options: {
			orientation:'vertical', //horizontal
			animSpeed:900,
			easeType:'easeOutCirc',
			bottomSpace:1.05,
			draggerDimType:'auto', //fixed
			mouseWheelSupport:true,
			callback: function() { return true; },
			scrollBtnsSupport:false,
			scrollUpBtn:'.scrollUpBtn',
			scrollDownBtn:'.scrollDownBtn',
			scrollBtnsSpeed:0
		},
		mScrollBox : null,
		mScrollBox_container : null,
		mScrollBox_content : null,
		dragger_container : null,
		dragger : null,
		scrollUpBtn : null,
		scrollDownBtn : null,
		mScrollBox_horWrapper : null,
		mScrollBox_loading : null,
		scrollAmount: 0,
		btnsScrollTimer: null,
		btnsScrollTimerX: null,
		_create: function() {
			var self = this;
			//self.ie = $.detectIE();
			this._detectOrientation();
			//$(self.element).css({'overflow-x':'hidden','overflow-y':'hidden'}).addClass('mScrollBox')
			//		.wrapInner('<div class="container"><div class="content"></div></div>');
			//$(self.element).append('<div class="dragger_container"><div class="dragger"></div></div>');
			$(self.element).css({'overflow-x':'hidden','overflow-y':'hidden'}).addClass('ui-scrollbar')
					.wrapInner('<div class="ui-scrollbar-' + this.orientation +
					'"><div class="ui-scrollbar-content"></div></div>');
			$(self.element).append('<div class="ui-scrollbar-handle-' + this.orientation +
					'"><div class="ui-scrollbar-handle"></div></div>');//
			if (self.orientation == "horizontal") {
				//$(self.element).wrapInner('<div class="horWrapper"></div>');
				$(self.element).wrapInner('<div class="ui-scrollbar-horizontal-wrap"></div>');
			}
			self.mScrollBox = $(self.element);
			self.mScrollBox_container = self.mScrollBox.find('.ui-scrollbar-' + this.orientation);
			self.mScrollBox_content = self.mScrollBox.find('.ui-scrollbar-content');
			self.dragger_container = self.mScrollBox.find('.ui-scrollbar-handle-' + this.orientation);//.dragger_container
			//$(self.dragger_container).append('<div class="ui-scrollbar-handle"></div>');
			self.dragger = self.dragger_container.find('.ui-scrollbar-handle');//.dragger
			self.scrollUpBtn = self.mScrollBox.find(self.options.scrollUpBtn);
			self.scrollDownBtn = self.mScrollBox.find(self.options.scrollDownBtn);
			self.mScrollBox_horWrapper = self.mScrollBox.find('.ui-scrollbar-horizontal-wrap');//.horWrapper
			if($.isFunction(self.options.callback)){
				self.mScrollBox_loading = $('<div class="ui-scrollbar-loading"></div>');
				self.mScrollBox_loading.hide().appendTo(self.mScrollBox);
			}
			if(self.mScrollBox.length == 0){return this;}
		},
		_init: function() {
			var self = this;
			//get & store minimum dragger height & width (defined in css)
			if (!self.mScrollBox.data("minDraggerHeight")) {
				self.mScrollBox.data("minDraggerHeight", self.dragger.height());
			}
			if (!self.mScrollBox.data("minDraggerWidth")) {
				self.mScrollBox.data("minDraggerWidth", self.dragger.width());
			}

			//get & store original content height & width
			if (!self.mScrollBox.data("contentHeight")) {
				self.mScrollBox.data("contentHeight", self.mScrollBox_container.height());
			}
			if (!self.mScrollBox.data("contentWidth")) {
				self.mScrollBox.data("contentWidth", self.mScrollBox_container.width());
			}
			self.CustomScroller();
			$(window).resize(function() {
				self.refresh();
			});
			/*if (self.ie && self.ie < 9) {
				setTimeout(function(){self.refresh();}, 2000);
			}*/
		},
		CustomScroller: function(reloadType) {
			var self = this, totalContent = 0;
			//horizontal scrolling ------------------------------
			if (self.orientation == "horizontal") {
				var visibleWidth = self.mScrollBox.width();
				//set content width automatically
				//self.mScrollBox_horWrapper.css("width", 999999); //set a rediculously high width value ;)
				self.mScrollBox_horWrapper.css("width", 999999);
				self.mScrollBox.data("totalContent", self.mScrollBox_container.width()); //get inline div width
				self.mScrollBox_horWrapper.css("width", self.mScrollBox.data("totalContent")); //set back the proper content width value

				if (self.mScrollBox_container.width() > visibleWidth) { //enable scrollbar if content is long
					self.dragger_container.show();
					//self.dragger.css("display", "block");
					if (reloadType != "resize" && self.mScrollBox_container.width() != self.mScrollBox.data("contentWidth")) {
						self.dragger.css("left", 0);
						self.mScrollBox_container.css("left", 0);
						self.mScrollBox.data("contentWidth", self.mScrollBox_container.width());
					}
					//self.dragger_container.css("display", "block");
					//self.scrollDownBtn.css("display", "inline-block");
					//self.scrollUpBtn.css("display", "inline-block");
					self.scrollDownBtn.show();
					self.scrollUpBtn.show();
					totalContent = self.mScrollBox_content.width();
					var minDraggerWidth = self.mScrollBox.data("minDraggerWidth");
					var draggerContainerWidth = self.dragger_container.width();

					function AdjustDraggerWidth() {
						if (self.options.draggerDimType == "auto") {
							var adjDraggerWidth = Math.round(totalContent - ((totalContent - visibleWidth) * 1.3)); //adjust dragger width analogous to content
							if (adjDraggerWidth <= minDraggerWidth) { //minimum dragger width
								self.dragger.css("width", minDraggerWidth + "px");
							} else if (adjDraggerWidth >= draggerContainerWidth) {
								self.dragger.css("width", draggerContainerWidth - 10 + "px");
							} else {
								self.dragger.css("width", adjDraggerWidth + "px");
							}
						}
					}

					AdjustDraggerWidth();

					//var targX = 0;
					var draggerWidth = self.dragger.width();
					//scroll
					//alert(draggerContainerWidth - draggerWidth);
					if(draggerContainerWidth - draggerWidth == 0){
						self.scrollAmount = (totalContent - visibleWidth) / (draggerContainerWidth - draggerWidth/3);
					}else{
						self.scrollAmount = (totalContent - visibleWidth) / (draggerContainerWidth - draggerWidth);
					}

					self.dragger.draggable({
						axis: "x",
						containment: "parent",
						drag: function(event, ui) {
							self._ScrollX();
						},
						stop: function(event, ui) {
							self._DraggerRelease();
						}
					});

					self.dragger_container.click(function(e) {
						var $this = $(this);
						var mouseCoord = (e.pageX - $this.offset().left);
						if (mouseCoord < self.dragger.position().left || mouseCoord > (self.dragger.position().left + self.dragger.width())) {
							var targetPos = mouseCoord + self.dragger.width();
							if (targetPos < self.dragger_container.width()) {
								self.dragger.css("left", mouseCoord);
								self._ScrollX();
							} else {
								self.dragger.css("left", self.dragger_container.width() - self.dragger.width());
								self._ScrollX();
							}
						}
					});

					//mousewheel
					$(function($) {
						if (self.options.mouseWheelSupport) {
							self.mScrollBox.unbind("mousewheel")
							.bind("mousewheel", function(event, delta) {
								var vel = Math.abs(delta * 10);
								self.dragger.css("left", self.dragger.position().left - (delta * vel));
								self._ScrollX();
								if (self.dragger.position().left <= 0) {
									self.dragger.css("left", 0);
									self.mScrollBox_container.stop();
									self._ScrollX();
								}
								if (self.dragger.position().left > self.dragger_container.width() - self.dragger.width()) {
									self.dragger.css("left", self.dragger_container.width() - self.dragger.width());
									self.mScrollBox_container.stop();
									self._ScrollX();
								}
								return false;
							});
						}
					});

					//scroll buttons
					if (self.options.scrollBtnsSupport) {
						self.scrollDownBtn.mouseup(
								function() {
									self._BtnsScrollXStop();
								}).mousedown(
								function() {
									self._BtnsScrollX("down");
								}).mouseout(function() {
									self._BtnsScrollXStop();
								});

						self.scrollUpBtn.mouseup(
								function() {
									self._BtnsScrollXStop();
								}).mousedown(
								function() {
									self._BtnsScrollX("up");
								}).mouseout(function() {
									self._BtnsScrollXStop();
								});

						self.scrollDownBtn.click(function(e) {
							e.preventDefault();
						});
						self.scrollUpBtn.click(function(e) {
							e.preventDefault();
						});

					}


				} else { //disable scrollbar if content is short
					//self.dragger.css("left", 0).css("display", "none"); //reset content scroll
					self.mScrollBox_container.css("left", 0);
					//self.dragger_container.css("display", "none");
					self.dragger_container.hide();
					self.scrollDownBtn.hide();
					self.scrollUpBtn.hide();
					//self.scrollDownBtn.css("display", "none");
					//self.scrollUpBtn.css("display", "none");
				}
				//vertical scrolling ------------------------------
			} else {
				var visibleHeight = self.mScrollBox.height();
				if (self.mScrollBox_container.height() > visibleHeight) { //enable scrollbar if content is long
					self.dragger_container.show();
					//self.dragger.css("display", "block");
					if (reloadType != "resize" && self.mScrollBox_container.height() != self.mScrollBox.data("contentHeight")) {
						self.dragger.css("top", 0);
						self.mScrollBox_container.css("top", 0);
						self.mScrollBox.data("contentHeight", self.mScrollBox_container.height());
					}
					//self.dragger_container.css("display", "block");
					//self.scrollDownBtn.css("display", "inline-block");
					//self.scrollUpBtn.css("display", "inline-block");
					self.scrollDownBtn.show();
					self.scrollUpBtn.show();
					totalContent = self.mScrollBox_content.height();
					var minDraggerHeight = self.mScrollBox.data("minDraggerHeight");
					var draggerContainerHeight = self.dragger_container.height();

					function AdjustDraggerHeight() {
						if (self.options.draggerDimType == "auto") {
							var adjDraggerHeight = Math.round(totalContent - ((totalContent - visibleHeight) * 1.3)); //adjust dragger height analogous to content
							if (adjDraggerHeight <= minDraggerHeight) { //minimum dragger height
								self.dragger.css("height", minDraggerHeight + "px").css("line-height", minDraggerHeight + "px");
							} else if (adjDraggerHeight >= draggerContainerHeight) {
								self.dragger.css("height", draggerContainerHeight - 10 + "px").css("line-height", draggerContainerHeight - 10 + "px");
							} else {
								self.dragger.css("height", adjDraggerHeight + "px").css("line-height", adjDraggerHeight + "px");
							}
						}
					}

					AdjustDraggerHeight();

					//var targY = 0;
					var draggerHeight = self.dragger.height();
					//scroll
					if (self.options.bottomSpace < 1) {
						self.options.bottomSpace = 1; //minimum bottomSpace value is 1
					}
					if(draggerContainerHeight - draggerHeight == 0){
						self.scrollAmount = (totalContent - (visibleHeight / self.options.bottomSpace)) / (draggerContainerHeight - draggerHeight/3);
					}else{
						self.scrollAmount = (totalContent - (visibleHeight / self.options.bottomSpace)) / (draggerContainerHeight - draggerHeight);
					}

					self.dragger.draggable({
						axis: "y",
						containment: "parent",
						drag: function(event, ui) {
							self._Scroll();
						},
						stop: function(event, ui) {
							self._DraggerRelease();
						}
					});

					self.dragger_container.click(function(e) {
						var $this = $(this);
						var mouseCoord = (e.pageY - $this.offset().top);
						if (mouseCoord < self.dragger.position().top || mouseCoord > (self.dragger.position().top + self.dragger.height())) {
							var targetPos = mouseCoord + self.dragger.height();
							if (targetPos < self.dragger_container.height()) {
								self.dragger.css("top", mouseCoord);
								self._Scroll();
							} else {
								self.dragger.css("top", self.dragger_container.height() - self.dragger.height());
								self._Scroll();
							}
						}
					});

					//mousewheel
					$(function($) {
						if (self.options.mouseWheelSupport) {
							self.mScrollBox.unbind("mousewheel")
							.bind("mousewheel", function(event, delta) {
								var vel = Math.abs(delta * 10);
								self.dragger.css("top", self.dragger.position().top - (delta * vel));
								self._Scroll();
								if (self.dragger.position().top <= 0) {
									self.dragger.css("top", 0);
									self.mScrollBox_container.stop();
									self._Scroll();
								}
								if (self.dragger.position().top > self.dragger_container.height() - self.dragger.height()) {
									self.dragger.css("top", self.dragger_container.height() - self.dragger.height());
									self.mScrollBox_container.stop();
									self._Scroll();
								}
								return false;
							});
						}
					});

					//scroll buttons
					if (self.options.scrollBtnsSupport) {
						self.scrollDownBtn.mouseup(
								function() {
									self._BtnsScrollStop();
								}).mousedown(
								function() {
									self._BtnsScroll("down");
								}).mouseout(function() {
									self._BtnsScrollStop();
								});

						self.scrollUpBtn.mouseup(
								function() {
									self._BtnsScrollStop();
								}).mousedown(
								function() {
									self._BtnsScroll("up");
								}).mouseout(function() {
									self._BtnsScrollStop();
								});

						self.scrollDownBtn.click(function(e) {
							e.preventDefault();
						});
						self.scrollUpBtn.click(function(e) {
							e.preventDefault();
						});

					}


				} else { //disable scrollbar if content is short
					//self.dragger.css("top", 0).css("display", "none"); //reset content scroll
					self.dragger.css("top", 0); //reset content scroll
					self.mScrollBox_container.css("top", 0);
					//self.dragger_container.css("display", "none");
					//self.scrollDownBtn.css("display", "none");
					//self.scrollUpBtn.css("display", "none");
					self.dragger_container.hide();
					self.scrollDownBtn.hide();
					self.scrollUpBtn.hide();
				}
			}

			self.dragger.mouseup(
					function() {
						self._DraggerRelease();
					}).mousedown(function() {
						self._DraggerPress();
					});


		},
		_DraggerPress: function() {
			this.dragger.addClass("ui-scrollbar-handle-active");//dragger_pressed
		},

		_DraggerRelease: function() {
			this.dragger.removeClass("ui-scrollbar-handle-active");//dragger_pressed
			//self.dragger.css("top", self.dragger.position().top - 20);
		},
		_ScrollX: function() {
			var self = this;
			//if(isNaN(self.scrollAmount)){
			//	self.scrollAmount = (self.mScrollBox_content.width() - self.mScrollBox.width()) / (self.dragger_container.width() - self.dragger.width());
			//}
			var draggerX = self.dragger.position().left,
					targX = -draggerX * self.scrollAmount,
					thePos = self.mScrollBox_container.position().left - targX;
			if (!self.dragger_container.is(':hidden')) {
				self.mScrollBox_container.stop().animate({left: "-=" + thePos}, self.options.animSpeed, self.options.easeType);
			}
		},
		_Scroll: function() {
			var self = this;
			//if(isNaN(self.scrollAmount)){
				//self.scrollAmount = (self.mScrollBox_content.height() - (self.mScrollBox.height() / self.options.bottomSpace)) / (self.dragger_container.height() - self.dragger.height());
			//}
			var draggerY = self.dragger.position().top,
					targY = -draggerY * self.scrollAmount,
					thePos = self.mScrollBox_container.position().top - targY;
			if (!self.dragger_container.is(':hidden')) {
				self.mScrollBox_container.stop().animate({top: "-=" + thePos}, self.options.animSpeed, self.options.easeType);
				//log($.isFunction(self.options.callback), self.options.callback.apply(this));
				//log(draggerY, targY, thePos, self.dragger.position().top, self.dragger_container.height() - self.dragger.height());
				//targY -= self.mScrollBox_container.position().top;
				if((self.dragger_container.height() - self.dragger.height()) - draggerY < 5 && $.isFunction(self.options.callback)){
					if(!self.mScrollBox_container.hasClass('ui-scrollbar-end')){
						//log(self.scrollAmount, thePos, self.options.bottomSpace); && !self.element.hasClass('ui-state-disabled')
						//self.mScrollBox_loading.show();
						self.options.callback.apply(this, [this.element]);
						//setTimeout(function(){
						//	self.mScrollBox_loading.hide();
						//}, 1500);
					}
				}
				self.mScrollBox_container.toggleClass('ui-scrollbar-end', (self.dragger_container.height() - self.dragger.height()) - draggerY < 5);
			}
		},
		_BtnsScroll: function(dir) {
			var self = this, btnsScrollTo = 0, scrollSpeed = 0;
			if (dir == "down") {
				btnsScrollTo = self.dragger_container.height() - self.dragger.height();
				scrollSpeed = Math.abs(self.dragger.position().top - btnsScrollTo) * (100 / self.options.scrollBtnsSpeed);
				self.dragger.stop().animate({top: btnsScrollTo}, scrollSpeed, "linear");
			} else {
				btnsScrollTo = 0;
				scrollSpeed = Math.abs(self.dragger.position().top - btnsScrollTo) * (100 / self.options.scrollBtnsSpeed);
				self.dragger.stop().animate({top: -btnsScrollTo}, scrollSpeed, "linear");
			}
			clearInterval(self.btnsScrollTimer);
			self.btnsScrollTimer = setInterval(self._Scroll, 20);
		},
		_BtnsScrollStop: function() {
			var self = this;
			clearInterval(self.btnsScrollTimer);


			self.dragger.stop();
		},
		_BtnsScrollX: function(dir) {
			var self = this, btnsScrollTo = 0,scrollSpeed = 0;
			if (dir == "down") {
				btnsScrollTo = self.dragger_container.width() - self.dragger.width();
				scrollSpeed = Math.abs(self.dragger.position().left - btnsScrollTo) * (100 / self.options.scrollBtnsSpeed);
				self.dragger.stop().animate({left: btnsScrollTo}, scrollSpeed, "linear");
			} else {
				btnsScrollTo = 0;
				scrollSpeed = Math.abs(self.dragger.position().left - btnsScrollTo) * (100 / self.options.scrollBtnsSpeed);
				self.dragger.stop().animate({left: -btnsScrollTo}, scrollSpeed, "linear");
			}
			clearInterval(self.btnsScrollTimerX);
			self.btnsScrollTimerX = setInterval(self._ScrollX, 20);
		},
		_BtnsScrollXStop: function() {
			var self = this;
			clearInterval(self.btnsScrollTimerX);
			self.dragger.stop();
		},
		refresh: function() {
			var self = this;
			if (self.orientation == "horizontal") {
				if (self.dragger.position().left > self.dragger_container.width() - self.dragger.width()) {
					self.dragger.css("left", self.dragger_container.width() - self.dragger.width());
				}
			} else {
				if (self.dragger.position().top > self.dragger_container.height() - self.dragger.height()) {
					self.dragger.css("top", self.dragger_container.height() - self.dragger.height());
				}
			}
			self.CustomScroller("resize");
		},
		_detectOrientation: function() {
			this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
		},
		_destroy: function() {
			$.Widget.prototype.destroy.call(this);
		}
		/*, scrollalert: function scrollalert(){
	var scrolltop=$('#scrollbox').attr('scrollTop');
	var scrollheight=$('#scrollbox').attr('scrollHeight');
	var windowheight=$('#scrollbox').attr('clientHeight');
	var scrolloffset=20;
	if(scrolltop>=(scrollheight-(windowheight+scrolloffset)))
	{
		//fetch new items
		$('#status').text('Loading more items...');
		$.get('new-items.html', '', function(newitems){
			$('#content').append(newitems);
			updatestatus();
		});
	}
	setTimeout('scrollalert();', 1500);
}*/
	});
})(jQuery);
