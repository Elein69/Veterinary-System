import { Controller, Get } from '@nestjs/common';

@Controller('staff')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'UP',
      service: 'staff-service',
    };
  }
}
