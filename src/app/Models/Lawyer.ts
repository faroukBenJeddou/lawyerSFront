import {User} from "./User";
import {Client} from "./Client";
import {Case} from "./Case";
import {Consultation} from "./Consultation";

export class Lawyer extends User{
  office_adress !:string;
  info !:string;
  clients !: Client[]; // Added list of clients
  cases !: Case[];
  consultation !:Consultation;
  constructor() {
    super();
  }

}
