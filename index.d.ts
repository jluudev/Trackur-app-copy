declare module "exif-js" {
  interface EXIFStatic {
    getData(url: string | File, callback: Function): any;
    getTag(img: any, tag: any): any;
    getAllTags(img: any): any;
    pretty(img: any): string;
    readFromBinaryFile(file: any): any;
  }

  declare var EXIF : EXIFStatic;
  export = EXIF;
}