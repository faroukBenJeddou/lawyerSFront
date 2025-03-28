import {User} from "./User";
import {Client} from "./Client";
import {Case} from "./Case";
import {Consultation} from "./Consultation";
import {CaseType} from "./CaseType";
import {Rating} from "./Rating";

export class Lawyer extends User{
  office_adress !:string;
  info !:string;
  clients !: Client[];
  permission !:boolean;
  cases !: Case[];
  speciality !:CaseType;
  consultation !:Consultation;
  ratings !:Rating[];
  selectedRatings: { [lawyerId: string]: number } = {}; // Store selected stars

  constructor() {
    super();
  }

}
