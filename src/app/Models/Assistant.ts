import {User} from "./User";

export class Assistant extends User{
  office_adress !:string;
  hire_date !:string;
  constructor() {
    super();
  }
}
