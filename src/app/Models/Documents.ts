export class Documents{
  id !:string;
  title!: string;
  fileName!: string;
  fileType!: string;
  fileData!: Blob; // Store binary data
  uploadTime !: string;
  constructor(title: string, fileName: string, fileType: string, fileData: Blob, uploadTime: string) {
    this.title = title;
    this.fileName = fileName;
    this.fileType = fileType;
    this.fileData = fileData;
    this.uploadTime = uploadTime;
  }
}
