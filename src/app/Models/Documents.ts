export class Documents{
  id !:string;
  content :string;
  title :string;
  constructor(title: string, content: string, date: string) {
    this.title = title;
    this.content = content;

  }
}
