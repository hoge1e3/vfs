//import * as ts from "./_namespaces/ts.js";
import * as vfs from "./vfsUtil";
import * as ts from "./core";
import * as path from "./path";
export const sep = "/";//ts.directorySeparator;
export import normalizeSeparators = path.normalizeSlashes;
export import isAbsolute = path.isRootedDiskPath;
export import isRoot = path.isDiskPathRoot;
export import hasTrailingSeparator = path.hasTrailingDirectorySeparator;
export import addTrailingSeparator = path.ensureTrailingDirectorySeparator;
export import removeTrailingSeparator = path.removeTrailingDirectorySeparator;
export import normalize = path.normalizePath;
export import combine = path.combinePaths;
export import parse = path.getPathComponents;
export import reduce = path.reducePathComponents;
export import format = path.getPathFromPathComponents;
export import resolve = path.resolvePath;
export import compare = path.comparePaths;
export import compareCaseSensitive = ts.comparePathsCaseSensitive;
export import compareCaseInsensitive = ts.comparePathsCaseInsensitive;
export import dirname = path.getDirectoryPath;
export import basename = path.getBaseFileName;
export import extname = path.getAnyExtensionFromPath;
export import relative = path.getRelativePathFromDirectory;
export import beneath = path.containsPath;
export import changeExtension = path.changeAnyExtension;
/*export import isTypeScript = ts.hasTSFileExtension;
export import isJavaScript = ts.hasJSFileExtension;*/

const invalidRootComponentRegExp = /^(?!(?:\/|\/\/\w+\/|[a-z]:\/?)?$)/i;
const invalidNavigableComponentRegExp = /[:*?"<>|]/;
const invalidNavigableComponentWithWildcardsRegExp = /[:"<>|]/;
const invalidNonNavigableComponentRegExp = /^\.{1,2}$|[:*?"<>|]/;
const invalidNonNavigableComponentWithWildcardsRegExp = /^\.{1,2}$|[:"<>|]/;
const extRegExp = /\.\w+$/;

export const enum ValidationFlags {
    None = 0,

    RequireRoot = 1 << 0,
    RequireDirname = 1 << 1,
    RequireBasename = 1 << 2,
    RequireExtname = 1 << 3,
    RequireTrailingSeparator = 1 << 4,

    AllowRoot = 1 << 5,
    AllowDirname = 1 << 6,
    AllowBasename = 1 << 7,
    AllowExtname = 1 << 8,
    AllowTrailingSeparator = 1 << 9,
    AllowNavigation = 1 << 10,
    AllowWildcard = 1 << 11,

    /** Path must be a valid directory root */
    Root = RequireRoot | AllowRoot | AllowTrailingSeparator,

    /** Path must be a absolute */
    Absolute = RequireRoot | AllowRoot | AllowDirname | AllowBasename | AllowExtname | AllowTrailingSeparator | AllowNavigation,

    /** Path may be relative or absolute */
    RelativeOrAbsolute = AllowRoot | AllowDirname | AllowBasename | AllowExtname | AllowTrailingSeparator | AllowNavigation,

    /** Path may only be a filename */
    Basename = RequireBasename | AllowExtname,
}

function validateComponents(components: string[], flags: ValidationFlags, hasTrailingSeparator: boolean) {
    const hasRoot = !!components[0];
    const hasDirname = components.length > 2;
    const hasBasename = components.length > 1;
    const hasExtname = hasBasename && extRegExp.test(components[components.length - 1]);
    const invalidComponentRegExp = flags & ValidationFlags.AllowNavigation
        ? flags & ValidationFlags.AllowWildcard ? invalidNavigableComponentWithWildcardsRegExp : invalidNavigableComponentRegExp
        : flags & ValidationFlags.AllowWildcard ? invalidNonNavigableComponentWithWildcardsRegExp : invalidNonNavigableComponentRegExp;

    // Validate required components
    if (flags & ValidationFlags.RequireRoot && !hasRoot) return false;
    if (flags & ValidationFlags.RequireDirname && !hasDirname) return false;
    if (flags & ValidationFlags.RequireBasename && !hasBasename) return false;
    if (flags & ValidationFlags.RequireExtname && !hasExtname) return false;
    if (flags & ValidationFlags.RequireTrailingSeparator && !hasTrailingSeparator) return false;

    // Required components indicate allowed components
    if (flags & ValidationFlags.RequireRoot) flags |= ValidationFlags.AllowRoot;
    if (flags & ValidationFlags.RequireDirname) flags |= ValidationFlags.AllowDirname;
    if (flags & ValidationFlags.RequireBasename) flags |= ValidationFlags.AllowBasename;
    if (flags & ValidationFlags.RequireExtname) flags |= ValidationFlags.AllowExtname;
    if (flags & ValidationFlags.RequireTrailingSeparator) flags |= ValidationFlags.AllowTrailingSeparator;

    // Validate disallowed components
    if (~flags & ValidationFlags.AllowRoot && hasRoot) return false;
    if (~flags & ValidationFlags.AllowDirname && hasDirname) return false;
    if (~flags & ValidationFlags.AllowBasename && hasBasename) return false;
    if (~flags & ValidationFlags.AllowExtname && hasExtname) return false;
    if (~flags & ValidationFlags.AllowTrailingSeparator && hasTrailingSeparator) return false;

    // Validate component strings
    if (invalidRootComponentRegExp.test(components[0])) return false;
    for (let i = 1; i < components.length; i++) {
        if (invalidComponentRegExp.test(components[i])) return false;
    }

    return true;
}

export function validate(path: string, flags: ValidationFlags = ValidationFlags.RelativeOrAbsolute): string {
    const components = parse(path);
    const trailing = hasTrailingSeparator(path);
    if (!validateComponents(components, flags, trailing)) throw vfs.createIOError("ENOENT");
    return components.length > 1 && trailing ? format(reduce(components)) + sep : format(reduce(components));
}
/*
export function isDeclaration(path: string): boolean {
    return ts.isDeclarationFileName(path);
}*/

export function isSourceMap(path: string): boolean {
    return extname(path, ".map", /*ignoreCase*/ false).length > 0;
}

const javaScriptSourceMapExtensions: readonly string[] = [".js.map", ".jsx.map"];

export function isJavaScriptSourceMap(path: string): boolean {
    return extname(path, javaScriptSourceMapExtensions, /*ignoreCase*/ false).length > 0;
}

export function isJson(path: string): boolean {
    return extname(path, ".json", /*ignoreCase*/ false).length > 0;
}
/*
export function isDefaultLibrary(path: string): boolean {
    return isDeclaration(path)
        && basename(path).startsWith("lib.");
}*/

export function isTsConfigFile(path: string): boolean {
    return path.includes("tsconfig") && path.includes("json");
}
