var NAEIDE_config = {};

NAEIDE_config.BASE = "/home/admin/cnae/git/cnode-app-engine/apps/";

NAEIDE_config.COOKIE = {
	console_display: "NAE_c_display",
	console_location: "NAE_c_location",
	editor_theme: "NAE_e_theme",
	querytool_options: "querytool-options",
};

NAEIDE_config.LANG = {};
NAEIDE_config.LANG.global = {
	error: "出错了",
	tryLater: "请稍后再尝试",
};
NAEIDE_config.LANG.page = {
	leaveNotify: "文件尚未保存，现在离开本页面将丢失已修改的内容。确认离开页面？",
	closeNotify: "文件尚未保存，现在关闭将丢失修改的内容。保存该文件吗？",
};
NAEIDE_config.LANG.apps = {
	restart: "应用重启",
	restarting: "正在重启，请稍候..",
	restartSucceed: "重启成功",
	restartFailed: "重启失败",
	getInfFailed: "获取失败",
};
NAEIDE_config.LANG.editor = {
	noEditingFile: "没有正在编辑的文件",
};
NAEIDE_config.LANG.file = {
	readFileFailed: "读文件失败",
	writeFileFailed: "写文件失败",
	removeFileFailed: "删文件失败",
	createDirFailed: "创建目录失败",
	removeDirFailed: "删目录失败",
	renameFailed: "重命名失败",
	plzInputFileName: "请输入文件名",
	plzInputDirName: "请输入目录名",
	inputFileName: "输入文件名后按回车键继续",
	inputDirName: "输入目录名后按回车键继续",
	emptyFileName: "文件名不能为空",
	emptyDirName: "目录名不能为空",
	uploading: "正在上传..",
	uploadSucceed: "上传成功",
	uploadFailed: "上传失败！",
	createSucceed: "创建成功",
	modifySucceed: "修改成功",
};

NAEIDE_config.SCRIPTPATH = {
	jquery: "/scripts/jquery-1.6.2.min.js",
	querytool: "/scripts/editor.querytool.js?v=0.0.1",
	cookie: "/scripts/editor.cookie.js?v=0.0.1",
};