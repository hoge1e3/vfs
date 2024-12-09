import {FileSystem} from "../dist/index.js";

const fs=new FileSystem(false, {
    files: {
        "/test.ts": `let x:number=123;`
    }
});
const r=fs.readFileSync("/test.ts","utf-8");
console.log(r);
