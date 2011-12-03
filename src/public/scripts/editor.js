var DOMAIN; // 应用二级域名
var ROOT_PATH = "/";
var currDir = ROOT_PATH; // 当前路径
var currNode; // 当前文件DOM
var outTimer, errTimer, interval = 2000;	//获取stdoutput的定时器，点击重启应用以后开始每2s获取一次
var onStdErr = false, onStdOut = false;    //鼠标是否在std的div区域内，如果在则不把滚动条往下拉
var openedFiles = []; // 打开的文件数组
var activeFile = -1; // 当前活动文件
var changeLock = false; // 文件改变锁
var actionLock = false; // 事件锁
var editor;

var setTabAction = function() {
	$(".tab").live({
		"click": function() {
			var fileIndex = $(this).attr("name");
			setEditingFile(fileIndex);
			return false;
		},
		"dblclick": function() {
			closeFile($(this).attr("name"));
			return false;
		}
	});
	$(".tab .close").live({
		"mouseenter": function() {
			$(this).css("font-weight", "bold");
		},
		"mouseleave": function() {
			$(this).css("font-weight", "normal");
		},
		"click": function() {
			closeFile($(this).parent().attr("name"));
			return false;
		}
	});
}

var setEditingFile = function(index, noStore, rownum, colnum) {
	var e = editor.getSession();
	// 检查目标文件是否存在于已打开文件数组中
	if(!openedFiles[index]) {
		return false;
	}
	// 检查是否就是当前正在编辑的文件
	if(openedFiles[activeFile] && index === activeFile) {
		if(rownum) editor.gotoLine(rownum, colnum); // 光标移动到活动行
		editor.focus();
		return false;
	}
	// 先保存原来的文件信息
	if(!noStore && openedFiles[activeFile]) {
		var oriContent = e.getValue();
		openedFiles[activeFile].content = oriContent;
		openedFiles[activeFile].activeRow = e.getSelection().getCursor().row + 1;
		openedFiles[activeFile].activeCol = e.getSelection().getCursor().column;
	}
	var newContent = openedFiles[index].content;
	var newActiveRow = rownum ? rownum : openedFiles[index].activeRow;
	var newActiveCol = colnum ? colnum : openedFiles[index].activeCol;
	activeFile = index; // 更新当前文件指针
	activeTab(activeFile); // 处理Tab
	setEditorMode(getFileExt(openedFiles[index].filePath)); // 根据文件后缀名设置语法模式
	changeLock = true; // 上锁
	e.setValue(newContent); // 将文件内容写入editor
	editor.gotoLine(newActiveRow, newActiveCol); // 光标移动到活动行
	editor.focus(); // 将焦点置于editor之上
	changeLock = false; // 解除锁
}

var findOpenedFile = function() {
	var len = openedFiles.length;
	for(i = len - 1; i >= 0; i--) {
		if(openedFiles[i]) return i;
	}
	return -1;
}

var hasFileChanged = function() {
	var len = openedFiles.length;
	for(i = 0; i < len; i++) {
		if(openedFiles[i] && openedFiles[i].changed) return i;
	}
	return -1;
}

var isFileOpened = function(filePath) {
	var len = openedFiles.length;
	for(i = 0; i < len; i++) {
		if(openedFiles[i] && openedFiles[i].filePath === filePath) return i;
	}
	return -1;
}

var addOpenedFile = function(filePath, content, rownum, colnum) {
	var newFile = {filePath: filePath, content: content, changed: false};
	newFile.activeRow = rownum ? rownum : 0;
	newFile.activeCol = colnum ? colnum : 0;
	var len = openedFiles.push(newFile);
	return len - 1;
}

var rmOpenedFile = function(index) {
	try {
		delete openedFiles[index];
		return true;
	} catch(e) {}
	return false;
}

var chOpenedFile = function(index, content) {
	try {
		openedFiles[index].content = content;
		openedFiles[index].changed = true;
	} catch(e) {}
	return false;
}

var addTab = function(fileName, index) {
	var newTab = '<div class="tab ' + index + '" name="' + index + '" title="' + fileName + '"><div class="close" title="关闭文件">X</div>' + fileName + '</div>';
	$("#tabs").append(newTab);
}

var rmTab = function(index) {
	$("#tabs ." + index).remove();
}

var chTab = function(fileName, index) {
	$("#tabs ." + index).attr("title", fileName).html('<div class="close" title="关闭文件">X</div>' + fileName);
}

var starTab = function(index, add) {
	if(typeof add != "boolean") add = true;
	var target = $("#tabs ." + index);
	var fileName = target.attr("title");
	if(add) { // 加星号
		fileName += '*';
	}
	target.html('<div class="close" title="关闭文件">X</div>' + fileName);
}

var activeTab = function(index) {
	if(typeof index === "undefined") index = activeFile;
	$(".tab").removeClass("active");
	$("#tabs ." + index).addClass("active");
}

/*
 * 动态设定编辑器尺寸
 */
var setEditorSize = function(h, w, hideConsole, loc) {
	var cli = $("#console");
	if(!h) {
		h = document.documentElement.clientHeight - (80 + 5); // 减去header和statusBar的部分
		if(!hideConsole && loc === "BOTTOM") h -= cli.height() + 10; // 如果显示console，则要减去console的部分
	}
	if(!w) {
		w = document.body.clientWidth - 260; // 减去sidebar的部分
		if (!hideConsole && loc === "RIGHT") w -= cli.width() + 10;
	}
	$("#tabs").width(w - 50);
	$("#statbar").width(w);
	$("#editor").css("height", h).css("width", w);
	if (editor) editor.resize();
}

