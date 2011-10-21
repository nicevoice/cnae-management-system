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
var lang_cannotSaveFile = "无法保存文件，因为：";

function setTabAction() {
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

function setEditingFile(index, noStore) {
	var e = editor.getSession();
	// 先保存原来的文件信息
	if((typeof noStore == "undefined" || !noStore) && activeFile >= 0 && typeof openedFiles[activeFile] != "undefined") {
		var oriContent = e.getValue();
		openedFiles[activeFile].content = oriContent;
		openedFiles[activeFile].activeRow = e.getSelection().getCursor().row + 1;
		openedFiles[activeFile].activeCol = e.getSelection().getCursor().column;
	}
	if(typeof openedFiles[index] == "undefined") return false;
	var newContent = openedFiles[index].content;
	var newActiveRow = openedFiles[index].activeRow;
	var newActiveCol = openedFiles[index].activeCol;
	// 更新当前文件指针
	activeFile = index;
	
	// 处理Tab
	activeTab(activeFile);
	setEditorMode(getFileExt(openedFiles[index].filePath));
	changeLock = true; // 上锁
	// 将文件内容写入editor
	e.setValue(newContent);
	// 光标移动到活动行
	editor.gotoLine(newActiveRow, newActiveCol);
	changeLock = false; // 解除锁
}

function findOpenedFile() {
	var len = openedFiles.length;
	for(i = len - 1; i >= 0; i--) {
		if(typeof openedFiles[i] != "undefined") return i;
	}
	return -1;
}

function hasFileChanged() {
	var len = openedFiles.length;
	for(i = 0; i < len; i++) {
		if(typeof openedFiles[i] != "undefined" && openedFiles[i].changed) return i;
	}
	return -1;
}

function isFileOpened(filePath) {
	var len = openedFiles.length;
	for(i = 0; i < len; i++) {
		if(typeof openedFiles[i] != "undefined" && openedFiles[i].filePath == filePath) return i;
	}
	return -1;
}

function addOpenedFile(filePath, content) {
	var newFile = {filePath: filePath, content: content, changed: false};
	var len = openedFiles.push(newFile);
	return len - 1;
}

function rmOpenedFile(index) {
	try {
		delete openedFiles[index];
		return true;
	} catch(e) {}
	return false;
}

function chOpenedFile(index, content) {
	try {
		openedFiles[index].content = content;
		openedFiles[index].changed = true;
	} catch(e) {}
	return false;
}

function addTab(fileName, index) {
	var newTab = '<div class="tab ' + index + '" name="' + index + '" title="' + fileName + '"><div class="close" title="关闭文件">X</div>' + fileName + '</div>';
	$("#tabs").append(newTab);
}

function rmTab(index) {
	$("#tabs ." + index).remove();
}

function chTab(fileName, index) {
	$("#tabs ." + index).attr("title", fileName).html('<div class="close" title="关闭文件">X</div>' + fileName);
}

function starTab(index, add) {
	if(typeof add != "boolean") add = true;
	var target = $("#tabs ." + index);
	var fileName = target.attr("title");
	if(add) { // 加星号
		fileName += '*';
	}
	target.html('<div class="close" title="关闭文件">X</div>' + fileName);
}

function activeTab(index) {
	if(typeof index == "undefined") index = activeFile;
	$(".tab").removeClass("active");
	$("#tabs ." + index).addClass("active");
}

/*
 * 动态设定编辑器尺寸
 */
function setEditorSize(h, w) {
	if(typeof h == "undefined") {
		h = document.documentElement.clientHeight - (80 + 130);
	}
	if(typeof w == "undefined") {
		w = document.body.clientWidth - 260;
	}
	$('#editor').css("height", h).css("width", w);
}

/*
 * 动态设定控制台尺寸
 */
function setConsoleSize(w) {
	if(typeof w == "undefined")
		w = (document.body.clientWidth - 25) / 2;
	$('#stdout').css("width", w);
	$('#stderr').css("width", w);
}

function setFileListSize() {
	h = document.documentElement.clientHeight - (120 + 150);
	$("#file-list").css("height", h).css("overflow", "auto");
}

function setElementsSize() {
	setEditorSize();
	setConsoleSize();
	setFileListSize();
}

function onChange() {
	if(!changeLock) { // 检查锁
		if(typeof openedFiles[activeFile] != "undefined") {
			openedFiles[activeFile].changed = true;
			starTab(activeFile, true);
		}
	}
}

function initEditor() {
	editor = ace.edit("editor");
	canon = require("pilot/canon");
	Renderer = require("ace/virtual_renderer").VirtualRenderer;
	
	// 初始化编辑器配色方案
	editor.setTheme("ace/theme/textmate");
	editor.renderer.getShowPrintMargin(true);
	editor.renderer.setHScrollBarAlwaysVisible(false);
	
	// 绑定编辑器快捷键
	canon.addCommand({
		name: 'Save',
		bindKey: {
			win: 'Ctrl-S',
			mac: 'Command-S',
			sender: 'editor'
		},
		exec: function(env, args, request) {
			if(actionLock) {
				showMsg(lang_cannotSaveFile + "锁未被解除。");
				return false;
			}
			actionLock = true;
			saveFile(activeFile);
			actionLock = false;
		}
	});
	
	// 绑定编辑器事件
	editor.getSession().on('change', onChange);
}

function closeEditor() {
	editor = null;
	canon = null;
	Renderer = null;
	$("#editor").html("");
}

$(window).resize(function(){
	// 编辑器和控制台尺寸自适应
	setElementsSize();
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

window.onload = function() {
	// 初始化编辑器和控制台尺寸
	setElementsSize();
	
	// 初始化应用域名
	DOMAIN = $("#domain").html();
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
	listFiles(currDir);
	
	// 注册事件
	setSubmenuAction();
	setItemAction();
	setNavAction();
	setToolbarAction();
	setTabAction();
	
	setConsoleResize();
	
	var options = { 
		beforeSubmit:	function() {
			showMsg1("正在上传..");
		},
		success:		function(data) {
			if(typeof data.error != "undefined" && data.error == "false") {
				listFiles(currDir);
				showMsg2("上传成功");
			} else {
				showMsg2("上传失败！");
			}
		},
		complete:		function() {
			//$("#msg").hide();
		},
		url:			"/application/manage/" + DOMAIN + "/uploadImg",
		type:			"post",
		dataType:		"json",
		resetForm:		true,
		timeout:		30000
	};
	
	$('#upload-form').submit(function() {
		options.data = {dirPath: currDir};
		$(this).ajaxSubmit(options);
		return false;
	});
	
	// 加载样式
	setSidebarUI();
	mouseOnStdDiv();
};

window.onbeforeunload = function() {
	var index = hasFileChanged();
	if(index >= 0 && editor) { // 有尚未保存的文件，且编辑器尚未关闭
		setEditingFile(index);
		return "文件尚未保存，现在离开本页面将丢失已修改的内容。确认离开页面？";
	}
};

function showMsg1(content) {
	$("#msg").html(content).slideDown();
}

function showMsg2(content, waiting, speed) {
	if(typeof waiting == "undefined") waiting = 1200;
	if(typeof speed == "undefined") speed = 600;
	var msger = $("#msg");
	msger.html(content);
	setTimeout(function() { msger.slideUp(speed); }, waiting);
}

function htmlspecialchars(str) {
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
		showMsg1("正在重启，请稍候..");
	},
	error:function(){
		showMsg2("重启失败");
	},
	success:function(data){
		if(data.status!=="ok"){
			if(data.code==202){	//not found错误，则改为上线
				$.ajax({
					cache:false,
					type:"post",
					url:"/application/manage/"+DOMAIN+"/controlApp",
					dataType:"json",
					data:{action:"start"},
					error:function(){
						showMsg2("重启失败");
					},
					success:function(data){
						if(data.status==="ok"){
						    showMsg2("重启成功");
							window.clearInterval(outTimer);
							window.clearInterval(errTimer);
							outTimer = window.setInterval(function(){
								getOutput("stdout");
							}, interval);
							errTimer = window.setInterval(function(){
								getOutput("stderr");
							}, interval);
							addRecord(DOMAIN, "应用重启");
						}else{
							showMsg2("重启失败:"+data.msg);
						}
					}
				})
			}else{
				showMsg2("重启失败:"+data.msg);
			}
		}else{
		    showMsg2("重启成功");
			window.clearInterval(outTimer);
			window.clearInterval(errTimer);
			outTimer = window.setInterval(function(){
				getOutput("stdout");
			}, interval);
			errTimer = window.setInterval(function(){
				getOutput("stderr");
			}, interval);
			addRecord(DOMAIN, "应用重启");
		}
		getOutput("stdout");
		getOutput("stderr");
		//setConsoleHeight();
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
			$("#"+action).html(action + "获取失败");
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
function showMsg(content, waiting, speed) {
	if(typeof waiting == "undefined") waiting = 1200;
	if(typeof speed == "undefined") speed = 600;
	var msger = $("#msg");
	msger.html(content).slideDown(speed, function() {
		setTimeout(function() { msger.slideUp(speed); }, waiting);
	});
}

function setStatusBar(type, content) {
	var d = new Date();
	var curr = d.toLocaleString();
	var statbar = $("#statbar");
	if(type == 1) { // 保存
		statbar.html("已保存：" + content + "，于" + curr);
	} else if(type == 2) { // 创建
		statbar.html("已创建：" + content + "，于" + curr);
	}
}


/*
 * 设置边栏样式
 */
function setSidebarUI() {
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
			// file_list.empty().html("<p>正在加载文件列表</p>");
		},
		success: function(data) {
			if(data.status && data.status == "succeed") {
				if(currDir != ROOT_PATH) { // 当前不是根目录
					res += '<div class="list-item"><dl class="up clearfix" name="up" title="返回上一层"><dt class="item-name">返回上一层..</dt><dd></dd></dl></div>';
				}
				$.each(data.content, function(fileIndex, file) {
					var ext = getFileExt(file["name"])
					  , icon = (ext == ".jpg" || ext == ".jpeg" || ext == ".gif" || ext == ".bmp" || ext == ".png") ? "img" : file["type"];
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
function readFile(filePath, next) {
	$.ajax({
		cache: false,
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
		cache: false,
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
		cache: false,
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
		cache: false,
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
		cache: false,
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
		cache: false,
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
 * 从文件路径获取文件名
 */
function getFileName(filePath) {
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
 * 创建文件，type用来区分用户输入文件名的方式
 */
function createFile(type, content) {
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
	if(type == 1) { // 弹出输入框输入文件名
		var fileName = prompt("请输入文件名", "");
		fileName = htmlspecialchars(fileName);
		this_dt.html(fileName);
		this_dl.attr("title", fileName);
		createFileAfter(fileName, this_div, content);
	} else if(type == 2) { // 在文件树里面输入
		var input = '<input name="filename" value="" type="text" class="input" />';
		showMsg1("输入文件名后按回车键继续");
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
				if(e.which == 13) {
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

function createFileAfter(fileName, this_div, content) {
	if(fileName == null || fileName == "") {
		this_div.remove();
		showMsg("文件名不能为空");
	} else {
		var filePath = currDir + fileName;
		if(typeof content == "undefined") content = "";
		writeFile(filePath, content, function(status, msg) {
			if(!status) { // 失败
				this_div.remove();
				showMsg(msg + "，请稍后再尝试");
				return false;
			}
			showMsg2("创建成功");
			// 在文件树里添加文件节点
			var _t = this_div.find(".menu-btn");
			var _file = {"name": fileName, "type": "f", "size": 0, "mtime": 0};
			_t.append(setSubmenu(_file));
			
			var index = addOpenedFile(filePath, content);
			addTab(fileName, index);
			
			if(typeof editor == "undefined" || !editor) initEditor();
			
			setEditingFile(index);
			setStatusBar(2, fileName);
		});
	}
	actionLock = false;
};

/*
 * 打开文件
 */
function openFile(fileName) {
	if(typeof editor == "undefined" || editor == null) initEditor();
	var filePath = currDir + fileName;
	// 检查这个文件是否已经打开了
	var isOpened = isFileOpened(filePath);
	if(isOpened < 0) { // 没有打开
		var e = editor.getSession();
		readFile(filePath, function(status, content) {
			if(status) {
				var index = addOpenedFile(filePath, content);
				// 添加tab
				addTab(fileName, index);
				setEditingFile(index);
			} else {
				showMsg(content + "，请稍后再尝试");
			}
		});
	} else { // 已经打开
		// alert(isOpened);
		setEditingFile(isOpened);
	}
}

function closeFile(index) {
	if(typeof openedFiles[index] != "undefined") {
		if(openedFiles[index].changed) {
			if(confirm("文件尚未保存，现在关闭将丢失修改的内容。保存该文件吗？")) {
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
function saveFile(index) {
	if(typeof index == "undefined") {
		index = activeFile;
	}
	// showMsg1("正在保存..");
	var content = editor.getSession().getValue();
	var fileName = getFileName(openedFiles[index].filePath);
	writeFile(openedFiles[index].filePath, content, function(status, msg) {
		if(status) {
			// showMsg2("保存成功：" + openedFiles[index].filePath);
			// 处理tab
			starTab(activeFile, false);
			openedFiles[activeFile].changed = false;
			setStatusBar(1, fileName);
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
	if(typeof editor != "undefined" && editor) var e = editor.getSession();
	delFile(filePath, function(status, msg) {
		if(status) { // 删除成功
			// 删除 DOM 结点
			node.hide(200);
			if (typeof openedFiles[activeFile] != "undefined" && filePath == openedFiles[activeFile].filePath) {
				rmTab(activeFile);
				rmOpenedFile(activeFile);
				if(typeof editor != "undefined" && editor && typeof e != "undefined") e.setValue("");
			}
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
 * 边栏二级菜单显示/隐藏效果
 */
function setSubmenuAction() {
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
function itemActionCb() {
	if(actionLock) return false; // 检查锁
	var itemName = $(this).find(".item-name").html();
	var itemType = $(this).children("dl").attr("name");
	var curPathDiv = $("#currentPath");
	if(itemType == "f") { // is a file
		actionLock = true;
		openFile(itemName);
		currNode = $(this);
		actionLock = false;
	} else if (itemType == "d") { // is a directory
		actionLock = true;
		currDir = currDir + itemName + "/";
		listFiles(currDir);
		curPathDiv.html(currDir); // 更新当前路径
		actionLock = false;
	} else if (itemType == "up") {
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
function setItemAction() {
	// 一级目录项目事件
	$(".list-item").live("click", itemActionCb);
	
	// 二级目录项目事件
	$(".sub-menu-item").live("click", function() {
		if(actionLock) return false; // 检查锁
		var this_div = $(this).parent().parent().parent().parent().parent().parent();
		var _name = this_div.children("dl").attr("title");
		var action = $(this).attr("name");
		var curPathDiv = $("#currentPath");
		if(action == "rename-file") { // 重命名文件
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
			showMsg1("输入文件名后按回车键继续");
			$(input)
				.appendTo(this_dt)
				.focus() // 把焦点移到该元素上
//				.blur(function() { // 绑定focusout事件
//					dyRenameUI(this, oriName, dt);
//				})
				.keyup(function(e) {
					if(e.which == 13) {
						dyRenameUI(this, oriName, this_dl, this_dt);
					}
				});
		} else if(action == "edit-file") { // 编辑文件
			actionLock = true;
			openFile(_name);
			currNode = $(this);
			actionLock = false;
		} else if(action == "open-folder") {
			actionLock = true;
			currDir = curPathDiv.html() + _name + "/";
			listFiles(currDir);
			curPathDiv.html(currDir); // 更新当前路径
			actionLock = false;
		} else if(action == "del-file") { // 删除文件
			actionLock = true;
			var _path = currDir + _name;
			rmFile(_path, this_div);
			actionLock = false;
		} else if(action == "del-folder") { // 删除文件夹
			actionLock = true;
			var _dirPath = currDir + _name;
			rmDir(_dirPath, this_div);
			actionLock = false;
		}
		return false;
	});
}

function dyRenameUI(that, oriName, dl, dt) {
	var newName = htmlspecialchars($(that).val()); // 取出<input>元素此时的值
	if(newName == null || newName == "") {
		dt.html(oriName);
		showMsg("目录名不能为空");
	} else {
		var oriPath = currDir + oriName;
		var newPath = currDir + newName;
		renameFile(oriPath, newPath, function(status, errMsg) {
			$(that).remove(); // 移除该<input>元素
			if(status) { // 成功
				showMsg2("修改成功");
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
function setNavAction() {
	$("#nav-save").click(function() {
		showMsg1("按下“保存”按钮..");
		if(actionLock) {
			showMsg(lang_cannotSaveFile + "锁未被解除。");
			return false;
		}
		actionLock = true;
		// 检查编辑器对象是否存在
		if(typeof editor == "undefined" || !editor) {
			showMsg("没有正在编辑的文件");
		} else {
			saveFile();
		}
		actionLock = false;
		showMsg2("保存结束。");
	});
	// 绑定重启事件
	$('#restart').click(function() {
		if(actionLock) return false;
		actionLock = true;
		restart();
		actionLock = false;
	});
}

function dyCreateDirUI(that, that_div, dl, dt) {
	var dirName = htmlspecialchars($(that).val()); // 取出<input>元素此时的值
	if(dirName == null || dirName == "") {
		that_div.remove();
		showMsg("目录名不能为空");
	} else {
		var dirPath = currDir + dirName;
		mkDir(dirPath, function(status, msg) {
			$(that).remove(); // 移除该<input>元素
			if(status) {
				showMsg2("创建成功");
				var _t = dl.children("dd").children(".menu-btn");
				var _mtime = new Date();
				_mtime = _mtime.toLocaleString();
				var _dir = {"name": dirName, "type": "d", "size": 0, "mtime": _mtime};
				_t.append(setSubmenu(_dir));
				dt.html(dirName);
				dl.attr("title", dirName);
			} else {
				that_div.remove();
				showMsg(msg + "，请稍后再尝试");
			}
		});
	}
	actionLock = false;
}

/*
 * 边栏工具栏事件
 */
function setToolbarAction() {
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
		showMsg1("输入目录名后按回车键继续");
		$(input)
			.appendTo(this_dt)
			.focus() // 把焦点移到该元素上
//			.blur(function() {
//				dyCreateDirUI(this, this_div, dt);
//			})
			.keyup(function(e) {
				if(e.which == 13) {
					dyCreateDirUI(this, this_div, this_dl, this_dt);
				}
			});
	});
	// 上传文件
	$("#tb-upload").toggle(
		function () {
			$("#upload-box").slideDown(200);
		},
		function () {
			$("#upload-box").slideUp(200);
		}
	);
}

function setConsoleResize(minHeight) {
	if(typeof minHeight == "undefined") minHeight = 125;
	maxHeight = document.documentElement.clientHeight - 100;
	$("#console").resizable({
		handles: 'n',
		minHeight: minHeight,
		maxHeight: maxHeight
	});
	$("#console").resize(function() {
		var h = $(this).height() - 30;
		$('#stdout').css("height", h);
		$('#stderr').css("height", h);
	});
	$("#console-min").click(function() {
		setConsoleHeight(minHeight);
	});
}

function setConsoleHeight(height) {
	if(typeof height == "undefined") {
		height = Math.round(document.documentElement.clientHeight * 0.5);
	}
	$("#console").removeAttr("style").css("height", height);
	var h = height - 30;
	$('#stdout').css("height", h);
	$('#stderr').css("height", h);
}