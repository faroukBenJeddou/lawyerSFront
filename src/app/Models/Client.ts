import {User} from "./User";
import {Gender} from "./Gender";
import {Lawyer} from "./Lawyer";
import {Case} from "./Case";
import {Consultation} from "./Consultation";

export class Client extends User{
  constructor() {
    super();
  }
  adress!: string; // Ensure spelling matches
  gender !: Gender;
  job!: string;
  lawyers!: Lawyer[];
  cases!: Case[];
  consultations!:Consultation[];
  creationDate!:Date;
}
