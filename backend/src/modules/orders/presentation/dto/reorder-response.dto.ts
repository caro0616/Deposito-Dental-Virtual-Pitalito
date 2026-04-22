export type ReorderSkippedReason = 'out_of_stock' | 'not_found' | 'inactive';

export interface ReorderAddedItemDto {
  productId: string;
  name: string;
  requestedQuantity: number;
  addedQuantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReorderSkippedItemDto {
  productId: string;
  name: string;
  requestedQuantity: number;
  reason: ReorderSkippedReason;
  availableStock?: number;
}

export interface ReorderSummaryDto {
  requestedItems: number;
  addedItems: number;
  skippedItems: number;
  requestedUnits: number;
  addedUnits: number;
  skippedUnits: number;
}

export interface ReorderResponseDto {
  addedItems: ReorderAddedItemDto[];
  skippedItems: ReorderSkippedItemDto[];
  summary: ReorderSummaryDto;
}