var setFileListSize = function(height, hideConsole, loc) {
	height = height || document.documentElement.clientHeight - 145;
	if (!hideConsole && loc === "BOTTOM") {
		height -= 135;
	}
	$("#file-list").css({ "height": height, "overflow": "auto" });
}

var setElementsSize = function() {
	var display = CLI.cache.display,
		location;
	if (!display) {// 隐藏console
		setEditorSize(null, null, true);
		setFileListSize(null, true);
	} else {
		location = CLI.cache.location;
		if (location === "BOTTOM" || location === "RIGHT") {
			setEditorSize(null, null, false, location);
		} else {
			setEditorSize(null, null, false);
		}
		setFileListSize(null, false, location);
	}
}

var onChange = function() {
	if(!changeLock) { // 检查锁
		if(typeof openedFiles[activeFile] != "undefined") {
			openedFiles[activeFile].changed = true;
			starTab(activeFile, true);
		}
	}
}

var initEditor = function() {
	editor = ace.edit("editor");
	canon = require("pilot/canon");
	Renderer = require("ace/virtual_renderer").VirtualRenderer;
	
	// 初始化编辑器配色方案
	var theme = cookieHandler.get(NAEIDE_config.COOKIE.editor_theme);
	theme = theme || "textmate";
	head.js("/scripts/ace/theme-" + theme + ".js", function() {
		editor.setTheme("ace/theme/" + theme);
		$("#editor-theme option[value='" + theme + "']").attr("selected", "selected");
		$("#editor-theme").removeAttr("disabled");
	});
	editor.renderer.getShowPrintMargin(true);
	editor.renderer.setHScrollBarAlwaysVisible(false);
	
	// 绑定编辑器快捷键
	editor.commands.addCommand({
		name: 'Save',
		bindKey: {
			win: 'Ctrl-S',
			mac: 'Command-S',
			sender: 'editor'
		},
		exec: function(env, args, request) {
			if(actionLock) return false;
			actionLock = true;
			saveFile(activeFile);
			actionLock = false;
		}
	});
	editor.commands.addCommand({
		name: 'ConsoleDisplay',
		bindKey: {
			win: 'Ctrl-Shift-X',
			mac: 'Command-Shift-X',
			sender: 'editor'
		},
		exec: function(env, args, request) {
			CLI.loader.display(!CLI.cache.display);
		}
	});
	editor.getSession().on('change', onChange); // 绑定编辑器事件
};

var closeEditor = function() {
	editor = null
   ,canon = null
   ,Renderer = null;
	$("#editor").html("");
	$("#editor-theme").attr("disabled", true);
}

$(window).resize(function(){
	setElementsSize(); // 编辑器和控制台尺寸自适应
});

//绑定鼠标进出std DIV的事件
function mouseOnStdDiv(){
  $("#stdout").mouseenter(function(){
    onStdOut = true;
  });
  $("#stderr").mouseenter(function(){
    onStdErr = true;
  });
   $("#stdout").mouseleave(function(){
    onStdOut = false;
  });
   $("#stderr").mouseleave(function(){
    onStdErr = false;
  }) 
}

$(document).keydown(function(e) {
	// 捕获键盘按键
	if(e.metaKey || e.ctrlKey) {
		var save = 'S';
		var hideConsole = 'X';
		if(editor && e.keyCode === save.charCodeAt(0)) {
			if(actionLock) return false;
			actionLock = true;
			saveFile(activeFile);
			actionLock = false;
			return false;
		}
		if(e.shiftKey) {
			if(e.keyCode === hideConsole.charCodeAt(0)) {
				CLI.loader.display(!CLI.cache.display);
				return false;
			}
			if(e.keyCode === 49) {
				if(actionLock) return false;
				actionLock = true;
				restart();
				actionLock = false;
				if(editor) editor.focus(); // 重新将焦点置于editor之上
				return false;
			}
		}
	}
});

