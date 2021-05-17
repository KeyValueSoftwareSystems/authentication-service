import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/schema/graphql.schema';
import { INestApplication, ServiceUnavailableException } from '@nestjs/common';
import UserService from '../../src/user/user.service';
import Substitute, { Arg } from '@fluffy-spoon/substitute';
import { HealthCheckResult, HealthCheckService, HealthIndicatorResult, TerminusModule, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from '../../src/health/health.controller';
import { ConfigService } from '@nestjs/config';

const users: User[] = [
  {
    id: 'ae032b1b-cc3c-4e44-9197-276ca877a7f8',
    email: 'user@test.com',
    firstName: 'Test1',
    lastName: 'Test2',
    active: true,
  },
];


let healthIndicator = Substitute.for<TypeOrmHealthIndicator>();
let healthCheckService = Substitute.for<HealthCheckService>();
const response: unknown = {
    "status": "ok",
    "info": {
        "nest": {
            "status": "up"
        }
    },
    "error": {},
    "details": {
        "nest": {
            "status": "up"
        }
    }
}

const errorResponse: unknown = {
    "statusCode": 503,
    "message": "Service Unavailable Exception",
    "error": {
        "nest": {
            "status": "down"
        }
    }
}
describe('Health Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ConfigService, {provide: 'HealthCheckService', useValue: healthCheckService}, {provide: 'TypeOrmHealthIndicator', useValue: healthIndicator}],
      controllers: [HealthController]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Health controller", () => {
    it('should return the health status when active', () => {
        healthCheckService.check(Arg.any()).returns(Promise.resolve(response as HealthCheckResult));
    return request(app.getHttpServer())
        .get("/health")
        .send()
        .expect(200);
    });

    it('should return the health status when down', () => {
        healthCheckService.check(Arg.any()).returns(Promise.reject(new ServiceUnavailableException(errorResponse)));
    const result =  request(app.getHttpServer())
        .get("/health")
        .send()
        .expect(503).end(function(err, res) {
            if (err) throw err;
          });
    });
});
});
