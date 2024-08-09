import {CaseType} from "./CaseType";
import {CaseStatus} from "./CaseStatus";


export class Case{
  caseId  !:string;
  caseType !:CaseType;
  description !:string;
  caseStatus !: CaseStatus;
  creationDate !: string;
  endDate !: string;

}
