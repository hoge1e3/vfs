//define(["FSClass","jquery.binarytransport","DeferredUtil","Content","PathUtil"],
//        function (FS,j,DU,Content,P) {
// FS.mount(location.protocol+"//"+location.host+"/", "web");
import FS from "./FSClass.js";
import "./jquery.binarytransport.js";
import DU from "./DeferredUtil.js";
import Content from "./Content.js";
import P from "./PathUtil.js";
var WebFS = function () { };
var p = WebFS.prototype = new FS();
FS.addFSType("web", function () {
    return new WebFS();
});
p.fstype = function () { return "Web"; };
p.supportsSync = function () { return false; };
p.inMyFS = function (path) {
    return P.isURL(path);
};
FS.delegateMethods(p, {
    exists: function () { return true; },
    getContentAsync: function (path) {
        var t = this;
        return DU.promise(function (succ, err) {
            $.get(path, function (blob) {
                var reader = new FileReader();
                reader.addEventListener("loadend", function () {
                    succ(Content.bin(reader.result, t.getContentType(path)));
                });
                reader.readAsArrayBuffer(blob);
            }, "binary").fail(err);
        });
    },
    /*setContentAsync: function (path){

    },*/
    getURL: function (path) {
        return path;
    }
});

export default WebFS;

//});
