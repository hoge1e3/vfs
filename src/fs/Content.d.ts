export type ContentBuffer=Buffer|ArrayBuffer;

export default class Content {
    static plainText(text:string, contentType?:string):Content;
    static url(url:string):Content;
    static bin(bin:ContentBuffer):Content;
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
