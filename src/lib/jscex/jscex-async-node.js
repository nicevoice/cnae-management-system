(function () {

    var collectArgs = function (args, requiredArgs) {
        var result = [];
        for (var i = 0; i < args.length; i++) {
            result.push(args[i]);
        }

        while (result.length < requiredArgs) {
            result.push(null);
        }

        return result;
    }

    exports.getJscexify = function (root) {
        if (!root.Async || !root.Async.Task) {
            throw new Error('Missing essential components, please initialize the "jscex-async" module first.');
        }
        
        var Task = root.Async.Task;

        // for the methods return error or result
        var fromStandard = function (fn, requiredArgs) {
            return function () {
                var _this = this;
                var args = collectArgs(arguments, requiredArgs || 0);

				return Task.create(function (t) {
					args.push(function (error, result) {
					    if (error) {
					        t.complete("failure", error);
					    } else {
					        if(arguments.length>2){
					          result = [result];
					          for(var i=2, len=arguments.length; i!=len; ++i){
					            result.push(arguments[i]);
					          }
					        }
					        t.complete("success", result);
					    }
					});
					
					fn.apply(_this, args);
				});
            };
        };
        
        // for the methods always success
        var fromCallback = function (fn, requiredArgs) {
            return function () {
                var _this = this;
                var args = collectArgs(arguments, requiredArgs || 0);

				return Task.create(function (t) {
					args.push(function (result) {
             if(arguments.length>1){
                result = [result];
                for(var i=2, len=arguments.length; i!=len; ++i){
                  result.push(arguments[i]);
                }
              }					  
					    t.complete("success", result);
					});
					
					fn.apply(_this, args);
				});
            };
        };

        return {
            fromStandard: fromStandard,
            fromCallback: fromCallback
        };
    };

})();
