declare module "@hoge1e3/fs" {
    type ContentBuffer=Buffer|ArrayBuffer;
    export class ContentFactory {
        plainText(text:string, contentType?:string):FileContent;
        url(url:string):FileContent;
        bin(bin:ContentBuffer):FileContent;
    }
    export type TPathUtil={
        SEP: "/"|"\\";

        isChildOf(child:string, parent:string):boolean;
        normalize(path:string):string;
        hasDriveLetter(path:string):boolean;
        isURL(path:string):boolean;
        isPath(path:string):boolean;
        isRelativePath(path:string):boolean;
        isAbsolutePath(path:string):boolean;
        isDir(path:string):boolean;
        hasBackslashSep(path:string):boolean;
        endsWith(path:string):boolean;
        startsWith(path:string):boolean;

        fixSep(path:string):string;
        directorify(path:string):string;
        splitPath(path:string):string[];
        name(path:string):string;
        ext(path:string):string;
        truncExt(path:string, ext?:string):string;
        truncSEP(path:string):string;
        parent(path:string):string;
        up(path:string):string;
        rel(path:string, relPath:string):string;
        relPath(path:string, base:string):string;
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
    type FSTab={fs:FileSystem, mountPoint:string};
    type FSGenerator=(path:string)=>FileSystem;
    export class RootFS {
        constructor(defaultFS: FileSystem);
        fstab(): FSTab[];
        umount(path:string):void;
        mount(path:string, fs:FileSystem|FSTypeName):void;
        resolveFS(path:string):FileSystem;
        get(path:string):SFile;
        addObserver(path:string, handler: ObserverHandler):Observer;
        notifyChanged(path:string, metaInfo:MetaInfo):void;
    }
    export type ObserverHandler=(path:string, metaInfo:MetaInfo)=>void;
    export type Observer={
        path:string,
        handler: ObserverHandler,
        remove():void, 
    };
    type FSTypeName=string;
    export class FileSystem {
        fstype():FSTypeName;
        isReadOnly(path:string):boolean;
        resolveFS(path:string):FileSystem;
        mounted(rootFS:RootFS, mountPoint:string):void;
        inMYFS(path:string):boolean;
        getRootFS():RootFS;
        getContent(path:string):FileContent;
        size(path:string):number;
        setContent(path:string, content:FileContent):void;
        appendContent(path:string, content:FileContent):void;
        getMetaInfo(path:string):MetaInfo;
        setMetaInfo(path:string, info:MetaInfo):void;
        mkdir(path:string):void;
        touch(path:string):void;
        exists(path:string):boolean;
        opendir(path:string):string[];
        cp(path:string, dst:string):void;
        mv(path:string, dst:string):void;
        rm(path:string):void;
        link(path:string, to:string):void;
        getURL(path:string):string;
        onAddObserver(path:string):void;
        isDir(path:string):boolean;
        resolveLink(path:string):string;
    }
    export type MetaInfo={
        lastUpdate:number,
        link: string,
    };
    type SFileGetter = (path:string)=> SFile;
    export type SFile ={
        lastUpdate(): number;
        text(): string,
        up(): SFile,
        rel(path:string): SFile,
        sibling(path:string): SFile,
        exists(): boolean,
        isDir(): boolean,
        path(): string,
        name(): string,
        obj(): Object,
        getBlob(): Blob,
    };
    const def:{
        get:SFileGetter,
    	Content: ContentFactory,
	    getEnv: (name:string)=>(string|undefined);
        addFSType(name:string, fsgen:FSGenerator):void;
        availFSTypes():{[key:string]:FSGenerator};
        getRootFS():RootFS;
        PathUtil: TPathUtil;
        FileSystem: FileSystem;
        
    };
    export const PathUtil: TPathUtil;
    export function getRootFS():RootFS;
    export default def;
    export const get:SFileGetter;
    export const Content:ContentFactory;
    export function getEnv(name:string):string|undefined;
}
