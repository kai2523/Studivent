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
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
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

  describe('Event', () => {
    let eventId: number;

    describe('Create Event', () => {
      it('should create an event', () => {
        return pactum
          .spec()
          .post('/events')
          .withBody(mockEvent)
          .expectStatus(201)
          .stores('eventId', 'id') 
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

});
