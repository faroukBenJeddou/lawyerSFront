import {ConsultationStatus} from "./ConsultationStatus";
import {Lawyer} from "./Lawyer";
import {Client} from "./Client";
import {Consultation} from "./Consultation";

export class Requests {
  id?: string; // Optional, for when the request is created and has an ID
  start!: string; // ISO Date string for start time
  end!: string; // ISO Date string for end time
  title!: string;
  creationDate!: Date;
  lawyer: {
    id: string;
    image?: string; // Optional, add image property

  };
  client: {
    id: string;
  };
  assistantJ?: { id: string };  // Make 'assistant' optional

  status!: ConsultationStatus;
  isRead!: boolean;
  isNotification!: boolean;
  consultations?: Consultation[]; // Make this optional
  constructor(
    start: string,
    end: string,
    title: string,
    status: ConsultationStatus,
    lawyer: Lawyer,
    client: Client,
    creationDate:Date,
    accepted: boolean,

  consultation:Consultation[]
  ) {
    this.start = start;
    this.end = end;
    this.title = title;
    this.status = status;
    this.lawyer = lawyer;
    this.client = client;
    this.creationDate = creationDate;
  }
}
