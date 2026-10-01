import { Module } from '@nestjs/common';
import { AutomobileController } from './automobile.controller';
import { AutomobileService } from './automobile.service';
import { AutomobilePriceAiService } from './automobile-price-ai.service';
import { CarCatalogController, CarCatalogSeoController } from './car-catalog.controller';
import { CarCatalogService } from './car-catalog.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [CarCatalogSeoController, CarCatalogController, AutomobileController],
  providers: [AutomobileService, AutomobilePriceAiService, CarCatalogService],
  exports: [AutomobileService, AutomobilePriceAiService, CarCatalogService],
})
export class AutomobileModule {}
