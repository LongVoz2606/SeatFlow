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
}

export interface ISeatSectionBody {
  rowLabel: string;
  seatCount: number;
  seatType: string;
  price: number;
}

export interface ICreateEventBody {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  bannerUrl: string;
  seatSections: ISeatSectionBody[];
}
