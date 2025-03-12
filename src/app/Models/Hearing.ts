import {CourtDecision} from "./CourtDecison";

export class Hearing{
  hearingId!:string;
  title:string;
  start !:string;
  courtDecision !:CourtDecision;
  end!:string;
  constructor( title: string, start: string) {
    this.title = title;
    this.start = start;

  }
}