$(function() {
	$('#editor') // 首先将editor的尺寸设置为最大
		.css("height", document.documentElement.clientHeight - (80 + 5))
		.css("width", document.body.clientWidth - 260);
	setElementsSize(); // 初始化编辑器和控制台尺寸

	url = {
		listfile: "/editor/" + DOMAIN + "/filelist",
		readfile: "/editor/" + DOMAIN + "/readfile",
		writefile: "/editor/" + DOMAIN + "/writefile",
		delfile: "/editor/" + DOMAIN + "/delfile",
		mkdir: "/editor/" + DOMAIN + "/mkdir",
		deldir: "/editor/" + DOMAIN + "/deldir",
		renamefile: "/editor/" + DOMAIN + "/renamefile"
	};
	
	// 支持的文件类型
	modes = Array();
	modes["js"] = {
		"scriptPath": "/scripts/ace/mode-javascript.js?v=1.0",
		"requirePath": "ace/mode/javascript"};
	modes["html"] = {
		"scriptPath": "/scripts/ace/mode-html.js",
		"requirePath": "ace/mode/html"};
	modes["css"] = {
		"scriptPath": "/scripts/ace/mode-css.js",
		"requirePath": "ace/mode/css"};
	modes["json"] = {
		"scriptPath": "/scripts/ace/mode-json.js",
		"requirePath": "ace/mode/json"};
	modes["xml"] = {
		"scriptPath": "/scripts/ace/mode-xml.js",
		"requirePath": "ace/mode/xml"};
	modes["txt"] = {
		"scriptPath": "/scripts/ace/mode-textile.js",
		"requirePath": "ace/mode/text"};
	modes["php"] = {
			"scriptPath": "/scripts/ace/mode-php.js",
			"requirePath": "ace/mode/php"};
		
	// 初始化当前路径
	$("#currentPath").html(ROOT_PATH);
	
	// 加载根目录文件列表
	listFiles(currDir);
	
	// 注册事件
	setSubmenuAction();
	setItemAction();
	setNavAction();
	setToolbarAction();
	setTabAction();
	setConsoleAction();
	prefer.action();
	
	var options = { 
		beforeSubmit:	function() {
			showMsg1(NAEIDE_config.LANG.file.uploading);
		},
		success:		function(data) {
			if(typeof data.error != "undefined" && data.error === "false") {
				listFiles(currDir);
				showMsg2(NAEIDE_config.LANG.file.uploadSucceed);
			} else {
				showMsg2(NAEIDE_config.LANG.file.uploadFailed);
			}
		},
		complete:		function() {},
		url:			"/application/manage/" + DOMAIN + "/uploadImg",
		type:			"post",
		dataType:		"json",
		resetForm:		true,
		timeout:		30000
	};
	
	$('#upload-form').submit(function() {
		if(actionLock) return false;
		options.data = {dirPath: currDir};
		actionLock = true;
		$(this).ajaxSubmit(options);
		actionLock = false;
		return false;
	});
	
	// 加载样式
	setSidebarUI();
	mouseOnStdDiv();
});

window.onbeforeunload = function() {
	var index = hasFileChanged();
	if(index >= 0 && editor) { // 有尚未保存的文件，且编辑器尚未关闭
		setEditingFile(index);
		return NAEIDE_config.LANG.page.leaveNotify;
	}
};

var showMsg1 = function(content) {
	$("#msg").html(content).slideDown();
}

var showMsg2 = function(content, waiting, speed) {
	if(typeof waiting === "undefined") waiting = 1200;
	if(typeof speed === "undefined") speed = 600;
	var msger = $("#msg");
	msger.html(content);
	setTimeout(function() { msger.slideUp(speed); }, waiting);
}

