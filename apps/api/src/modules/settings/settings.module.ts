import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { DatabaseBackupService } from './database-backup.service';
import { PrismaMigrateService } from './prisma-migrate.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, DatabaseBackupService, PrismaMigrateService],
  exports: [SettingsService],
})
export class SettingsModule {}
