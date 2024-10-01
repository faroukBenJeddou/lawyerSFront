import {Role} from "./Role";

export class User{
  id !: string;
  firstName !:string;
  familyName !:string;
  phoneNumber !:string;
  email !:string;
  password !:string;
  photo !:string;
  image !:string;
  birthdate !:string;
  role!: {
    role: string;
  };
}
