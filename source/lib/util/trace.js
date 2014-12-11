
function log(message) {
    console.log((new Date()).toISOString() + ":" + message);
}

var Trace = {
    info : function (message) {
        if (this.level <= Trace.INFO) {
            log(message);
        }
    }
};

Trace.DEBUG = 0;
Trace.INFO = 1;
Trace.WARN = 2;
Trace.ERROR = 3;
Trace.level = 0;

exports.Trace = Trace;