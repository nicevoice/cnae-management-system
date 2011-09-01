var ROOT_PATH = "/";
var currPath = ROOT_PATH; // 当前路径
var currFile; // 当前文件
var currNode; // 当前文件DOM
var changed = false; // 当前文件被改变的标记
var domain; // 应用二级域名

window.onload = function() {
	
	// 初始化应用域名
	domain = $("#domain").html();
	url = {
		listfile: "/editor/" + domain + "/filelist",
		readfile: "/editor/" + domain + "/readfile",
		writefile: "/editor/" + domain + "/writefile",
		delfile: "/editor/" + domain + "/delfile",
		mkdir: "/editor/" + domain + "/mkdir",
		deldir: "/editor/" + domain + "/deldir",
		renamefile: "/editor/" + domain + "/renamefile",
		
	};
	
	// 初始化编辑器
	editor = ace.edit("editor");
	canon = require("pilot/canon");
	Renderer = require("ace/virtual_renderer").VirtualRenderer;

	// 初始化编辑器配色方案
	editor.setTheme("ace/theme/textmate");
	editor.renderer.getShowPrintMargin(true);
	editor.renderer.setHScrollBarAlwaysVisible(false);
		
	// 动态计算编辑器的尺寸
	var editorHeight = document.documentElement.clientHeight - (80 + 120);
	var editorWidth = document.documentElement.clientWidth - 300;
	$('#editor').css("height", editorHeight).css("width", editorWidth);
	
	// 绑定编辑器快捷键
	canon.addCommand({
		name: 'Save',
		bindKey: {
			win: 'Ctrl-S',
			mac: 'Command-S',
			sender: 'editor'
		},
		exec: function(env, args, request) {
			saveFile(currFile);
		}
	});
	
	// 绑定编辑器事件
	editor.getSession().on('change', function() {
		changed = true;
	});
	
	// 支持的文件类型
	modes = Array();
	modes["js"] = {
		"scriptPath": "/scripts/ace/mode-javascript.js",
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
		
	// 初始化当前路径
	$("#currentPath").html(ROOT_PATH);
	
	// 加载根目录文件列表
	listFiles(currPath);
	
	// 边栏高亮样式
	$(".list-item, .sub-menu-item").live({
		"mouseenter": function() {
			$(this).addClass("flhover");
		},
		"mouseleave": function() {
			$(this).removeClass("flhover");
		}
	});
	
	// 注册事件
	setSubmenuAction();
	setItemAction();
	setNavAction();
	setToolbarAction();
};

function showMsg(content) {
	var msger = $("#msg");
	msger.html(content).slideDown(2200, function() {
		msger.slideUp(600);
	});
}

/*
 * 生成二级目录的HTML
 */
function setSubmenu(item) {
	var res = '<div class="sub-menu"><ul>';
	if(item["name"] && item["type"]) {
		if(item["type"] == "d") { // 文件夹
			res += '<li class="sub-menu-item" name="open-folder"><img src="/images/icon_folder.png" title="打开文件夹" /> <strong>打开' + item["name"] + '</strong></li>';
			res += '<li class="sub-menu-item" name="del-folder"><img src="/images/icon_delete.png" title="删除文件夹" /> 删除</li>';
		} else if (item.type == "f") { // 文件
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
function listFiles(dirPath) {
	var res = "";
	var file_list = $("#file-list");
	$.ajax({
		type: "POST",
		url: url.listfile,
		data: {dirPath: dirPath},
		dataType: "JSON",
		beforeSend: function() {
			file_list.empty().html("<p>正在加载文件列表</p>");
		},
		success: function(data) {
			if(data.status && data.status == "succeed") {
				if(currPath != ROOT_PATH) { // 当前不是根目录
					res += '<div class="list-item"><dl class="up clearfix" name="up"><dt class="item-name">返回上一层..</dt><dd></dd></dl></div>';
				}
				$.each(data.content, function(fileIndex, file) {
					res += '<div class="list-item"><dl class="' + file["type"] + ' clearfix" name="' + file["type"] + '">';
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
function readFile(filePath, next) {
	$.ajax({
		type: "POST",
		url: url.readfile,
		data: {filePath: filePath},
		dataType: "JSON",
		beforeSend: function(data) {},
		success: function(data) {
			if(data.status == "succeed") {
				return next(true, data.content);
			} else {
				return next(false, "读文件失败");
			}
		},
		error: function() {
			return next(false, "出错了");
		}
	});
}

/*
 * 写文件
 */
function writeFile(filePath, content, next) {
	$.ajax({
		type: "POST",
		url: url.writefile,
		data: {filePath: filePath, content: content}, 
		dataType: "JSON",
		beforeSend: function(data) {},
		success: function(data) {
			if(data.status == "succeed") {
				return next(true, data.mtime);
			} else {
				return next(false, "写文件失败");
			}
		},
		error: function() {
			return next(false, "出错了");
		}
	});
}

/*
 * 删文件
 */
function delFile(filePath, next) {
	$.ajax({
		type: "POST",
		url: url.delfile,
		data: {filePath: filePath}, 
		dataType: "JSON",
		beforeSend: function() {},
		success: function(data) {
			if(data.status == "succeed") {
				return next(true);
			} else {
				return next(false, "删文件失败");
			}
		},
		error: function() {
			return next(false, "出错了");
		}
	});
}

function mkDir(dirPath, next) {
	$.ajax({
		type: "POST",
		url: url.mkdir,
		data: {dirPath: dirPath}, 
		dataType: "JSON",
		beforeSend: function(data) {},
		success: function(data) {
			if(data.status == "succeed") {
				return next(true);
			} else {
				return next(false, "创建目录失败");
			}
		},
		error: function() {
			return next(false, "出错了");
		}
	});
}

/*
 * 删文件夹
 */
function delDir(dirPath, next) {
	$.ajax({
		type: "POST",
		url: url.deldir,
		data: {dirPath: dirPath},
		dataType: "JSON",
		beforeSend: function() {
		},
		success: function(data) {
			if(data.status == "succeed") {
				return next(true);
			} else {
				return next(false, "删除目录失败");
			}
		},
		error: function() {
			return next(false, "出错了");
		}
	});
}

/*
 * 重命名文件
 */
function renameFile(oriPath, newPath, next) {
	$.ajax({
		type: "POST",
		url: url.renamefile,
		data: {oriPath: oriPath, newPath: newPath},
		dataType: "JSON",
		success: function(data) {
			if(data.status == "succeed") {
				return next(true);
			} else {
				return next(false, "重命名失败");
			}
		},
		error: function() {
			return next(false, "出错了");
		}
	});
}

/*
 * 获取文件后缀名
 */
function getFileExt(str) {
	var regExp = /\.\w+$/;
	return regExp.exec(str);
}

/*
 * 根据文件后缀名动态更换编辑器的语法检查模式
 */
function setEditorMode(ext) {
	var _mode;
	if(ext == ".js") {
		// JavaSctip
		_mode = modes["js"];
	} else if (ext == ".css") {
		// Css
		_mode = modes["css"];
	} else if (ext == ".htm" || ext == ".html" || ext == ".sthml") {
		// Html
		_mode = modes["html"];
	} else if (ext == ".json") {
		// Json
		_mode = modes["json"];
	} else if(ext == ".xml") {
		// Xml
		_mode = modes["xml"];
	} else {
		// 默认为文本
		_mode = modes["txt"];
	}
	head.js(_mode.scriptPath, function() {
		var _M = require(_mode.requirePath).Mode;
		editor.getSession().setMode(new _M());
	});
}

/*
 * 打开文件
 */
function openFile(filePath) {
	if(changed) { // 文件被修改过
		if(confirm("文件被修改过，是否保存？")) saveFile(currFile);
	}
	var e = editor.getSession();
	e.setValue("");
	readFile(filePath, function(status, content) {
		if(status) {
			// 依据文件后缀名更改编辑器的语法模式
			setEditorMode(getFileExt(filePath));
			e.setValue(content);
			currFile = filePath;
			changed = false; // 重置文件修改标记
		} else {
			showMsg(content + "，请稍后再尝试");
		}
	});
	
}

/*
 * 保存文件
 */
function saveFile(filePath) {
	var filePath = filePath.trim();
	var content = editor.getSession().getValue();
	writeFile(filePath, content, function(status, msg) {
		if(status) {
			showMsg("保存成功");
			// TODO:更新文件的mtime
		} else {
			showMsg(msg + "，请稍后再尝试");
		}
	});
}

/*
 * 删除文件
 */
function rmFile(filePath, node) {
	var filePath = filePath.trim();
	var e = editor.getSession();
	delFile(filePath, function(status, msg) {
		if(status) { // 删除成功
			// 删除 DOM 结点
			node.hide(200);
			if (filePath == currFile) e.setValue("");
		} else {
			showMsg(msg + "，请稍后再尝试");
		}
	});
}

/*
 * 删除文件夹
 */
function rmDir(dirPath, node) {
	var dirPath = dirPath.trim();
	delDir(dirPath, function(status, msg) {
		if(status) { // 成功
			// 删除DOM节点
			node.hide(200);
			// TODO:判断当前编辑的文件是否在该目录下，如果是则丢弃editor中的内容
		} else {
			showMsg(msg + "，请稍后再尝试");
		}
	});
}

/*
 * 查找
 */
function finds() {
	$needle = prompt("请输入要查找的内容：");
	editor.find($needle, {
		backwards: false,
		wrap: false,
		caseSensitive: false,
		wholeWord: false,
		regExp: true // 支持正则表达式
	});
	editor.findNext();
//	editor.findPrevious();
}


/*
 * 边栏二级菜单显示/隐藏效果
 */
function setSubmenuAction() {
	$(".menu-btn").live({
		mouseenter:
		function() {
			$(".sub-menu").hide();
			$(this).children(".sub-menu").show(600);
		},
		mouseleave:
		function() {
			$(".sub-menu").hide();
			$(this).children(".sub-menu").hide(600);
		}
	});
}

/*
 *  边栏项目事件回调函数
 */
function itemActionCb() {
	var name = $(this).html();
	var type = $(this).parent().attr("name");
	var curPathDiv = $("#currentPath");
	if(type == "f") { // is a file
		var filePath = currPath + name;
		openFile(filePath);
		currNode = $(this);
	} else if (type == "d") { // is a directory
		currPath = currPath + name + "/";
		listFiles(currPath);
		curPathDiv.html(currPath); // 更新当前路径
	} else if (type == "up") {
		var _t = currPath.split("/");
		currPath = '';
		for(var i = 0; i < _t.length - 2; i++) {
			currPath += _t[i] + "/";
		}
		listFiles(currPath);
		curPathDiv.html(currPath);
	}
}

function dyRenameUI(that, oriName, dt) {
	var newName = $(that).val(); // 取出<input>元素此时的值
	var oriPath = currPath + oriName;
	var newPath = currPath + newName;
	renameFile(oriPath, newPath, function(status, errMsg) {
		$(that).remove(); // 移除该<input>元素
		if(status) { // 成功
			dt.html(newName);
		} else { // 失败
			showMsg(errMsg);
			dt.html(oriName);
		}
	});
	$(".item-name").live("click", itemActionCb); // 重新为dt注册事件
}

/*
 * 边栏项目事件
 */
function setItemAction() {
	// 一级目录项目事件
	$(".item-name").live("click", itemActionCb);
	
	// 二级目录项目事件
	$(".sub-menu-item").live("click", function() {
		var this_div = $(this).parent().parent().parent().parent().parent();
		var _name = this_div.children("dt").html();
		var action = $(this).attr("name");
		var curPathDiv = $("#currentPath");
		if(action == "rename-file") { // 重命名文件
			// 首先隐藏所有的二级目录
			$(".sub-menu").hide(200);
			// 取得dt
			var dt = this_div.children("dt");
			var oriName = _name;
			// 清空dt
			dt.html(""); // 清空自己
			$(".item-name").die(); // 暂时解除所有dt的事件
			// 将文本改变为编辑框
			var input = '<input name="filename" value="' + _name + '" type="text" class="input" />';
			$(input)
				.appendTo(dt)
				.focus() // 把焦点移到该元素上
				.blur(function() { // 绑定focusout事件
					dyRenameUI(this, oriName, dt);
				})
				.keyup(function(e) {
					if(e.which == 13) {
						dyRenameUI(this, oriName, dt);
					}
				});
		} else if(action == "edit-file") { // 编辑文件
			var filePath = currPath + _name;
			openFile(filePath);
			currNode = $(this);
		} else if(action == "open-folder") {
			currPath = curPathDiv.html() + _name + "/";
			listFiles(currPath);
			curPathDiv.html(currPath); // 更新当前路径	
		} else if(action == "del-file") { // 删除文件
			var _path = currPath + _name;
			rmFile(_path, this_div);
		} else if(action == "del-folder") { // 删除文件夹
			var _dirPath = currPath + _name;
			rmDir(_dirPath, this_div);
		}
	});
}

/*
 * 顶部导航条事件
 */
function setNavAction() {
	$("#nav-save").click(function() {
		saveFile(currFile);
	});
}

function dyCreateFileUI(that, that_div, dt) {
	var fileName = $(that).val(); // 取出<input>元素此时的值
	if(fileName == null || fileName == "") {
		that_div.remove();
		showMsg("文件名不能为空");
	} else {
		var filePath = currPath + fileName;
		var content = editor.getSession().getValue();
		writeFile(filePath, content, function(status, msg) {
			$(that).remove(); // 移除该<input>元素
			if(status) { // 成功
				var _t = that_div.children("dl").children("dd").children(".menu-btn");
				var _file = {"name": fileName, "type": "f", "size": 0, "mtime": 0};
				_t.append(setSubmenu(_file));
				dt.html(fileName);
			} else { // 失败
				that_div.remove();
				showMsg(msg + "，请稍后再尝试");
			}
		});
	}
	$(".item-name").live("click", itemActionCb); // 重新为dt注册事件
}

function dyCreateDirUI(that, that_div, dt) {
	var dirName = $(that).val(); // 取出<input>元素此时的值
	if(dirName == null || dirName == "") {
		that_div.remove();
		showMsg("目录名不能为空");
	} else {
		var dirPath = currPath + dirName;
		mkDir(dirPath, function(status, msg) {
			$(that).remove(); // 移除该<input>元素
			if(status) {
				var _t = that_div.children("dl").children("dd").children(".menu-btn");
				var _mtime = new Date();
				_mtime = _mtime.toLocaleString();
				var _dir = {"name": dirName, "type": "d", "size": 0, "mtime": _mtime};
				_t.append(setSubmenu(_dir));
				dt.html(dirName);
			} else {
				that_div.remove();
				showMsg(msg + "，请稍后再尝试");
			}
		});
	}
	$(".item-name").live("click", itemActionCb); // 重新为dt注册事件
}

/*
 * 边栏工具栏事件
 */
function setToolbarAction() {
	// 返回根目录
	$("#tb-home").click(function() {
		currPath = ROOT_PATH;
		listFiles(ROOT_PATH);
		$("#currentPath").html(ROOT_PATH);
	});
	// 刷新当前目录
	$("#tb-fresh").click(function() {
		listFiles(currPath);
	});
	// 创建新文件
	$("#tb-newf").click(function() {
		var file_list = $("#file-list");
		$(".item-name").die(); // 暂时解除所有dt的事件
		// 首先隐藏所有的二级目录
		$(".sub-menu").hide(200);
		var html = '<div class="list-item"><dl class="f clearfix" name="f">';
			html += '<dt class="item-name"></dt>';
			html += '<dd><div class="menu-btn"><img src="/images/icon_menu.png" /></div></dd>';
			html += '</dl></div>';
		var this_div = $(html);
		this_div.appendTo(file_list);
		var dt = this_div.children("dl").children("dt");
		var input = '<input name="filename" value="" type="text" class="input" />';
		$(input)
			.appendTo(dt)
			.focus() // 把焦点移到该元素上
			.blur(function() {
				dyCreateFileUI(this, this_div, dt);
			})
			.keyup(function(e) {
				if(e.which == 13) {
					dyCreateFileUI(this, this_div, dt);
				}
			});
		
	});
	// 创建新目录
	$("#tb-newd").click(function() {
		var file_list = $("#file-list");
		$(".item-name").die(); // 暂时解除所有dt的事件
		// 首先隐藏所有的二级目录
		$(".sub-menu").hide(200);
		var html = '<div class="list-item"><dl class="d clearfix" name="d">';
			html += '<dt class="item-name"></dt>';
			html += '<dd><div class="menu-btn"><img src="/images/icon_menu.png" /></div></dd>';
			html += '</dl></div>';
		var this_div = $(html);
		this_div.appendTo(file_list);
		var dt = this_div.children("dl").children("dt");
		var input = '<input name="filename" value="" type="text" class="input" />';
		$(input)
			.appendTo(dt)
			.focus() // 把焦点移到该元素上
			.blur(function() {
				dyCreateDirUI(this, this_div, dt);
			})
			.keyup(function(e) {
				if(e.which == 13) {
					dyCreateDirUI(this, this_div, dt);
				}
			});
	});
}
