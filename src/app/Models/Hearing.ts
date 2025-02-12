export class Hearing{
  hearingId!:string;
  title:string;
  start !:string;
  end!:string;
  constructor( title: string, start: string) {
    this.title = title;
    this.start = start;

  }
}
