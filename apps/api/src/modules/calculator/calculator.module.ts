import { Module } from '@nestjs/common';
import { CalculatorController } from './calculator.controller';
import { CalculatorService } from './calculator.service';
import { SolarReferenceService } from './solar-reference.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [CalculatorController],
  providers: [CalculatorService, SolarReferenceService],
})
export class CalculatorModule {}
