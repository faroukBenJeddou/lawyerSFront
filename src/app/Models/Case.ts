import {CaseType} from "./CaseType";
import {CaseStatus} from "./CaseStatus";
import {Client} from "./Client";
import {Lawyer} from "./Lawyer";
import {Documents} from "./Documents";
import {Hearing} from "./Hearing";
import {Invoice} from "./Invoice";


export class Case{
  caseId  !:string;
  caseType !:CaseType;
  description !:string;
  caseStatus !: CaseStatus;
  start !: string;
  endDate !: string;
  client?: Client; // Optional, ensure this field exists
  lawyer !:Lawyer;
  documents !: Documents[];
  hearings !:Hearing[];
  invoice !:Invoice;
}
