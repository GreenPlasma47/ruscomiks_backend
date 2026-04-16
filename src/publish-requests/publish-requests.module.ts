import { Module } from '@nestjs/common';
import { PublishRequestsService } from './publish-requests.service';
import { PublishRequestsController } from './publish-requests.controller';

@Module({
  providers: [PublishRequestsService],
  controllers: [PublishRequestsController],
})
export class PublishRequestsModule {}