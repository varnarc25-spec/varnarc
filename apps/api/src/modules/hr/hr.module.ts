import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { HrController } from './hr.controller';
import { HrRecordsController } from './hr-records.controller';
import { HrService } from './hr.service';
import { LaptopRentalService } from './laptop-rental.service';

@Module({
  imports: [SettingsModule],
  controllers: [HrController, HrRecordsController],
  providers: [HrService, LaptopRentalService],
  exports: [HrService, LaptopRentalService],
})
export class HrModule {}
