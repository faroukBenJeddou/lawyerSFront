import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef, OnInit, ChangeDetectorRef,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import {forkJoin, Subject, switchMap} from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import {ConsultationService} from "../services/Consultation/consultation.service";
import Swal from "sweetalert2";
import {ActivatedRoute} from "@angular/router";
import {Consultation} from "../Models/Consultation";
import {AuthService} from "../services/auth.service";
import {User} from "../Models/User";
import {Client} from "../Models/Client";
import {ClientService} from "../services/ClientService/client.service";
import {Lawyer} from "../Models/Lawyer";
import jwtDecode from "jwt-decode";
import {ConsultationStatus} from "../Models/ConsultationStatus";
import {Requests} from "../Models/Requests";
import {RequestService} from "../services/Request/request.service";
import {HearingsService} from "../services/hearings/hearings.service";
import {Case} from "../Models/Case";
import {LawyerServiceService} from "../services/LawyerService/lawyer-service.service";
import {CaseService} from "../services/CaseService/case.service";
import {Hearing} from "../Models/Hearing";

const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      h3 {
        margin: 0 0 10px;
      }

      pre {
        background-color: #f5f5f5;
        padding: 15px;
      }
    `,
  ],
  templateUrl: 'calendar.component.html',
})
export class CalendarComponent implements OnInit{
  view: CalendarView = CalendarView.Month;
  events !:CalendarEvent[]
  CalendarView = CalendarView;
  event:CalendarEvent={start:new Date(),end: addHours(new Date(), 1),title:"Consultation",color:{...colors['red']} };
  hearing:CalendarEvent={start:new Date(),end: addHours(new Date(), 1),title:"HEARING",color:{...colors['blue']} };
  cases!:Case[]
  viewDate: Date = new Date();
  errorMessage: string | null = null;
  lawyerId!:string
  ClientId!: string
  id!:string;
  client !:Client;
  lawyer !:Lawyer;
  case!:Case;
  isClient: boolean = false;
  token: string | null = localStorage.getItem('authToken'); // Adjust the key name as needed
  userRole: string | null = null;
  caseId!:String

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {},
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
      },
    },
  ];

  refresh = new Subject<void>();
  req!:ConsultationStatus;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      const defaultEvents: CalendarEvent[] = [];
      this.updateEvents(defaultEvents);
      this.getClientOrLawyer(this.id);
      this.getConsultationsForLawyer(this.id)
      this.getHearingsForLawyer(this.id);
    } else {
      console.error('No valid ID provided');
    }
    if (this.token) {
      this.decodeToken();
    } else {
      console.error('No token found in local storage');
    }

  }

  decodeToken() {
    try {
      const decodedToken: any = jwtDecode(this.token!);
      this.userRole = decodedToken.role;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  getClientOrLawyer(id: string) {
    this.clientServ.getClientById(id).subscribe({
      next: (data: Client) => {
        this.client = data;
        if (this.client && this.client.lawyers) {
          this.lawyer = this.client.lawyers;
          this.lawyerId = this.lawyer.id;
          this.isClient = true; // Client is detected
          this.getConsultationsForLawyer(this.lawyer.id);
        } else {
          console.error('Lawyer data is not available in client object');
          this.getLawyerById(id);
        }
      },
      error: (error) => {
        console.error('Error fetching client data:', error);
        this.getLawyerById(id);
      }
    });
  }


  getLawyer() {
    this.clientServ.getClientById(this.ClientId).subscribe({
      next: (data: Client) => {
        this.client = data;
        this.lawyer = this.client.lawyers; // Assuming client has a `lawyer` property
        this.lawyerId = this.lawyer.id; // Assign lawyer's ID to lawyerId
        this.getConsultationsForLawyer(this.lawyer.id);
      },
      error: (error) => {
        this.errorMessage = 'Error fetching client or lawyer data';
        console.error('Error fetching client or lawyer:', error);
      },
    });
  }

  getConsultationsForLawyer(lawyerId: string) {
    console.log('Fetching consultations for Lawyer ID:', lawyerId);

    if (lawyerId) {
      this.consultationServ.getConsultationsForLawyer(lawyerId).subscribe({
        next: (data: CalendarEvent[]) => {
          this.events = data.map(event => ({
            ...event,
            start: new Date(event.start),
            end: addHours(new Date(event.start), 1),
            color: { ...colors['red'] }
          }));

          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Error fetching consultations';
          console.error('Error fetching consultations:', error);
        }
      });
    } else {
      console.error('No valid lawyer ID provided');
    }
  }


  getHearingsForLawyer(lawyerId: string) {
    console.log('Fetching hearings for Lawyer ID:', lawyerId);

    if (lawyerId) {
      this.caseServ.getCasesForLawyer(lawyerId).subscribe({
        next: (cases: Case[]) => {
          if (Array.isArray(cases)) {
            const hearingsObservables = cases.map(caseItem =>
              this.hearingServ.getHearingsForCase(caseItem.caseId)
            );

            forkJoin(hearingsObservables).subscribe({
              next: (hearingsList: (CalendarEvent[] | null)[]) => {
                // Flatten and format hearings
                const hearings: CalendarEvent[] = hearingsList
                  .flat()
                  .map((event: any) => ({
                    ...event,
                    start: new Date(event.start),
                    end: event.end ? new Date(event.end) : addHours(new Date(event.start), 1),
                    color: event.color || { primary: '#1e90ff', secondary: '#D1E8FF' }, // Default color
                    title: event.title || 'Untitled Event', // Default title
                  }));

                // Append hearings to existing events
                this.events = [...this.events, ...hearings]; // Merge existing events and new hearings
                this.changeDetectorRef.detectChanges(); // Ensure changes are detected
                console.log('Hearings loaded:', hearings);
              },
              error: (error) => {
                this.errorMessage = 'Error fetching hearings';
                console.error('Error fetching hearings:', error);
              }
            });
          } else {
            console.warn('No cases found for the lawyer');
          }
        },
        error: (error) => {
          this.errorMessage = 'Error fetching cases';
          console.error('Error fetching cases:', error);
        }
      });
    } else {
      console.error('No valid lawyer ID provided');
    }
  }
  getLawyerById(id: string) {
    // Implement method to fetch lawyer directly if necessary
    this.clientServ.getLawyers(id).subscribe({
      next: (data: Lawyer) => {
        this.lawyer = data;
        this.getConsultationsForLawyer(this.lawyer.id);
      },
      error: (error) => {
        this.errorMessage = '';
        console.error('Error fetching lawyer data:', error);
      }
    });
  }
getAllConsultations(){
  this.consultationServ.getAll().subscribe({
    next: (events:CalendarEvent[]) => {
      this.events=events;
      this.events=this.events.map(event=>event={ start:new Date(event.start),end: addHours(new Date(event.start), 1),title:event.title,color:{...colors['red']} })
      console.log(events)
      this.changeDetectorRef.detectChanges();
    }})
}

  // events: CalendarEvent[] = [
  //   {
  //     start: subDays(startOfDay(new Date()), 1),
  //     end: addDays(new Date(), 1),
  //     title: 'A 3 day event',
  //     color: { ...colors['red'] },
  //     actions: this.actions,
  //     allDay: true,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true,
  //     },
  //     draggable: true,
  //   },
  //   {
  //     start: startOfDay(new Date()),
  //     title: 'An event with no end date',
  //     color: { ...colors['yellow'] },
  //     actions: this.actions,
  //   },
  //   {
  //     start: subDays(endOfMonth(new Date()), 3),
  //     end: addDays(endOfMonth(new Date()), 3),
  //     title: 'A long event that spans 2 months',
  //     color: { ...colors['blue'] },
  //     allDay: true,
  //   },
  //   {
  //     start: addHours(startOfDay(new Date()), 2),
  //     end: addHours(new Date(), 2),
  //     title: 'A draggable and resizable event',
  //     color: { ...colors['yellow'] },
  //     actions: this.actions,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true,
  //     },
  //     draggable: true,
  //   },
  // ];

  activeDayIsOpen: boolean = true;

  constructor(private modal: NgbModal,private consultationServ:ConsultationService,private changeDetectorRef: ChangeDetectorRef,private route:ActivatedRoute,
              private authService:AuthService,private clientServ:ClientService,private requestServ:RequestService,private hearingServ:HearingsService
  ,private lawyerServ:LawyerServiceService,private caseServ:CaseService) {
    this.id = this.route.snapshot.paramMap.get('id') || this.client.lawyers.id;

  }



  // addConsultation() {
  //   const utcStart = new Date(this.event.start).toISOString();
  //   const utcEnd = addHours(new Date(this.event.start), 1).toISOString();
  //
  //   this.consultationServ.createConsultation({
  //     start: utcStart,
  //     end: utcEnd,
  //     title: this.event.title
  //   }).subscribe({
  //     next: (response: { idConsultation: string }) => {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Consultation added successfully!',
  //         showConfirmButton: false,
  //         timer: 1500
  //       });
  //
  //       const consultationId = response.idConsultation;
  //
  //       if (consultationId) {
  //         this.consultationServ.assignConsultationToLawyer(consultationId, this.lawyerId).subscribe({
  //           next: () => {
  //             console.log('Consultation assigned to lawyer successfully');
  //             this.getAllConsultations(); // Reload consultations
  //           },
  //           error: (error: any) => {
  //             Swal.fire({
  //               icon: 'error',
  //               title: 'Error assigning consultation to lawyer',
  //               text: 'Please try again.',
  //             });
  //             console.error('Error assigning consultation:', error);
  //           }
  //         });
  //       } else {
  //         console.error('Invalid consultation ID');
  //       }
  //     },
  //     error: (error: any) => {
  //       if (error.error.message === 'A consultation is already scheduled within this hour.') {
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Time Conflict',
  //           text: 'A consultation is already scheduled within this hour. Please choose a different time.',
  //         });
  //       } else {
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'An unexpected error occurred',
  //           text: 'Please try again.',
  //         });
  //         console.error('Error occurred:', error);
  //       }
  //     }
  //   });
  // }


  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
                      event,
                      newStart,
                      newEnd,
                    }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors['red'],
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }
  updateEvents(newEvents: CalendarEvent[]) {
    this.events = newEvents;
    this.changeDetectorRef.detectChanges();
  }
  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
  createRequest() {
    console.log('Lawyer:', this.lawyer);
    console.log('Client:', this.client);
    console.log('Event:', this.event);

    if (!this.lawyer || !this.lawyer.id) {
      console.error('Lawyer is undefined or missing id');
      Swal.fire({
        icon: 'error',
        title: 'Missing Lawyer',
        text: 'No lawyer is selected. Please try again.',
      });
      return;
    }

    if (!this.client || !this.client.id) {
      console.error('Client is undefined or missing id');
      Swal.fire({
        icon: 'error',
        title: 'Missing Client',
        text: 'No client is selected. Please try again.',
      });
      return;
    }

    if (!this.event || !this.event.start) {
      console.error('Event is undefined or missing start date');
      Swal.fire({
        icon: 'error',
        title: 'Invalid Event',
        text: 'Event details are missing. Please try again.',
      });
      return;
    }

    const utcStart = new Date(this.event.start).toISOString();
    const utcEnd = addHours(new Date(this.event.start), 1).toISOString();

    const request: Requests = {
      start: utcStart,
      end: utcEnd,
      title: this.event.title,
      lawyer: { id: this.lawyer.id },
      client: { id: this.client.id },
      status: ConsultationStatus.PENDING,
      isRead: false,
      isNotification: true
    };

    this.requestServ.createRequest(request, this.client.id, this.lawyer.id).subscribe({
      next: (response: Requests) => {
        Swal.fire({
          icon: 'success',
          title: 'Request sent successfully!',
          showConfirmButton: false,
          timer: 1500
        });
        this.getConsultationsForLawyer(this.lawyer.id);
      },
      error: (error: any) => {
        if (error.error.message === 'A request is already scheduled within this hour.') {
          Swal.fire({
            icon: 'error',
            title: 'Time Conflict',
            text: 'A request is already scheduled within this hour. Please choose a different time.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'An unexpected error occurred',
            text: 'Please try again.',
          });
          console.error('Error occurred:', error);
        }
      }
    });
  }

getCase(clientId:string,lawyerId:string){
  this.caseServ.getCaseByCL(clientId, lawyerId).subscribe({
    next: (data: Case) => {
      console.log('Fetched case data:', data);
      if (data && data.caseId) {
        this.case = data;
        this.caseId = data.caseId;
      } else {
        console.error('Case data or caseId is null:', data);
      }
    },
    error: (error) => {
      this.errorMessage = '';
      console.error('Error fetching case data:', error);
    }
  });

}

}
