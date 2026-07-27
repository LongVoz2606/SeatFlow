export interface IApiResponseValue<T> {
  value: T;
}

export interface IApiResponseList<T> {
  data: T[];
}

export interface IApiResponseTable<T> {
  data: T[];
  total: number;
  totalPage: number;
  page: number;
  pageSize: number;
}
