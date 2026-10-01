import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@varnarc/auth';
import {
  carCatalogSearchQuerySchema,
  carCompareQuerySchema,
  upsertCarModelSchema,
  upsertCatalogVariantSchema,
  upsertEngineSpecSchema,
  upsertEvSpecSchema,
  upsertUsedVehicleSchema,
  type CarCatalogSearchQuery,
  type CarCompareQuery,
  type UpsertCarModelInput,
  type UpsertCatalogVariantInput,
  type UpsertEngineSpecInput,
  type UpsertEvSpecInput,
  type UpsertUsedVehicleInput,
} from '@varnarc/validation';
import type { CurrentUser } from '@varnarc/types';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUserDecorator } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ok, okPage } from '../../common/utils/response';
import { CarCatalogService } from './car-catalog.service';

@ApiTags('cars')
@ApiBearerAuth()
@Controller('cars')
export class CarCatalogController {
  constructor(private readonly catalog: CarCatalogService) {}

  @Public()
  @Get('brands')
  @ApiOperation({ summary: 'List car brands' })
  async brands(@Query('search') search?: string) {
    return ok(await this.catalog.listBrands(search));
  }

  @Public()
  @Get('brands/:id')
  async brand(@Param('id') id: string) {
    if (id.includes('-') && id.length < 36) return ok(await this.catalog.getBrandBySlug(id));
    return ok(await this.catalog.getBrand(id));
  }

  @Post('brands')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_CREATE)
  async createBrandHint() {
    return ok({
      message: 'Create brands via POST /automobile/manufacturers (existing manufacturer master).',
    });
  }

  @Public()
  @Get('models')
  async models(@Query('brandId') brandId?: string, @Query('search') search?: string) {
    return ok(await this.catalog.listModels(brandId, search));
  }

  @Public()
  @Get('models/:id')
  async model(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.catalog.getModel(id));
  }

  @Post('models')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_CREATE)
  async createModel(
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(upsertCarModelSchema)) body: UpsertCarModelInput,
  ) {
    return ok(await this.catalog.createModel(body, user.id));
  }

  @Put('models/:id')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_EDIT)
  async updateModel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(upsertCarModelSchema)) body: UpsertCarModelInput,
  ) {
    return ok(await this.catalog.updateModel(id, body, user.id));
  }

  @Delete('models/:id')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_DELETE)
  async deleteModel(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.catalog.deleteModel(id));
  }

  @Public()
  @Get('compare')
  @ApiOperation({ summary: 'Compare 2–4 catalog variants' })
  async compare(@Query(new ZodValidationPipe(carCompareQuerySchema)) query: CarCompareQuery) {
    return ok(await this.catalog.compare(query));
  }

  @Public()
  @Get('features')
  async features() {
    return ok(await this.catalog.listFeatures());
  }

  @Public()
  @Get('used')
  async used(@Query('city') city?: string) {
    return ok(await this.catalog.listUsed(city));
  }

  @Public()
  @Get('used/:id')
  async usedOne(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.catalog.getUsed(id, false));
  }

  @Post('used')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_CREATE)
  async createUsed(
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(upsertUsedVehicleSchema)) body: UpsertUsedVehicleInput,
  ) {
    return ok(await this.catalog.createUsed(body, user.id));
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search/filter catalog cars (variants)' })
  async cars(
    @Query(new ZodValidationPipe(carCatalogSearchQuerySchema)) query: CarCatalogSearchQuery,
  ) {
    const result = await this.catalog.searchCars(query);
    return okPage(result.items, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  }

  @Public()
  @Get(':id')
  async car(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.catalog.getCar(id));
  }

  @Post()
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_CREATE)
  async createCar(
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(upsertCatalogVariantSchema)) body: UpsertCatalogVariantInput,
  ) {
    return ok(await this.catalog.createCar(body, user.id));
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_EDIT)
  async updateCar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserDecorator() user: CurrentUser,
    @Body(new ZodValidationPipe(upsertCatalogVariantSchema)) body: UpsertCatalogVariantInput,
  ) {
    return ok(await this.catalog.updateCar(id, body, user.id));
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_DELETE)
  async deleteCar(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.catalog.deleteCar(id));
  }

  @Put(':id/engine')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_EDIT)
  async engine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(upsertEngineSpecSchema)) body: UpsertEngineSpecInput,
  ) {
    return ok(await this.catalog.saveEngine(id, body));
  }

  @Put(':id/ev')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_EDIT)
  async ev(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(upsertEvSpecSchema)) body: UpsertEvSpecInput,
  ) {
    return ok(await this.catalog.saveEv(id, body));
  }
}

@ApiTags('cars-seo')
@Controller()
export class CarCatalogSeoController {
  constructor(private readonly catalog: CarCatalogService) {}

  @Public()
  @Get('cars/:brand/:model/:variant')
  async variantPage(
    @Param('brand') brand: string,
    @Param('model') model: string,
    @Param('variant') variant: string,
  ) {
    return ok(await this.catalog.getCarBySlugs(brand, model, variant));
  }

  @Public()
  @Get('cars/:brand/:model')
  async modelPage(@Param('brand') brand: string, @Param('model') model: string) {
    return ok(await this.catalog.getModelBySlugs(brand, model));
  }
}
