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
(function(window, undefined) {
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
	window.log = function() {
		log.history = log.history || [];   // store logs to an array for reference
		log.history.push(arguments);
		if (this.console) {
			arguments.callee = arguments.callee.caller;
			console.log(Array.prototype.slice.call(arguments));
		}
	};
// make it safe to use console.log always
	(function(b) {
		function c() {
		}

		for (var d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a; a = d.pop();)b[a] = b[a] || c
	})(window.console = window.console || {});

	(function($) {
		/*$("head").append($('<link />', {
			rel:  "stylesheet",
			type: "text/css",
			href: instance.options.baseUrl + 'css/kld-theme/jquery-ui-kld.min.css?' + VERHASH
		}));*/
		$.extend({
			//$.mask('872a8ea2g', '### ### ###');
			mask: function(str, mask) {
				var m, l = (m = mask.split("")).length, s = str.split(""), j = 0, h = "";
				for (var i = -1; ++i < l;)
					if (m[i] != "#") {
						if (m[i] == "\\" && (h += m[++i])) continue;
						h += m[i];
						i + 1 == l && (s[j - 1] += h,h = "");
					} else {
						if (!s[j] && !(h = "")) break;
						(s[j] = h + s[j++]) && (h = "");
					}
				return s.join("") + h;
			},
			//打印K码格式
			printKCode: function(k, html) {
				if (k.length == 9) {
					k = $.mask(k, '### ### ###');
				}
				if (!$.isValidKCode(k)) {
					return 'K码不存在';
				}
				if (html) {
					return '<span class="kcode_sp">' + k.substring(0, 3) + '</span><span class="kcode_sp">' + k.substring(4, 7) + '</span><span class="kcode_sp">' + k.substring(8, 11) + '</span>';
				} else {
					return k;
				}
			},
			isValidKCode: function(value) {
				if (value.length == 9) {
					value = $.mask(value, '### ### ###');
				}
				var rgx = new RegExp("\\b(?:[A-KMNP-Z0-9]{3})(?: [A-KMNP-Z0-9]{3}){2}\\b");
				return rgx.exec(value.toUpperCase()) != null;
			},
			isAppear: function (elem) {
				if ($(elem).length == 0) {
					return true;
				}
				var docViewTop = $(window).scrollTop(),
						docViewBottom = docViewTop + $(window).height(),
						elemTop = $(elem).offset().top,
						elemBottom = elemTop + $(elem).height();
				return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
			},
			// ----------------------------------------------------------
			// A short snippet for detecting versions of IE in JavaScript
			// without resorting to user-agent sniffing
			// ----------------------------------------------------------
			// If you're not in IE (or IE version is less than 5) then:
			//     ie === undefined
			// If you're in IE (>=5) then you can determine which version:
			//     ie === 7; // IE7
			// Thus, to detect IE:
			//     if (ie) {}
			// And to detect the version:
			//     ie === 6 // IE6
			//     ie > 7 // IE8, IE9 ...
			//     ie < 9 // Anything less than IE9
			// ----------------------------------------------------------
			detectIE: function() {
				var v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i');
				do {
					div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
				} while (all[0]);
				return v > 4 ? v : undefined;
			},
			topZIndex: function (selector) {
				/// <summary>
				/// 	Returns the highest (top-most) zIndex in the document
				/// 	(minimum value returned: 0).
				/// </summary>
				/// <param name="selector" type="String" optional="true">
				/// 	(optional, default = "body *") jQuery selector specifying
				/// 	the elements to use for calculating the highest zIndex.
				/// </param>
				/// <returns type="Number">
				/// 	The minimum number returned is 0 (zero).
				/// </returns>
				return Math.max(0, Math.max.apply(null, $.map($(selector || "body *"),
						function (v) {
							return parseInt($(v).css("z-index")) || null;
						}
				)));
			},
			urlParam: function(name) {
				var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
				if (!results) {
					return '';
				}
				return results[1] || '';
			}
		});
		$.extend($.fn, {
			equalHeights: function(px) {
				return this.each(function() {
					var currentTallest = 0;
					$(this).children().each(function(i) {
						if ($(this).height() > currentTallest) {
							currentTallest = $(this).height();
						}
					});
					if (!px) {
						currentTallest = currentTallest + 'px';
					} else {
						currentTallest = currentTallest + px;
					}
					if ($.detectIE() === 6) {
						$(this).children().css({'height': currentTallest});
					}
					$(this).children().css({'min-height': currentTallest});
				});
			},
			fixPNG: function(b) {
				if ($.detectIE() === 6) {
					//sSize: crop,image,scale
					b = $.extend({sSize: 'scale', url:SITEURL + defaultstyle.substring(0, defaultstyle.lastIndexOf('style')) + 'kldpoi/images/blank.gif'}, b);
					this.each(function() {
						//DD_belatedPNG.fixPng(this);
						var img = $(this), bgImage = img.css("background-image"), srcImage = img.attr("src");
						if (bgImage && bgImage != 'none' && bgImage.match(/\.png/i) != null) {
							var origUrl = bgImage.substring(5, bgImage.length - 2),
									bgPosition = img.css("background-position");
							img.css("background-image", "url(" + b.url + ")");
							if (bgPosition) {
								img.css("background-position", bgPosition);
							}
							img.css("filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + origUrl + "', sizingMethod='" + b.sSize + "')");
						} else if (srcImage && srcImage.match(/\.png/i) != null) {
							var height = $(this).height(), width = $(this).width();
							img.attr("src", b.url)
									.css({"width": width + "px", "height": height + "px",
										"filter": "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + srcImage + "', sizingMethod='" + b.sSize + "')"});
						}
					});
				}
				return this;
			},
			// IE6鼠标Hover状态修复
			fixIconHover:function(b) {
				if ($.detectIE() === 6) {
					b = jQuery.extend({icon:'.icon_num'
						,class_on:'icon_num'
						,suffix_on:''//icon_num_
						,class_off:'icon_num_off'
						,class_hover:'alt'
						,imageOffsetY:0
					}, b);
					this.each(function(k, n) {
						//.find('.icon_num').css({'width':'24px','height':'30px'}).end().removeClass('icon_32')
						var ico_w = $(n);
						if (ico_w.hasClass('fixIconHover_fixed')) {
							return;
						}//.css({'position':'absolute','display':'block'})
						//ico_w.find('.icon_32_marker').css({'position':'absolute', 'left':0, 'top':'-5px'
						//,'height':'30px', 'width':'24px', 'overflow': 'hidden'
						//}).parent().css({'position':'relative', 'padding-left': '32px'});
						//ico_w.find('.icon_32_marker').css({'position':'relative'});
						//var idx = $(this).index(), ico_fix = $(b.icon, ico_w);
						var idx = 0, ico_fix = $(b.icon, ico_w);
						if (b.suffix_on != '') {
							idx = (k % 10 + 1) * 32;
						} else {
							idx = (b.imageOffsetY % 10) * 32;
						}

						//ico_fix.css({'height':'352px', 'width':'48px','position': 'absolute'});
						ico_fix.each(function(i, t) {
							if (!$(t).hasClass('fixIconHover_fixed')) {
								/*var c = $(t).clone();//, w = $(t).clone();//$(<span />).width($(t).width()).height($(t).height());
								 if (b.suffix_on != '') {
								 c.addClass(b.suffix_on + idx + '_on');
								 } else {
								 c.addClass(b.class_on);
								 }
								 $(t).after(c);
								 c.fixPNG({sSize: 'crop'});*/
								$(t).addClass('fixIconHover_fixed');
								//if (b.suffix_on != '') {
								$(t).css({'left':0, 'top':-idx + 'px'}).fixPNG({sSize: 'crop'});
								//} else {
								//	$(t).css({'left':0, 'top':'0px'}).fixPNG({sSize: 'crop'});
								//}

								//c.hide();//$(t).addClass(b.class_off).fixPNG({sSize: 'crop'});
							}
						});//alert(ico_w.html());
						if (ico_fix.length > 0) {
							ico_w.hover(function() {
								//console.log($(this).index());
								//if (b.suffix_on != '') {
								//$(this).find('.' + b.suffix_on + idx + '_on').show();
								$(this).find(b.icon)
										.css({'left':'-24px', 'top':-idx + 'px'});
								//} else {
								//$(this).find('.' + b.class_on).show();
								//	$(this).find(b.icon).css({'left':'-24px', 'top':'0px'});
								//}
								//$(this).find('.' + b.class_off).hide();
								/*$(this).find('.' + b.class_off)
								 .css({'left':'-24px', 'top':-idx+'px'});*/

								if (b.class_hover != '') {
									$(this).addClass(b.class_hover);
								}
								//$(this).parent().parent().trigger('click');
							}, function() {
								//if (b.suffix_on != '') {
								//$(this).find('.' + b.suffix_on + idx + '_on').hide();
								$(this).find(b.icon)
										.css({'left':0, 'top':-idx + 'px'});
								//} else {
								//$(this).find('.' + b.class_on).hide();
								//	$(this).find(b.icon).css({'left':0, 'top':'0px'});
								//}
								//$(this).find('.' + b.class_off).show();
								/*$(this).find('.' + b.class_off)
								 .css({'left':0, 'top':-idx+'px'});*/
								if (b.class_hover != '') {
									$(this).removeClass(b.class_hover);
								}
								//$(this).parent().parent().trigger('click');
							});
							ico_w.addClass('fixIconHover_fixed');
						}
					});
				}
				return this;
			},
			dl_tabs: function(b) {
				b = jQuery.extend({tab_switch:"mouseover",tab_width:"auto"}, b);
				this.each(function() {
					var c = $(this);
					if (c.hasClass("adaptive")) {
						var d = 0;
						d += parseFloat(c.css("margin-left").replace("px", "")) + parseFloat(c.css("margin-right").replace("px", ""));
						d += parseFloat(c.css("padding-left").replace("px", "")) + parseFloat(c.css("padding-right").replace("px", ""));
						d += parseFloat(c.css("border-left-width").replace("px", "")) + parseFloat(c.css("border-right-width").replace("px", ""));
						c.siblings("dt:not(.adaptive)").each(function() {
							var e = $(this);
							d += e.outerWidth(true)
						});
						d = c.parent().width() - d - 1;
						c.width(d)
					}
					if (!c.hasClass("disabled")) {
						c.bind(b.tab_switch, function() {
							var e = $(this);
							if ($.trim(e.text()) == "") {
								return false
							}
							e.siblings(":not(.disabled)").removeClass("selected").end().next().andSelf().addClass("selected")
						})
					}
				});
				return this
			},
			//垂直对齐
			vAlign: function(container) {
				return this.each(function(i) {
					var th = $(this).height(), ph = $(this).parent().height(),
							mh = Math.ceil((ph - th) / 2);
					$(this).css('margin-top', mh);
				});
			},
			topZIndex: function (opt) {
				// <summary>
				// 	Increments the CSS z-index of each element in the matched set
				// 	to a value larger than the highest current zIndex in the document.
				// 	(i.e., brings all elements in the matched set to the top of the
				// 	z-index order.)
				// </summary>
				// <param name="opt" type="Object" optional="true">
				// 	(optional) Options, with the following possible values:
				// 	increment: (Number, default = 1) increment value added to the
				// 		highest z-index number to bring an element to the top.
				// 	selector: (String, default = "body *") jQuery selector specifying
				// 		the elements to use for calculating the highest zIndex.
				// </param>
				// <returns type="jQuery" />
				// Do nothing if matched set is empty
				if (this.length === 0) {
					return this;
				}
				opt = $.extend({increment: 1, selector: "body *"}, opt);
				// Get the highest current z-index value
				var zmax = $.topZIndex(opt.selector), inc = opt.increment;
				// Increment the z-index of each element in the matched set to the next highest number
				return this.each(function () {
					$(this).css("z-index", zmax += inc);
				});
			},
			MyLoading: function(options) {
				var _options = $.extend({
					loadingImgPath: 'load.gif',
					bFadeoutPage: true
				}, options);
				$("body").append("<img style='position:absolute;top:-1000px' src='" + _options.loadingImgPath + "'>");

				return this.each(function() {
					$(this).click(function(event) {
						$("#myLoadingImg").remove();
						var href = $(this).attr('href');
						var target = $(this).attr("target");

						if (target == "") {
							var winHeight = $(window).height();
							$(this).append(" <span id=myLoadingImg><img style='border:0px' src='" + _options.loadingImgPath + "'></span>");

							if (_options.bFadeoutPage) {
								$("body").fadeTo('slow', 0.6);
							}

						}

					});

				});

				function goLink(href) {
					window.location.href = href;
				}
			},
			MyThumbnail: function(options) {
				var _options = $.extend({
					thumbWidth:130,
					thumbHeight:100,
					backgroundColor:"#ccc",
					imageDivClass:"myPic",
					bShowPointerCursor:false
				}, options);


				return this.each(function() {
					$(this).removeAttr("width").removeAttr("height");
					var img = this;
					var src = $(this).attr("src");
					var width = $(this).width();
					var height = $(this).height();

					$(this).hide();
					if (width == 0 || height == 0) {
						$("<img/>")
								.attr("src", $(this).attr("src"))
								.load(function() {

									width = this.width;
									height = this.height;

									addImage(img, width, height);
								});
					} else {
						addImage(img, width, height);
					}
				});

				function addImage(img, width, height) {
					var src = $(img).attr("src");

					var opt = _options;

					var imageSizeWidthRatio = opt.thumbWidth / width;
					var imageSizeWidth = null;
					var imageSizeHeight = null;

					imageSizeWidth = opt.thumbWidth;
					imageSizeHeight = height * imageSizeWidthRatio;


					if (imageSizeHeight < opt.thumbHeight) {
						var resizeFactor = opt.thumbHeight / imageSizeHeight;

						//fix
						imageSizeHeight = opt.thumbHeight;
						imageSizeWidth = resizeFactor * imageSizeWidth;
					}

					var appendHtml = null;
					if (!opt.bShowPointerCursor) {
						appendHtml = "<DIV class='myThumbDivAutoAdd " + opt.imageDivClass + "' style='display:none;float:left;width:" + opt.thumbWidth + "px;height:" + opt.thumbHeight + "px;overflow:hidden;background:url(" + src + ") no-repeat " + opt.backgroundColor + ";";
						appendHtml += "background-position:center;background-size:" + imageSizeWidth + "px " + imageSizeHeight + "px;'></DIV>";
					}
					else {
						appendHtml = "<DIV class='myThumbDivAutoAdd " + opt.imageDivClass + "' style='cursor:pointer;display:none;float:left;width:" + opt.thumbWidth + "px;height:" + opt.thumbHeight + "px;overflow:hidden;background:url(" + src + ") no-repeat " + opt.backgroundColor + ";";
						appendHtml += "background-position:center;background-size:" + imageSizeWidth + "px " + imageSizeHeight + "px;'></DIV>";
					}

					$(img).after(appendHtml);
					$(".myThumbDivAutoAdd").fadeIn();
				}
			}
		});
	})(jQuery);
})(window);

var DottieUtil = (function ($$, $) {
	$$.show_gallery = function () {
		var poi_gallery = $("#gallery a[rel='gallery_1']");
		if (poi_gallery.length > 0) {
			poi_gallery.hide().first().show().end().colorbox({transition:"easeOutElastic",opacity:0.5,duration:'slow'
				, "easing": "easeInOutElastic", onOpen: function() {
					var f = poi_gallery.first();
					$('#colorbox').css({
						height: f.height(),
						width: f.width(),
						top: f.position().top + 'px',
						left: f.position().left + 'px'
					});
				}
			});
		}
	};
	$$.rating = function () {
		var rating = $('#rating_form .rating'), rating_input = $('#rating_form input.rating_value');
		if (rating.length == rating_input.length) {
			$('#rating_form .rating a').click(function() {
				var t = $(this), i = t.index(), r = t.parents('ul.rating');
				t.siblings().removeClass("current_rating").end().andSelf().addClass("current_rating");
				$(rating_input[rating.index(r)]).val(i + 1);
				r.attr('title', '{lang current_rating}' + (i + 1));
				return false;
			});
		}
	};
	return $$;
}(DottieUtil || {}, jQuery));
