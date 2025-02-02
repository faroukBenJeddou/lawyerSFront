import {ConsultationStatus} from "./ConsultationStatus";
import {Lawyer} from "./Lawyer";
import {Client} from "./Client";
import {Consultation} from "./Consultation";

export class Requests {
  id?: string; // Optional, for when the request is created and has an ID
  start!: string; // ISO Date string for start time
  end!: string; // ISO Date string for end time
  title!: string;

  lawyer: {
    id: string;
  };
  client: {
    id: string;
  };
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
    accepted: boolean,
  consultation:Consultation[]
  ) {
    this.start = start;
    this.end = end;
    this.title = title;
    this.status = status;
    this.lawyer = lawyer;
    this.client = client;

  }
}
