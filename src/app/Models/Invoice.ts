export class Invoice{
  invoiceId?:string;
  details: string;  // Ensure this is a non-nullable string
  price: number;       // Ensure this is a non-nullable number
  date: string;         // Ensure this is a non-nullable string
  constructor(details: string, price: number, date: string) {
    this.details = details;
    this.price = price;
    this.date = date;
  }
}
