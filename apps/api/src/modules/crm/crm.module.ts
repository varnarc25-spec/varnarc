import { Module } from '@nestjs/common';
import { HrModule } from '../hr/hr.module';
import { LaptopRentalController } from '../hr/laptop-rental.controller';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
  imports: [HrModule],
  controllers: [CrmController, LaptopRentalController],
  providers: [CrmService],
})
export class CrmModule {}
