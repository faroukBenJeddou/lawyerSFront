import {User} from "./User";

export class Assistant extends User{
  office_address!:string;
  hire_date !:string;
  constructor() {
    super();
  }
}
