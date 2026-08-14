import { IZone } from '../types';

export interface ISeatPosition {
  x: number;
  y: number;
}

export type IZoneGeometry = Pick<
  IZone,
  'rowCount' | 'colCount' | 'rowSpacing' | 'colSpacing' | 'curveAngle' | 'positionX' | 'positionY' | 'rotation'
>;

const STRAIGHT_ROW_EPSILON_DEGREES = 1;

/**
 * Toạ độ tương đối (chưa xoay/dịch theo zone) của 1 ghế trong lưới hàng/cột của zone.
 * curveAngle = 0 (hoặc gần 0) -> hàng ghế thẳng.
 * curveAngle != 0 -> hàng ghế uốn cong thành cung tròn, bán kính tăng dần theo từng hàng
 * (hàng càng xa sân khấu bán kính càng lớn), độ rộng cung được giữ ~ colSpacing * (colCount-1)
 * bất kể góc cong bao nhiêu để mật độ ghế nhìn nhất quán.
 */
export function computeLocalSeatPosition(
  zone: IZoneGeometry,
  rowIndex: number,
  colIndex: number
): ISeatPosition {
  const { rowSpacing, colSpacing, curveAngle, colCount } = zone;

  if (Math.abs(curveAngle) < STRAIGHT_ROW_EPSILON_DEGREES || colCount <= 1) {
    return {
      x: (colIndex - (colCount - 1) / 2) * colSpacing,
      y: rowIndex * rowSpacing,
    };
  }

  const angleRad = (curveAngle * Math.PI) / 180;
  const totalWidth = (colCount - 1) * colSpacing;
  const baseRadius = totalWidth / Math.abs(angleRad);
  const seatAngle = -angleRad / 2 + (colIndex / (colCount - 1)) * angleRad;
  const radiusForRow = baseRadius + rowIndex * rowSpacing;

  return {
    x: radiusForRow * Math.sin(seatAngle),
    y: radiusForRow * Math.cos(seatAngle) - baseRadius,
  };
}

/** Áp dụng xoay (rotation, độ) quanh gốc rồi dịch theo vị trí (positionX/Y) của zone. */
export function applyZoneTransform(zone: IZoneGeometry, local: ISeatPosition): ISeatPosition {
  const rotRad = (zone.rotation * Math.PI) / 180;
  const cos = Math.cos(rotRad);
  const sin = Math.sin(rotRad);
  const rx = local.x * cos - local.y * sin;
  const ry = local.x * sin + local.y * cos;
  return { x: zone.positionX + rx, y: zone.positionY + ry };
}

/** Toạ độ tuyệt đối (trên canvas) của ghế tại (rowIndex, colIndex) trong 1 zone. */
export function computeSeatAbsolutePosition(zone: IZoneGeometry, rowIndex: number, colIndex: number): ISeatPosition {
  return applyZoneTransform(zone, computeLocalSeatPosition(zone, rowIndex, colIndex));
}

export interface IZoneBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Bounding box của toàn bộ ghế trong 1 zone — dùng để auto-fit canvas / tính vùng kéo-thả. */
export function computeZoneBounds(zone: IZoneGeometry): IZoneBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let r = 0; r < zone.rowCount; r++) {
    for (let c = 0; c < zone.colCount; c++) {
      const p = computeSeatAbsolutePosition(zone, r, c);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }

  if (!Number.isFinite(minX)) {
    return { minX: zone.positionX, minY: zone.positionY, maxX: zone.positionX, maxY: zone.positionY };
  }
  return { minX, minY, maxX, maxY };
}

/** Bounding box gộp của nhiều zone (dùng để auto-fit toàn bộ sơ đồ vào khung nhìn SVG). */
export function computeCombinedBounds(zones: IZoneGeometry[]): IZoneBounds {
  if (zones.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  }
  const boxes = zones.map(computeZoneBounds);
  return {
    minX: Math.min(...boxes.map((b) => b.minX)),
    minY: Math.min(...boxes.map((b) => b.minY)),
    maxX: Math.max(...boxes.map((b) => b.maxX)),
    maxY: Math.max(...boxes.map((b) => b.maxY)),
  };
}
