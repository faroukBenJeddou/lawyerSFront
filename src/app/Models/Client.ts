import {User} from "./User";

export class Client extends User{
  constructor() {
    super();
  }
  adress !:string;
  gender !:string;
}