var htmlspecialchars = function(str) {
	if (typeof(str) == "string") {
		str = str.replace(/&/g, "&amp;"); /* must do &amp; first */
		str = str.replace(/"/g, "&quot;");
		str = str.replace(/'/g, "&#039;");
		str = str.replace(/</g, "&lt;");
		str = str.replace(/>/g, "&gt;");
		str = str.replace(/\|/g, '&brvbar;');
	}
	return str;
}

//添加记录
addRecord = function(domain, action){
	$.ajax({
		cache:false,
		type:"post",
		url:"/application/manage/"+domain+"/addRecord",
		dataType:"json",
		data:{action:action},
		error:function(){},
		success:function(){}
	});
}

//重启应用
function restart(){
	$.ajax({
		cache:false,
		type:"post",
		url:"/application/manage/"+DOMAIN+"/controlApp",
		dataType:"json",
		data:{action:"restart"},
		beforeSend: function() {
			showMsg1(NAEIDE_config.LANG.apps.restarting);
		},
		error:function(){
			showMsg2(NAEIDE_config.LANG.apps.restartFailed);
		},
		success:function(data){
			if(data.status !== "ok") {
				if(data.code==202) {	//not found错误，则改为上线
					$.ajax({
						cache:false,
						type:"post",
						url:"/application/manage/"+DOMAIN+"/controlApp",
						dataType:"json",
						data:{action:"start"},
						error:function(){
							showMsg2(NAEIDE_config.LANG.apps.restartFailed);
						},
						success:function(data) {
							if(data.status === "ok") {
							    showMsg2(NAEIDE_config.LANG.apps.restartSucceed);
								window.clearInterval(outTimer);
								window.clearInterval(errTimer);
								outTimer = window.setInterval(function(){
									getOutput("stdout");
								}, interval);
								errTimer = window.setInterval(function(){
									getOutput("stderr");
								}, interval);
								addRecord(DOMAIN, NAEIDE_config.LANG.apps.restart);
							} else {
								showMsg2(NAEIDE_config.LANG.apps.restartFailed + ": " + data.msg);
							}
						}
					})
				} else {
					showMsg2(NAEIDE_config.LANG.apps.restartFailed + ": " + data.msg);
				}
			} else {
			    showMsg2(NAEIDE_config.LANG.apps.restartSucceed);
				window.clearInterval(outTimer);
				window.clearInterval(errTimer);
				outTimer = window.setInterval(function(){
					getOutput("stdout");
				}, interval);
				errTimer = window.setInterval(function(){
					getOutput("stderr");
				}, interval);
				addRecord(DOMAIN, NAEIDE_config.LANG.apps.restart);
			}
			getOutput("stdout");
			getOutput("stderr");
		}
	});	
}
//获取stdErr和stdOut
function getOutput(action){
	$.ajax({
		cache:false,
		type:"post",
		url:"/application/manage/"+DOMAIN+"/getStdOutput",
		dataType:"json",
		data:{action:action},
		error:function(){
			$("#"+action).html(action + NAEIDE_config.LANG.apps.getInfFailed);
			/*window.clearTimeout(outTimer);
			window.clearTimeout(errTimer);
			if(action == "stdout"){
				outTimer = window.setTimeout(function(){
					getOutput(action);
				}, 30000);
			}
			else{
				errTimer = window.setTimeout(function(){
					getOutput(action);
				}, 30000);
			}*/					
		},
		success:function(data){
			var d = htmlspecialchars(data.output);
      		d = getColor(d);
      		if(action === "stderr") d = CLI.loader.setErrorstack(d);
			$("#"+action).html(d);
      var pOnDiv;
      if(action==="stdout"){
        pOnDiv = onStdOut;
      }else{
        pOnDiv = onStdErr;
      }
      if (!pOnDiv) {
        if (!document.getElementById) 
          return;
        var outDiv = document.getElementById(action);
        outDiv.scrollTop = outDiv.scrollHeight;
      }
      /*
			window.clearTimeout(outTimer);
			window.clearTimeout(errTimer);
			if(action == "stdout"){
				outTimer = window.setTimeout(function(){
					getOutput(action);
				}, 3000);
			}
			else{
				errTimer = window.setTimeout(function(){
					getOutput(action);
				}, 3000);
			}*/
		}
	});	
}

/*
 * 显示顶部提示信息
 */
var showMsg = function(content, waiting, speed) {
	if(typeof waiting === "undefined") waiting = 1200;
	if(typeof speed === "undefined") speed = 600;
	var msger = $("#msg");
	msger.html(content).slideDown(speed, function() {
		setTimeout(function() { msger.slideUp(speed); }, waiting);
	});
}

var setStatusBar = function(type, content) {
	var d = new Date();
	var curr = d.toLocaleString();
	var statbar = $("#statbar");
	if(type === 1) { // 保存
		statbar.html("已保存：" + content + "，于" + curr);
	} else if(type === 2) { // 创建
		statbar.html("已创建：" + content + "，于" + curr);
	}
}


/*
 * 设置边栏样式
 */
var setSidebarUI = function() {
	// 鼠标划过高亮
	$(".list-item, .sub-menu-item").live({
		"mouseenter": function() {
			$(this).addClass("flhover");
		},
		"mouseleave": function() {
			$(this).removeClass("flhover");
		}
	});
}

/*
 * 生成二级目录的HTML
 */
var setSubmenu = function(item) {
	var res = '<div class="sub-menu"><ul>';
	if(item["name"] && item["type"]) {
		if(item["type"] === "d") { // 文件夹
			res += '<li class="sub-menu-item" name="open-folder"><img src="/images/icon_folder.png" title="打开文件夹" /> <strong>打开' + item["name"] + '</strong></li>';
			res += '<li class="sub-menu-item" name="del-folder"><img src="/images/icon_delete.png" title="删除文件夹" /> 删除</li>';
		} else if (item.type === "f") { // 文件
			res += '<li class="sub-menu-item" name="edit-file"><img src="/images/icon_script.png" title="编辑文件" /> <strong>编辑' + item["name"] + '</strong></li>';
			res += '<li class="sub-menu-item" name="del-file"><img src="/images/icon_delete.png" title="删除文件" /> 删除</li>';
			res += '<li class="sub-menu-item" name="rename-file"><img src="/images/icon_rename.png" title="重命名" /> 重命名</li>';
			res += '<li class="sub-menu-item"><img src="/images/icon_size.png" title="大小" /> ' + item["size"] + '字节</li>';
		}
		res += '<li class="sub-menu-item"><img src="/images/icon_date.png" title="最后修改时间" /> ' + item["mtime"] + '</li>';
		res += '</ul></div>';
	}
	return res;
}

/*
 * 文件列表
 */
var listFiles = function(dirPath) {
	var res = "";
	var file_list = $("#file-list");
	$.ajax({
		type: "POST",
		url: url.listfile,
		data: {dirPath: dirPath},
		dataType: "JSON",
		beforeSend: function() {
			// file_list.empty().html("<p>正在加载文件列表</p>");
		},
		success: function(data) {
			if(data.status && data.status === "succeed") {
				if(currDir != ROOT_PATH) { // 当前不是根目录
					res += '<div class="list-item"><dl class="up clearfix" name="up" title="返回上一层"><dt class="item-name">返回上一层..</dt><dd></dd></dl></div>';
				}
				$.each(data.content, function(fileIndex, file) {
					var ext = getFileExt(file["name"])
					  , icon = (ext === ".jpg" || ext === ".jpeg" || ext === ".gif" || ext === ".bmp" || ext === ".png") ? "img" : file["type"];
					res += '<div class="list-item"><dl class="' + icon + ' clearfix" name="' + file["type"] + '" title="' + file["name"] + '">';
					res += '<dt class="item-name">' + file["name"] + '</dt>';
					res += '<dd><div class="menu-btn"><img src="/images/icon_menu.png" />';
					res += setSubmenu(file);
					res += '</div></dd></dl></div>';
				});
			} else {
				res = data.content;
			}
		},
		error: function() {
			res = "<p>文件列表加载失败</p>";
		},
		complete: function() {
			file_list.html(res);
		}
	});
}

/*
 * 读文件
 */
var readFile = function(filePath, next) {
	$.ajax({
		cache: false,
		type: "POST",
		url: url.readfile,
		data: {filePath: filePath},
		dataType: "JSON",
		beforeSend: function(data) {},
		success: function(data) {
			if(data.status === "succeed") {
				return next(true, data.content);
			} else {
				return next(false, NAEIDE_config.LANG.file.readFileFailed);
			}
		},
		error: function() {
			return next(false, NAEIDE_config.LANG.global.error);
		}
	});
}

/*
 * 写文件
 */
var writeFile = function(filePath, content, next) {
	$.ajax({
		cache: false,
		type: "POST",
		url: url.writefile,
		data: {filePath: filePath, content: content}, 
		dataType: "JSON",
		beforeSend: function(data) {},
		success: function(data) {
			if(data.status === "succeed") {
				return next(true, data.mtime);
			} else {
				return next(false, NAEIDE_config.LANG.file.writeFileFailed);
			}
		},
		error: function() {
			return next(false, NAEIDE_config.LANG.global.error);
		}
	});
}

/*
 * 删文件
 */
var delFile = function(filePath, next) {
	$.ajax({
		cache: false,
		type: "POST",
		url: url.delfile,
		data: {filePath: filePath}, 
		dataType: "JSON",
		beforeSend: function() {},
		success: function(data) {
			if(data.status === "succeed") {
				return next(true);
			} else {
				return next(false, NAEIDE_config.LANG.file.removeFileFailed);
			}
		},
		error: function() {
			return next(false, NAEIDE_config.LANG.global.error);
		}
	});
}

var mkDir = function(dirPath, next) {
	$.ajax({
		cache: false,
		type: "POST",
		url: url.mkdir,
		data: {dirPath: dirPath}, 
		dataType: "JSON",
		beforeSend: function(data) {},
		success: function(data) {
			if(data.status === "succeed") {
				return next(true);
			} else {
				return next(false, NAEIDE_config.LANG.file.createDirFailed);
			}
		},
		error: function() {
			return next(false, NAEIDE_config.LANG.global.error);
		}
	});
}

/*
 * 删文件夹
 */
var delDir = function(dirPath, next) {
	$.ajax({
		cache: false,
		type: "POST",
		url: url.deldir,
		data: {dirPath: dirPath},
		dataType: "JSON",
		beforeSend: function() {
		},
		success: function(data) {
			if(data.status === "succeed") {
				return next(true);
			} else {
				return next(false, NAEIDE_config.LANG.file.removeDirFailed);
			}
		},
		error: function() {
			return next(false, NAEIDE_config.LANG.global.error);
		}
	});
}

/*
 * 重命名文件
 */
var renameFile = function(oriPath, newPath, next) {
	$.ajax({
		cache: false,
		type: "POST",
		url: url.renamefile,
		data: {oriPath: oriPath, newPath: newPath},
		dataType: "JSON",
		success: function(data) {
			if(data.status === "succeed") {
				return next(true);
			} else {
				return next(false, NAEIDE_config.LANG.file.renameFailed);
			}
		},
		error: function() {
			return next(false, NAEIDE_config.LANG.global.error);
		}
	});
}

/*
 * 获取文件后缀名
 */
var getFileExt = function(str) {
	var regExp = /\.\w+$/;
	return regExp.exec(str);
}

/*
 * 从文件路径获取文件名
 */
var getFileName = function(filePath) {
	var fileName = "";
	try {
		var reg = /[^\\\/]*[\\\/]+/g; //xxx\或者是xxx/
		fileName = filePath.replace(reg, "");
		
	} catch(e) {}
	return fileName;
}

/*
 * 根据文件后缀名动态更换编辑器的语法检查模式
 */
var setEditorMode = function(ext) {
	if(ext) {
		var _mode;
		ext = ext.toString().toLowerCase();
		if(ext === ".js") {
			_mode = modes["js"]; // JavaSctip
		} else if (ext === ".css") {
			_mode = modes["css"]; // Css
		} else if (ext === ".htm" || ext === ".html" || ext === ".sthml") {
			_mode = modes["html"]; // Html
		} else if (ext === ".json") {
			_mode = modes["json"]; // Json
		} else if(ext === ".xml") {
			_mode = modes["xml"]; // Xml
		} else if (ext === ".php") {
			_mode = modes["php"];
		} else {
			_mode = modes["txt"]; // 默认为文本
		}
	} else { // 默认为文本
		_mode = modes["txt"];
	}
	head.js(_mode.scriptPath, function() {
		var _M = require(_mode.requirePath).Mode;
		editor.getSession().setMode(new _M());
	});
}

/*
 * 创建文件，type用来区分用户输入文件名的方式
 */
var createFile = function(type, content) {
	if(actionLock) return false;
	actionLock = true;
	if(type != 1 && type != 2) return false;
	$(".sub-menu").hide(); // 隐藏所有的二级目录
	var file_list = $("#file-list");
	var html = '<div class="list-item"><dl class="f clearfix" name="f">';
		html += '<dt class="item-name"></dt>';
		html += '<dd><div class="menu-btn"><img src="/images/icon_menu.png" /></div></dd>';
		html += '</dl></div>';
	var this_div = $(html);
	this_div.appendTo(file_list);
	var this_dl = this_div.children("dl");
	var this_dt = this_dl.children("dt"); // 文件名要插到这个里面
	if(type === 1) { // 弹出输入框输入文件名
		var fileName = prompt(NAEIDE_config.LANG.file.plzInputFileName, "");
		fileName = htmlspecialchars(fileName);
		this_dt.html(fileName);
		this_dl.attr("title", fileName);
		createFileAfter(fileName, this_div, content);
	} else if(type === 2) { // 在文件树里面输入
		var input = '<input name="filename" value="" type="text" class="input" />';
		showMsg1(NAEIDE_config.LANG.file.inputFileName);
		$(input)
			.appendTo(this_dt)
			.focus() // 把焦点移到该元素上
//			.blur(function() {
//				var fileName = $(this).val(); // 取出<input>元素此时的值
//				$(this).remove(); // 移除该<input>元素
//				dt.html(fileName);
//				createFileAfter(fileName, this_div, content);
//			})
			.keyup(function(e) {
				if(e.which === 13) {
					var fileName = $(this).val(); // 取出<input>元素此时的值
					fileName = htmlspecialchars(fileName);
					$(this).remove(); // 移除该<input>元素
					this_dt.html(fileName);
					this_dl.attr("title", fileName);
					createFileAfter(fileName, this_div, content);
				}
			});
	}
}

var createFileAfter = function(fileName, this_div, content) {
	if(fileName === null || fileName === "") {
		this_div.remove();
		showMsg(NAEIDE_config.LANG.file.emptyFileName);
	} else {
		var filePath = currDir + fileName;
		if(typeof content === "undefined") content = "";
		writeFile(filePath, content, function(status, msg) {
			if(!status) { // 失败
				this_div.remove();
				showMsg(msg + "，" + NAEIDE_config.LANG.global.tryLater);
				return false;
			}
			showMsg2(NAEIDE_config.LANG.file.createSucceed);
			// 在文件树里添加文件节点
			var _t = this_div.find(".menu-btn");
			var _file = {"name": fileName, "type": "f", "size": 0, "mtime": 0};
			_t.append(setSubmenu(_file));
			
			var index = addOpenedFile(filePath, content);
			addTab(fileName, index);
			
			if(typeof editor === "undefined" || !editor) initEditor();
			
			setEditingFile(index);
			setStatusBar(2, fileName);
		});
	}
	actionLock = false;
};

/*
 * 打开文件
 * @param String fileName 文件名或文件路径
 * @param boolean fileNameIsPath 第一个参数是文件名还是文件路径，true为路径，false为文件名。
 * @param int rownum 打开文件后光标定位到的行号
 * @param int colnum 打开文件后光标定位到的列号
 */
var openFile = function(fileName, fileNameIsPath, rownum, colnum) {
	if(!editor || editor === null) initEditor();
	if(!fileNameIsPath) fileNameIsPath = false;
	var filePath = "";
	if(fileNameIsPath) {
		filePath = fileName;
		fileName = getFileName(filePath);
	} else {
		filePath = currDir + fileName;
	}
	var isOpened = isFileOpened(filePath); // 检查这个文件是否已经打开了
	if(isOpened < 0) { // 没有打开
		var e = editor.getSession();
		readFile(filePath, function(status, content) {
			if(status) {
				var index = addOpenedFile(filePath, content);
				addTab(fileName, index); // 添加tab
				setEditingFile(index, false, rownum, colnum);
			} else {
				showMsg(content + "，" + NAEIDE_config.LANG.global.tryLater);
			}
		});
	} else { // 已经打开
		setEditingFile(isOpened, false, rownum, colnum);
	}
}

var closeFile = function(index) {
	if(typeof openedFiles[index] != "undefined") {
		if(openedFiles[index].changed) {
			if(confirm(NAEIDE_config.LANG.page.closeNotify)) {
				if(actionLock) return false;
				actionLock = true;
				saveFile(index);
				actionLock = false;
				setStatusBar(1, getFileName(openedFiles[index].filePath));
				return false;
			}
		}
		// 从数组中删除
		rmOpenedFile(index);
		// 删除Tab
		rmTab(index);
		index = findOpenedFile();
		if(index >= 0) { // 还有正在编辑的文件
			setEditingFile(index, true);
		} else { // 已经没有正在编辑的文件了，可以直接关闭编辑器
			closeEditor();
		}
		
	}
}

/*
 * 保存文件
 */
var saveFile = function(index) {
	if(typeof index === "undefined") {
		index = activeFile;
	}
	var e = editor.getSession();
	var content = e.getValue();
	var fileName = getFileName(openedFiles[index].filePath);
	writeFile(openedFiles[index].filePath, content, function(status, msg) {
		if(status) {
			// 处理tab
			starTab(activeFile, false);
			openedFiles[activeFile].changed = false;
			setStatusBar(1, fileName);
			// TODO:更新文件的mtime
		} else {
			showMsg(msg + "，" + NAEIDE_config.LANG.global.tryLater);
		}
	});
}

/*
 * 删除文件
 */
var rmFile = function(filePath, node) {
	var filePath = filePath.trim();
	if(typeof editor != "undefined" && editor) var e = editor.getSession();
	delFile(filePath, function(status, msg) {
		if(status) { // 删除成功
			// 删除 DOM 结点
			node.hide(200);
			if (openedFiles[activeFile] && filePath === openedFiles[activeFile].filePath) {
				rmTab(activeFile);
				rmOpenedFile(activeFile);
				if(typeof editor != "undefined" && editor && typeof e != "undefined") e.setValue("");
			}
		} else {
			showMsg(msg + "，" + NAEIDE_config.LANG.global.tryLater);
		}
	});
}

/*
 * 删除文件夹
 */
var rmDir = function(dirPath, node) {
	var dirPath = dirPath.trim();
	delDir(dirPath, function(status, msg) {
		if(status) { // 成功
			// 删除DOM节点
			node.hide(200);
			// TODO:判断当前编辑的文件是否在该目录下，如果是则丢弃editor中的内容
		} else {
			showMsg(msg + "，" + NAEIDE_config.LANG.global.tryLater);
		}
	});
}

/*
 * 边栏二级菜单显示/隐藏效果
 */
var setSubmenuAction = function() {
	$(".menu-btn").live({
		mouseenter:
		function() {
			if(actionLock) return false; // 检查锁
			$(".sub-menu").hide();
			$(this).children(".sub-menu").show(600);
		},
		mouseleave:
		function() {
			if(actionLock) return false; // 检查锁
			$(".sub-menu").hide();
			$(this).children(".sub-menu").hide(600);
		},
		click:
		function() {
			return false; // 解除父节点事件的干扰
		}
	});
}

/*
 *  边栏项目事件回调函数
 */
var itemActionCb = function() {
	if(actionLock) return false; // 检查锁
	var itemName = $(this).find(".item-name").html();
	var itemType = $(this).children("dl").attr("name");
	var curPathDiv = $("#currentPath");
	if(itemType === "f") { // is a file
		actionLock = true;
		openFile(itemName);
		currNode = $(this);
		actionLock = false;
	} else if (itemType === "d") { // is a directory
		actionLock = true;
		currDir = currDir + itemName + "/";
		listFiles(currDir);
		curPathDiv.html(currDir); // 更新当前路径
		actionLock = false;
	} else if (itemType === "up") {
		actionLock = true;
		var _t = currDir.split("/");
		currDir = '';
		for(var i = 0; i < _t.length - 2; i++) {
			currDir += _t[i] + "/";
		}
		listFiles(currDir);
		curPathDiv.html(currDir);
		actionLock = false;
	}
	return false;
}

/*
 * 边栏项目事件
 */
var setItemAction = function() {
	// 一级目录项目事件
	$(".list-item").live("click", itemActionCb);
	
	// 二级目录项目事件
	$(".sub-menu-item").live("click", function() {
		if(actionLock) return false; // 检查锁
		var this_div = $(this).parent().parent().parent().parent().parent().parent();
		var _name = this_div.children("dl").attr("title");
		var action = $(this).attr("name");
		var curPathDiv = $("#currentPath");
		if(action === "rename-file") { // 重命名文件
			actionLock = true;
			// 首先隐藏所有的二级目录
			$(".sub-menu").hide(200);
			var this_dl = this_div.children("dl");
			var this_dt = this_dl.children("dt"); // 文件名要插到这个里面
			var oriName = _name;
			// 清空dt
			this_dt.html(""); // 清空自己
			// 将文本改变为编辑框
			var input = '<input name="filename" value="' + _name + '" type="text" class="input" />';
			showMsg1(NAEIDE_config.LANG.file.inputFileName);
			$(input)
				.appendTo(this_dt)
				.focus() // 把焦点移到该元素上
				.keyup(function(e) {
					if(e.which === 13) {
						dyRenameUI(this, oriName, this_dl, this_dt);
					}
				});
		} else if(action === "edit-file") { // 编辑文件
			actionLock = true;
			openFile(_name);
			currNode = $(this);
			actionLock = false;
		} else if(action === "open-folder") {
			actionLock = true;
			currDir = curPathDiv.html() + _name + "/";
			listFiles(currDir);
			curPathDiv.html(currDir); // 更新当前路径
			actionLock = false;
		} else if(action === "del-file") { // 删除文件
			actionLock = true;
			var _path = currDir + _name;
			rmFile(_path, this_div);
			actionLock = false;
		} else if(action === "del-folder") { // 删除文件夹
			actionLock = true;
			var _dirPath = currDir + _name;
			rmDir(_dirPath, this_div);
			actionLock = false;
		}
		return false;
	});
}

var dyRenameUI = function(that, oriName, dl, dt) {
	var newName = htmlspecialchars($(that).val()); // 取出<input>元素此时的值
	if(newName === null || newName === "") {
		dt.html(oriName);
		showMsg(NAEIDE_config.LANG.file.emptyDirName);
	} else {
		var oriPath = currDir + oriName;
		var newPath = currDir + newName;
		renameFile(oriPath, newPath, function(status, errMsg) {
			$(that).remove(); // 移除该<input>元素
			if(status) { // 成功
				showMsg2(NAEIDE_config.LANG.file.modifySucceed);
				dt.html(newName);
				dl.attr("title", newName);
				dl.find(".sub-menu .sub-menu-item[name='edit-file']").children("strong").html(newName);
				// 如果重命名的文件就是当前正在编辑的文件
				var index = isFileOpened(oriPath);
				if(index >= 0) {
					openedFiles[index].filePath = newPath;
					openedFiles[index].changed = false;
					chTab(newName, index);
				}
			} else { // 失败
				showMsg(errMsg);
				dt.html(oriName);
			}
		});
	}
	actionLock = false;
}

/*
 * 顶部导航条事件
 */
var setNavAction = function() {
	$("#nav-save").click(function() {
		if(actionLock) {
			return false;
		}
		actionLock = true;
		// 检查编辑器对象是否存在
		if(!editor || editor === null) {
			showMsg(NAEIDE_config.LANG.editor.noEditingFile);
		} else {
			saveFile();
		}
		actionLock = false;
		if(editor) editor.focus(); // 重新将焦点置于editor之上
	});
	$('#nav-restart').click(function() {
		if(actionLock) return false;
		actionLock = true;
		restart();
		actionLock = false;
		if(editor) editor.focus(); // 重新将焦点置于editor之上
	});
	$("#nav-query").click(function() {
		QUERYTOOL.open(DOMAIN);
	});
}

var dyCreateDirUI = function(that, that_div, dl, dt) {
	var dirName = htmlspecialchars($(that).val()); // 取出<input>元素此时的值
	if(dirName === null || dirName === "") {
		that_div.remove();
		showMsg(NAEIDE_config.LANG.file.emptyDirName);
	} else {
		var dirPath = currDir + dirName;
		mkDir(dirPath, function(status, msg) {
			$(that).remove(); // 移除该<input>元素
			if(status) {
				showMsg2(NAEIDE_config.LANG.file.createSucceed);
				var _t = dl.children("dd").children(".menu-btn");
				var _mtime = new Date();
				_mtime = _mtime.toLocaleString();
				var _dir = {"name": dirName, "type": "d", "size": 0, "mtime": _mtime};
				_t.append(setSubmenu(_dir));
				dt.html(dirName);
				dl.attr("title", dirName);
			} else {
				that_div.remove();
				showMsg(msg + "，" + NAEIDE_config.LANG.global.tryLater);
			}
		});
	}
	actionLock = false;
}

/*
 * 边栏工具栏事件
 */
var setToolbarAction = function() {
	// 返回根目录
	$("#tb-home").click(function() {
		if(actionLock) return false;
		actionLock = true;
		currDir = ROOT_PATH;
		listFiles(ROOT_PATH);
		$("#currentPath").html(ROOT_PATH);
		actionLock = false;
	});
	// 刷新当前目录
	$("#tb-fresh").click(function() {
		if(actionLock) return false;
		actionLock = true;
		listFiles(currDir);
		actionLock = false;
	});
	// 创建新文件
	$("#tb-newf").click(function() {
		createFile(2);
	});
	// 创建新目录
	$("#tb-newd").click(function() {
		if(actionLock) return false; // 检查锁
		actionLock = true;
		var file_list = $("#file-list");
		// 首先隐藏所有的二级目录
		$(".sub-menu").hide(200);
		var html = '<div class="list-item"><dl class="d clearfix" name="d">';
			html += '<dt class="item-name"></dt>';
			html += '<dd><div class="menu-btn"><img src="/images/icon_menu.png" /></div></dd>';
			html += '</dl></div>';
		var this_div = $(html);
		this_div.appendTo(file_list);
		var this_dl = this_div.children("dl");
		var this_dt = this_dl.children("dt");
		var input = '<input name="filename" value="" type="text" class="input" />';
		showMsg1(NAEIDE_config.LANG.file.inputDirName);
		$(input)
			.appendTo(this_dt)
			.focus() // 把焦点移到该元素上
			.keyup(function(e) {
				if(e.which === 13) {
					dyCreateDirUI(this, this_div, this_dl, this_dt);
				}
			});
	});
	// 上传文件
	$("#tb-upload").toggle(
		function () {
			if(actionLock) return false;
			actionLock = true;
			$("#upload-box").slideDown(200);
			actionLock = false;
		},
		function () {
			if(actionLock) return false;
			actionLock = true;
			$("#upload-box").slideUp(200);
			actionLock = false;
		}
	);
}

/*
 * Console
 */

var setConsoleAction = function() {
	$(".stderr_gotoline").live("click", function() {
		if(actionLock) return false;
		var n = $(this).attr("name").toString().split(":")
 		   ,filePath = n[0] || ""
 		   ,rownum = n[1] || -1
 		   ,colnum = n[2] || 1;
		if(filePath !== "") {
			actionLock = true;
			openFile(filePath, true, rownum, colnum);
			actionLock = false;
		}
		return false;
	});
};

var prefer = {
	mouseIn: false,
	action: function() {
		$("#nav-prefer").click(function() {
			prefer.openPanel();
		});
		$("#nav-prefer").mouseover(function() {
			prefer.mouseIn = true;
		});
		$("#nav-prefer").mouseout(function() {
			prefer.mouseIn = false;
		});
		$(window).click(function() {
			prefer.closePanel();
		});
		$(document).click(function() {
			prefer.closePanel();
		});
		$("#console-display").change(function() {
			if (this.value === "1") {
				CLI.loader.display(true);
			} else if (this.value === "0") {
				CLI.loader.display(false);
			}
			return false;
		});
		$("#console-location").change(function() {
			console.log(this.value);
			CLI.loader.locate(this.value);
			return false;
		});
		$("#editor-theme").change(function() {
			if (!editor) return false;
			var theme = this.value;
			head.js("/scripts/ace/theme-" + theme + ".js", function() {
				editor.setTheme("ace/theme/" + theme);
				cookieHandler.set(NAEIDE_config.COOKIE.editor_theme, theme);
			});
			return false;
		});
	},
	openPanel: function() {
		$("#nav-prefer").addClass("active");
		$("#prefer-panel").slideDown("fast");
	},
	closePanel: function() {
		if (!prefer.mouseIn) {
			$("#nav-prefer").removeClass("active");
			$("#prefer-panel").fadeOut("fast");
		}
	},
}