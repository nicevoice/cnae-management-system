var hasGitInfo = false,
    hasNpmInfo = false, 
    npmTips = "在此输入需要安装的模块名",
    regTips = "输入要下载的文件名（支持通配符），不输入为全部下载",
    validator = new Validator(),
    url = location.href;
url = url.slice(0, url.lastIndexOf('/'));
var domain = url.slice(url.lastIndexOf('/') + 1);

//保存查询记录
var querys = [], index=0;

$(function() {
  $("#npmName").blur(addnpmTips).focus(removenpmTips).val(npmTips);
  $("#downloadReg").blur(addregTips).focus(removeregTips).val(regTips);
  $.ajax({
    cache : false,
    url : "/getOwnAuthInfo",
    type : "post",
    dataType : "json",
    data : {
      domain : domain
    },
    error : function() {
      $("#submitUpload").click(upload);
      $("#download").click(download);
      $("#gitAction").click(git);
      $("#npmInstall").click(install);
      $("#gitCommand").keydown(function(e) {
        if(e.keyCode === 13) {
          git();
        }else if(e.keyCode === 38){
        $("#gitCommand").val(querys.length>0?querys[index--] :"");
        if(index<0) index = 0;
    		}else if(e.keyCode === 40){
        if(index+1 === querys.length)
            return;
        $("#gitCommand").val(querys.length>0?querys[++index] :"");     
    		}
      })
      $("#npmName").keydown(function(e) {
        if(e.keyCode === 13) {
          install();
        }
      })
      $("#downloadReg").keydown(function(e) {
        if(e.keyCode === 13) {
          download();
        }
      })
    },
    success : function(data) {
      if(data.active === 0 || data.role > 2) {//如果是观察者
        $("#submitUpload").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
        $("#download").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
        $("#gitAction").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
        $("#npmInstall").click(function() {sAlert("警告", "没有权限进行此操作");
          return false;
        });
        $("#npmName").keydown(function(e) {
          if(e.keyCode === 13) {
            sAlert("警告", "没有权限进行此操作");
          }
        })
        $("#gitAction").keydown(function(e) {
          if(e.keyCode === 13) {
            sAlert("警告", "没有权限进行此操作");
          }
        })
	      $("#downloadReg").keydown(function(e) {
	        if(e.keyCode === 13) {
            sAlert("警告", "没有权限进行此操作")
	        }
	      })
      } else {
        $("#submitUpload").click(upload);
        $("#download").click(download);
        $("#gitAction").click(git);
        $("#npmInstall").click(install);
        $("#gitCommand").keydown(function(e) {
          if(e.keyCode === 13) {
            git();
          }else if(e.keyCode === 38){
        $("#gitCommand").val(querys.length>0?querys[index--] :"");
        if(index<0) index = 0;
    		}else if(e.keyCode === 40){
        if(index+1 === querys.length)
            return;
        $("#gitCommand").val(querys.length>0?querys[++index] :"");     
    		}
        })
        $("#npmName").keydown(function(e) {
          if(e.keyCode === 13) {;
            install();
          }
        })
	      $("#downloadReg").keydown(function(e) {
	        if(e.keyCode === 13) {
	          download();
	        }
	      })        
      }
    }
  });
});

function addnpmTips() {
  var name = $("#npmName"), nameContent = name.val().trim() || '';
  if(nameContent === '') {
    name.val(npmTips);
  }
}

function removenpmTips() {
  var name = $("#npmName");
  if(name.val() === npmTips)
    name.val("");
}

function addregTips() {
  var name = $("#downloadReg"), nameContent = name.val().trim() || '';
  if(nameContent === '') {
    name.val(regTips);
  }
}

function removeregTips() {
  var name = $("#downloadReg");
  if(name.val() === regTips)
    name.val("");
}

function upload() {
  var str = '可能会覆盖之前存在的代码，确定上传吗？';
  if(!confirm(str))
    return false;
  var file = $("#getFile").val();
  if(!file) {
    sAlert("警告", "请选择要上传的文件");
    return false;
  }
  var type = file.slice(file.lastIndexOf('.') + 1);
  if(!(type === 'gz' || type === 'zip')) {
    sAlert("警告", "请上传正确的格式");
    return false;
  }
  $("#uploading").css("display", "block");
}

function download() {
	var reg = $("#downloadReg").val().trim()||'';
	if(reg === regTips) reg = "";
	if(reg&&!validator.verify('files', reg)){
		sAlert("警告", "错误的文件名或通配符");
		return false;
	}
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/download",
    dataType : "json",
    data : {files:reg},
    error : function(err) {
      sAlert("警告", "连接错误，请稍后再试");
    },
    success : function(data) {
      if(data.status === "ok") {
        var a = $("<a href='" + data.url + "' target='_blank'>download</a>").get(0);
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        a.dispatchEvent(e);
      } else {
        sAlert("警告", data.msg);
      }
    }
  })
}

function git() {
  var gitCommand = $("#gitCommand").val().trim() || '';
  if(gitCommand === "") {
    return false;
  }
  if(!validator.verify('gitAction', gitCommand)){
    showGitInfo("git命令有误\n");
    return false;
  }
  index = querys.push(gitCommand)-1;
  $("#gitCommand").val("");
  showGitInfo(gitCommand + '...\n');
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/git",
    dataType : "json",
    data : {
      gitCommand : gitCommand
    },
    error : function(err) {
      showGitInfo("连接错误,请稍后再试。\n");
    },
    success : function(data) {
      if(data.status === "ok") {
        showGitInfo(data.msg + "Done\n");
      } else {
        showGitInfo(data.msg + "Done\n");
      }
    }
  })
}

function install() {
  var npmName = $("#npmName").val() || '';
  showNpmInfo("正在获取中，请稍后...");
  $.ajax({
    cache : false,
    type : "post",
    url : "/application/manage/" + domain + "/npminstall",
    dataType : "json",
    data : {
      npmName : npmName
    },
    error : function(err) {
      showNpmInfo("连接错误,请稍后再试。");
    },
    success : function(data) {
      if(data.status === "ok") {
        showNpmInfo("模块安装成功!\n" + data.msg);
      } else {
        showNpmInfo("发现错误！\n" + data.msg);
      }
    }
  })
}

showGitInfo = function(msg) {
  msg = htmlSpecial(msg);
  if(hasGitInfo) {
    $("#gitInfo").html($("#gitInfo").html()+msg);
  } else {
    hasGitInfo = true;
    var info = $('<pre id="gitInfo" class="borderRadius5 std-style"></pre>');
    info.html(info.html()+msg);
    info.insertAfter($("#gitAction-p"));
  }
  var opt = document.getElementById("gitInfo");
  opt.scrollTop = opt.scrollHeight;
  $("#queryString").val("");    
}
showNpmInfo = function(msg) {
  msg = htmlSpecial(msg);
  if(hasNpmInfo) {
    $("#npmInfo").html(msg);
  } else {
    hasNpmInfo = true;
    var info = $('<pre id="npmInfo" class="borderRadius5 std-style" style="background-color:#000"></pre>');
    info.html(msg);
    info.insertAfter($("#npm-p"));
  }
}
