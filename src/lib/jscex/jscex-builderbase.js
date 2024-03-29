(function () {

    var Loop = function (condition, update, body, bodyFirst) {
        return {
            next: function (_this, callback) {
                
                var nextBody = function (skipUpdate) {
                    body.next(_this, function (type, value, target) {
                        if (type == "normal" || type == "continue") {
                            loop(skipUpdate);
                        } else if (type == "throw" || type == "return") {
                            callback(type, value);
                        } else if (type == "break") {
                            callback("normal");
                        } else {
                            throw new Error('Invalid type for "Loop": ' + type);
                        }
                    });
                }
            
                var loop = function (skipUpdate) {
                    try {
                        if (update && !skipUpdate) {
                            update.call(_this);
                        }

                        if (!condition || condition.call(_this)) {
                            nextBody(false);
                        } else {
                            callback("normal");
                        }

                    } catch (ex) {
                        callback("throw", ex);
                    }
                }
                
                if (bodyFirst) {
                    nextBody(true);
                } else {
                    loop(true);
                }
            }
        };
    };
    
    var Delay = function (generator) {
        return {
            next: function (_this, callback) {
                try {
                    var step = generator.call(_this);
                    step.next(_this, callback);
                } catch (ex) {
                    callback("throw", ex);
                }
            }
        };
    };

    var Combine = function (s1, s2) {
        return {
            next: function (_this, callback) {
                s1.next(_this, function (type, value, target) {
                    if (type == "normal") {
                        try {
                            s2.next(_this, callback);
                        } catch (ex) {
                            callback("throw", ex);
                        }
                    } else {
                        callback(type, value, target);
                    }
                });
            }
        };
    };

    var Return = function (result) {
        return {
            next: function (_this, callback) {
                callback("return", result);
            }
        };
    };

    var Normal = function () {
        return {
            next: function (_this, callback) {
                callback("normal");
            }
        };
    };

    var Break = function () {
        return {
            next: function (_this, callback) {
                callback("break");
            }
        };
    };

    var Continue = function () {
        return {
            next: function (_this, callback) {
                callback("continue");
            }
        };
    };

    var Throw = function (ex) {
        return {
            next: function (_this, callback) {
                callback("throw", ex);
            }
        };
    };

    var Try = function (tryTask, catchGenerator, finallyTask) {
        return {
            next: function (_this, callback) {
                tryTask.next(_this, function (type, value, target) {
                    if (type != "throw" || !catchGenerator) {
                        if (!finallyTask) {
                            callback(type, value, target);
                        } else {
                            finallyTask.next(_this, function (finallyType, finallyValue, finallyTarget) {
                                if (finallyType == "normal") {
                                    callback(type, value, target);
                                } else {
                                    callback(finallyType, finallyValue, finallyTarget);
                                }
                            });
                        }
                    } else {

                        if (catchGenerator) {

                            var catchTask;
                            try {
                                catchTask = catchGenerator.call(_this, value);
                            } catch (ex) {
                                if (finallyTask) {
                                    finallyTask.next(_this, function (finallyType, finallyValue, finallyTarget) {
                                        if (finallyType == "normal") {
                                            callback("throw", ex);
                                        } else {
                                            callback(finallyType, finallyValue, finallyTarget);
                                        }
                                    });
                                } else {
                                    callback("throw", ex);
                                }
                            }
                            
                            if (catchTask) {
                                catchTask.next(_this, function (catchType, catchValue, catchTarget) {
                                    if (catchType == "throw") {
                                        if (finallyTask) {
                                            finallyTask.next(_this, function (finallyType, finallyValue, finallyTarget) {
                                                if (finallyType == "normal") {
                                                    callback(catchType, catchValue, catchTarget);
                                                } else {
                                                    callback(finallyType, finallyValue, finallyTarget);
                                                }
                                            });
                                        } else {
                                            callback(catchType, catchValue, catchTarget);
                                        }
                                    } else {
                                        if (finallyTask) {
                                            finallyTask.next(_this, function (finallyType, finallyValue, finallyTarget) {
                                                if (finallyType == "normal") {
                                                    callback(catchType, catchValue, catchTarget);
                                                } else {
                                                    callback(finallyType, finallyValue, finallyTarget);
                                                }
                                            });
                                        } else {
                                            callback(catchType, catchValue, catchTarget);
                                        }
                                    }  
                                });
                            }
                        } else {
                            finallyTask.next(_this, function (finallyType, finallyValue, finallyTarget) {
                                if (finallyType == "normal") {
                                    callback(type, value, target);
                                } else {
                                    callback(finallyType, finallyValue, finallyTarget);
                                }
                            });
                        }
                    }
                });
            }
        };
    }
    
    var standardizeBuilder = function (builder) {
        builder.Loop = Loop;
        builder.Delay = Delay;
        builder.Combine = Combine;
        builder.Return = Return;
        builder.Normal = Normal;
        builder.Break = Break;
        builder.Continue = Continue;
        builder.Throw = Throw;
        builder.Try = Try;
    };
    
    var init = function (root) {
        if (!root.modules) {
            root.modules = { };
        }
        
        if (root.modules["builderbase"]) {
            return;
        }
        
        root.modules["builderbase"] = true;
        root.standardizeBuilder = standardizeBuilder;
    }
    
    var isCommonJS = (typeof require !== "undefined" && typeof module !== "undefined" && module.exports);
    
    if (isCommonJS) {
        module.exports.init = init;
    } else {
        if (typeof Jscex == "undefined") {
            /* Defined in global */
            Jscex = { };
        }
        
        init(Jscex);
    }

})();
