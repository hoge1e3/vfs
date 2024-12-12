//define(["SFile",/*"jszip",*/"FileSaver","Util","DeferredUtil"],
//function (SFile,/*JSZip,*/fsv,Util,DU) {
import SFile from "./SFile.js";
import JSZip from "jszip";
import DU from "./DeferredUtil.js";
import Content from "./Content.js";
import saveAs from "file-saver";
var zip = {};
zip.setJSZip = function (JSZip) {
    zip.JSZip = JSZip;
    if (!DU.external.Promise) {
        DU.external.Promise = JSZip.external.Promise;
    }
};
if (typeof JSZip !== "undefined") zip.setJSZip(JSZip);
zip.zip = function (dir, dstZip, options) {
    if (!SFile.is(dstZip)) options = dstZip;
    options = options || {};
    var jszip = new zip.JSZip();
    function getTimestamp(f) {
        return new Date(f.lastUpdate() - new Date().getTimezoneOffset() * 60 * 1000);
    }
    function loop(dst, dir) {
        return dir.each(function (f) {
            var r = DU.resolve();
            if (options.progress) {
                r = options.progress(f);
            }
            return r.then(function () {
                if (f.isDir()) {
                    var sf = dst.folder(f.name().replace(/[\/\\]$/, ""), {
                        date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)
                    });
                    return loop(sf, f);
                } else {
                    return f.getContent(function (c) {
                        dst.file(f.name(), c.toArrayBuffer(), {
                            date: getTimestamp(f)
                        });
                    });
                }
            });
        }, options);
    }
    return loop(jszip, dir).then(function () {
        return DU.resolve(jszip.generateAsync({
            type: "arraybuffer",
            compression: "DEFLATE"
        }));
    }).then(function (content) {
        //console.log("zip.con",content);
        if (SFile.is(dstZip)) {
            if (dstZip.isDir()) {
                throw new Error(`zip: destination zip file ${dstZip.path()} is a directory.`);
            }
            return dstZip.setBytes(content);
        } else {
            saveAs(
                new Blob([content], { type: "application/zip" }),
                dir.name().replace(/[\/\\]$/, "") + ".zip"
            );
        }
    });
};
zip.unzip = async function (arrayBuf, destDir, options) {
    var c;
    var status = {};
    options = options || {};
    if (SFile.is(arrayBuf)) {
        c = arrayBuf.getContent();
        arrayBuf = c.toArrayBuffer();
    }
    if (!options.onCheckFile) {
        options.onCheckFile = function (f) {
            if (options.overwrite) {
                return f;
            } else {
                if (f.exists()) {
                    return false;
                }
                return f;
            }
        };
    }
    var jszip = new zip.JSZip();
    await jszip.loadAsync(arrayBuf);
    for (let key of Object.keys(jszip.files)) {
        const zipEntry = jszip.files[key];
        const buf = await zipEntry.async("arraybuffer");
        let dest = destDir.rel(zipEntry.name);
        if (options.progress) {
            await options.progress(dest);
        }
        if (options.v) {
            console.log("Inflating", zipEntry.name, zipEntry);
        }
        if (dest.isDir()) continue;
        const s = {
            file: dest,
            status: "uploaded"
        };
        status[dest.path()] = s;
        const c = Content.bin(buf, dest.contentType());
        const res = options.onCheckFile(dest, c);
        if (res === false) {
            s.status = "cancelled";
            dest = null;
        }
        if (SFile.is(res)) {
            if (dest.path() !== res.path()) s.redirectedTo = res;
            dest = res;
        }
        if (dest) {
            dest.setContent(c);
            dest.setMetaInfo({ lastUpdate: zipEntry.date.getTime() + new Date().getTimezoneOffset() * 60 * 1000 });
        }
    }
    console.log("unzip done", status);
    return status;
};
export default zip;

