import {Client} from "./Client";
import {Lawyer} from "./Lawyer";
import {ConsultationStatus} from "./ConsultationStatus";
import {Requests} from "./Requests";

export class Consultation{
  idConsultation !:string;
  start !:Date;
  end !:Date;
  title !:string;
  client !:Client;
  lawyer !:Lawyer;
  description !:string;
  status !:ConsultationStatus;
  requests !: Requests[];
}
