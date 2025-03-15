import {Lawyer} from "./Lawyer";
import {Client} from "./Client";

export class Rating {
id !: string;
rateValue !: number;
ratedAt !: string;
client !: Client;
lawyer !:Lawyer;


}
