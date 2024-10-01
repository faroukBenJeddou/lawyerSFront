export class Hearing{
  hearingId!:string;
  title:string;
  start !:Date;
  end!:Date;
  constructor( title: string, start: Date) {
    this.title = title;
    this.start = start;

  }
}
