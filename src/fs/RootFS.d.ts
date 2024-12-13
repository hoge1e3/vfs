import {default as FileSystem, MetaInfo} from "./FSClass";
type FSTab={fs:FileSystem, mountPoint:string};
type FSGenerator=(path:string)=>FileSystem;
export type FSTypeName=string;
export type ObserverHandler=(path:string, metaInfo:MetaInfo)=>void;
export type Observer={
    path:string,
    handler: ObserverHandler,
    remove():void, 
};
export default class RootFS {
    constructor(defaultFS: FileSystem);
    fstab(): FSTab[];
    umount(path:string):void;
    mount(path:string, fs:FileSystem|FSTypeName):void;
    resolveFS(path:string):FileSystem;
    addObserver(path:string, handler: ObserverHandler):Observer;
    notifyChanged(path:string, metaInfo:MetaInfo):void;
}
