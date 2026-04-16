import { Module } from '@nestjs/common';
import { MangaDexController } from './mangadex.controller';
import { MangaDexService } from './mangadex.service';

@Module({
  controllers: [MangaDexController],
  providers: [MangaDexService],
})
export class MangaDexModule {}