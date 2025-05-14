import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => {
    app.close();
  });

  const mockEvent = {
    title: 'Pactum Test Event',
    description: 'Testing with pactum',
    date: new Date().toISOString(),
    contact: 'pactum@test.com',
    imageUrl: 'https://example.com/image.jpg',
    totalTickets: 150,
    location: {
      name: 'Pactum Venue',
      address: '456 Pactum Rd',
      city: 'TestCity',
      country: 'TestLand',
      latitude: 52.52,
      longitude: 13.405,
    },
  };

  const ticketEvent = {
    title: 'Ticket Test Event',
    description: 'Event created for ticket tests',
    date: new Date().toISOString(),
    contact: 'tickets@test.com',
    imageUrl: 'https://example.com/ticket-event.jpg',
    totalTickets: 100,
    location: {
      name: 'Ticket Venue',
      address: '1 Ticket Way',
      city: 'TicketCity',
      country: 'TicketLand',
      latitude: 40.7128,
      longitude: -74.006,
    },
  };

  const mockTicket = {
    eventId: '$S{eventId}',
    quantity: 2,
    ownerEmail: 'buyer@test.com',
  };

  describe('Event', () => {
    let eventId: number;

    describe('Create Event', () => {
      it('should create an event', () => {
        return pactum
          .spec()
          .post('/events')
          .withBody(mockEvent)
          .expectStatus(201)
          .stores('eventId', 'id');
      });
    });

    describe('Get All Events', () => {
      it('should return list of events', () => {
        return pactum
          .spec()
          .get('/events')
          .expectStatus(200)
          .expectJsonLike([
            {
              title: mockEvent.title,
              contact: mockEvent.contact,
            },
          ]);
      });
    });

    describe('Get Single Event', () => {
      it('should return a specific event', () => {
        return pactum
          .spec()
          .get('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .expectStatus(200)
          .expectJsonLike({
            id: '$S{eventId}',
            title: mockEvent.title,
          });
      });
    });

    describe('Update Event', () => {
      const updated = {
        title: 'Updated Pactum Event',
        contact: 'updated@email.com',
      };

      it('should update event fields', () => {
        return pactum
          .spec()
          .patch('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .withBody(updated)
          .expectStatus(200)
          .expectBodyContains(updated.title)
          .expectBodyContains(updated.contact);
      });
    });

    describe('Delete Event', () => {
      it('should delete the event', () => {
        return pactum
          .spec()
          .delete('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .expectStatus(200);
      });

      it('should return 404 on getting deleted event', () => {
        return pactum
          .spec()
          .get('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .expectStatus(404);
      });
    });
  });

  describe('Ticket', () => {
    describe('Create prerequisite Event', () => {
      it('should create an event to attach tickets to', () => {
        return pactum
          .spec()
          .post('/events')
          .withBody(ticketEvent)
          .expectStatus(201)
          .stores('eventId', 'id');
      });
    });

    describe('Create Ticket', () => {
      it('should create one ticket', () => {
        return pactum
          .spec()
          .post('/tickets')
          .withBody(mockTicket)
          .expectStatus(201)
          .expectJsonLike({
            quantity: mockTicket.quantity,
            tickets: [
              {
                eventId: '$S{eventId}',
                ownerEmail: mockTicket.ownerEmail,
              },
            ],
          })
          .stores('ticketId', 'tickets[0].id')
          .stores('ticketCode', 'tickets[0].code');
      });
    });

    describe('Get Ticket', () => {
      it('should return the newly created ticket', () => {
        return pactum
          .spec()
          .get('/tickets/{id}')
          .withPathParams('id', '$S{ticketId}')
          .expectStatus(200)
          .expectJsonLike({
            id: '$S{ticketId}',
            eventId: '$S{eventId}',
            ownerEmail: mockTicket.ownerEmail,
          });
      });

      it('should return 404 for a non-existing ticket', () => {
        return pactum.spec().get('/tickets/999999').expectStatus(404);
      });
    });

    describe('Validate Ticket', () => {
      it('should successfully validate the ticket', () => {
        return pactum
          .spec()
          .post('/tickets/validate')
          .withBody({ code: '$S{ticketCode}' })
          .expectStatus(201)
          .expectJsonLike({
            ok: true,
            ticketId: '$S{ticketId}',
          });
      });

      it('should not validate the ticket again', () => {
        return pactum
          .spec()
          .post('/tickets/validate')
          .withBody({ code: '$S{ticketCode}' })
          .expectStatus(400)
          .expectBodyContains('Ticket already validated');
      });

      it('should fail to validate a non-existing code', () => {
        return pactum
          .spec()
          .post('/tickets/validate')
          .withBody({ code: '00000000-0000-0000-0000-000000000000' })
          .expectStatus(400)
          .expectBodyContains('Ticket not found');
      });
    });

    describe('Get Ticket PDF', () => {
      it('should return the ticket PDF file', () => {
        return pactum
          .spec()
          .get('/tickets/{id}/pdf')
          .withPathParams('id', '$S{ticketId}')
          .expectStatus(200)
          .expectHeader('content-type', 'application/pdf');
      });
    });
  });
});
