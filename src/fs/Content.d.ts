type ContentBuffer=Buffer|ArrayBuffer;

export default class ContentFactory {
    plainText(text:string, contentType?:string):FileContent;
    url(url:string):FileContent;
    bin(bin:ContentBuffer):FileContent;
}
export class FileContent {
    toURL():string;
    toBin():ContentBuffer;
    toArrayBuffer():ArrayBuffer;
    toNodeBuffer():Buffer;
    toPlainText():string;
    setBuffer(buffer:ContentBuffer):void;
    hasURL():boolean;
    hasBin():boolean;
    hasArrayBuffer():boolean;
    hasNodeBuffer():boolean;
    hasPlainText():boolean;
    toBlob():Blob;
    download(name:string):void;
}
