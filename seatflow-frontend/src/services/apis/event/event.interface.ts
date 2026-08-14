import { IEvent, ISeat } from '../../../types';

export type IEventDetail = IEvent;
export type ISeatInfo = ISeat;

export interface IEventQuery {
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  hot?: boolean;
  organizerId?: number;
  page?: number;
  size?: number;
}

export interface IZoneBody {
  name: string;
  seatType: string;
  price: number;
  rowCount: number;
  colCount: number;
  rowSpacing: number;
  colSpacing: number;
  curveAngle: number;
  positionX: number;
  positionY: number;
  rotation: number;
  color?: string;
}

export interface ICreateEventBody {
  title: string;
  description: string;
  location: string;
  bannerUrl: string;
  category?: string;
  sessionDates: string[];
  zones: IZoneBody[];
}
