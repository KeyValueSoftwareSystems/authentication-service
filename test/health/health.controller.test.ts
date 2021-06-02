import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, ServiceUnavailableException } from '@nestjs/common';
import Substitute, { Arg } from '@fluffy-spoon/substitute';
import {
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from '../../src/health/health.controller';
import { ConfigService } from '@nestjs/config';

const healthIndicator = Substitute.for<TypeOrmHealthIndicator>();
const healthCheckService = Substitute.for<HealthCheckService>();
const response: unknown = {
  status: 'ok',
  info: {
    nest: {
      status: 'up',
    },
  },
  error: {},
  details: {
    nest: {
      status: 'up',
    },
  },
};

const errorResponse: unknown = {
  statusCode: 503,
  message: 'Service Unavailable Exception',
  error: {
    nest: {
      status: 'down',
    },
  },
};
describe('Health Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ConfigService,
        { provide: 'HealthCheckService', useValue: healthCheckService },
        { provide: 'TypeOrmHealthIndicator', useValue: healthIndicator },
      ],
      controllers: [HealthController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health controller', () => {
    it('should return the ok status when active', () => {
      healthCheckService
        .check(Arg.any())
        .returns(Promise.resolve(response as HealthCheckResult));
      return request(app.getHttpServer()).get('/health').send().expect(200);
    });

    it('should return the service unavailable status when down', () => {
      healthCheckService
        .check(Arg.any())
        .returns(
          Promise.reject(new ServiceUnavailableException(errorResponse)),
        );
      request(app.getHttpServer())
        .get('/health')
        .send()
        .expect(503)
        .end(function (err) {
          if (err) throw err;
        });
    });
  });
});
