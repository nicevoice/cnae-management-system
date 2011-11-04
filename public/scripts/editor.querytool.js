String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

window.QUERYTOOL = {
	// 创建内嵌的 iframe
	open: function (domain) {
		var $__qt_ifrm_ = $('#__qt_ifrm_');
		var $window = $(window);
		
		// 如果首次创建窗口，则注册事件
		if ($__qt_ifrm_.length < 1) {
			// 主窗口
			var html = '<div id="__qt_ifrm_" style="position:fixed; background-color:#FFFFF8; border:1px solid #22252C; box-shadow:3px 3px 12px 0px #22252C; width:450px; text-align:center; z-index:99999; opacity:1;">' +
						'<div id="__qt_ifrm_title" title="可拖拽改变位置" style="height:30px; background-color:#22252C; color:#FFFFF8; cursor:move; line-height: 28px; padding: 0 5px 0 10px;">' +
						'<div style="float:left;">Query Tool</div><div style="float:right;"><button onclick="$(\'#__qt_ifrm_\').remove();" style="width: 20px; height: 20px;">X</button></div></div>' +
						'<iframe src="/editor/' + domain + '/querytool" width="440" height="400" style="border-style: none;" id="__qt_ifrm_iframe"></iframe></div>';
			$(document.body).append(html);
			var $__qt_ifrm_ = $('#__qt_ifrm_');
			
			// 注册事件
			var isMouseDown = false;		// 是否在标题栏上按下鼠标
			var mouseCenterPointer = {};	// 按下鼠标时的鼠标位置
			$('#__qt_ifrm_title').mousedown(function (e) {
				isMouseDown = true;
				mouseCenterPointer = { x: e.clientX,	y: e.clientY }
			});
			$(document).mouseup(function () {
				isMouseDown = false;
				$__qt_ifrm_.css({ opacity: 1 });
			})
			// 开始移动
			.mousemove(function (e) {
				if (isMouseDown) {
					var offset = {
						x: e.clientX - mouseCenterPointer.x,
						y: e.clientY - mouseCenterPointer.y
					}
					var pos = $__qt_ifrm_.offset();
					$__qt_ifrm_.css({
						top: 		pos.top + offset.y,
						left:		pos.left + offset.x,
						opacity:	0.6
					});
						
					isMouseDown = true;
					mouseCenterPointer = { x: e.clientX,	y: e.clientY }
				}
			});
		}
		
		// 打开 iframe 并显示到右上角
//		var winpos = {
//			top:	($window.height() - 500) / 2,
//			left:	($window.width() - 450) / 2
//		}
		var winpos = {
			top:	1,
			left:	$window.width() - 450
		}
		if (winpos.top < 1)	winpos.top = 1;
		$__qt_ifrm_.css(winpos).show();
	},
	
	getParams: function(querystr) {
		var res = [];
		var params = querystr.split("&");
		var pos;
		for(var i = 0; i < params.length; i++) {
			pos = params[i].indexOf("=");
			if(pos == -1) { continue; }
			res.push({k: params[i].substring(0, pos), v: params[i].substring(pos + 1)});
		}
		return res;
	},
	
	submitForm: function(options, outer) {
		var _form = {};
		// 创建form
		html = '<form action="' + options.url + '" method="' + options.method + '" id="hidden-form">';
		for(var i = 0; i < options.params.length; i++) {
			html += '<input name="' + options.params[i].k + '" type="text" value="' + options.params[i].v + '">';
		}
		html += '<input type="submit"></form>';
		if(outer) {
			var frameContent = $("#__qt_ifrm_iframe").contents();
			frameContent.find("#wrapper").html(html);
			_form = frameContent.find('#hidden-form');
		} else {
			$("#wrapper").html(html);
			_form = $('#hidden-form');
		}
		_form.submit();
	},
	
	submitOnce: function() {
		var options = {},
			params = [],
			cookieStr = "", 
			html = "";
		// 检查参数
		options.url		= $("#qt-url").val().trim();
		if(!options.url) {
			alert("请填写URL！");
			$("#qt-url").focus();
			return false;
		}
		options.method	= $("#qt-method").val().trim();
		options.params = $("#qt-params").val().trim();
		// 在解析params之前先保存cookie
		cookieStr = JSON.stringify(options);
		cookieHandler.set(NAEIDE_config.COOKIE.querytool_options, cookieStr);
		// 解析params
		options.params = this.getParams($("#qt-params").val().trim());
		this.submitForm(options);
	}
}