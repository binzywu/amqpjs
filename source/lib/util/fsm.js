// https://gist.github.com/podefr/1312642, simple, yet good enough.
exports.fsm = function(a,b){return{event:function(c,d){return(c=b[a][c])&&((c[0][0]||c[0]).call(c[0][1],d),a=c[1]||a)}}};