import { Module } from '@nestjs/common';
import { ElectionReportsController } from './election-reports.controller';
import { ElectionReportsService } from './election-reports.service';

@Module({
  controllers: [ElectionReportsController],
  providers: [ElectionReportsService],
})
export class ElectionReportsModule {}
