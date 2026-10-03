import { Module } from '@nestjs/common';
import { HrController } from './hr.controller';
import { HrRecordsController } from './hr-records.controller';
import { HrService } from './hr.service';

@Module({
  controllers: [HrController, HrRecordsController],
  providers: [HrService],
})
export class HrModule {}
