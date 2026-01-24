import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [],
  controllers: [NotificationServiceController, HealthController, ],
  providers: [],
})
export class NotificationServiceModule {}