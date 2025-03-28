import {User} from "./User";
import {Lawyer} from "./Lawyer";

export class Assistant extends User{
  office_address!:string;
  hire_date !:string;
  info !:string;
  lawyer!:Lawyer;
  constructor() {
    super();
  }
}
