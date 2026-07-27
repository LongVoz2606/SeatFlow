import { apiService, IApiRequestParams } from '../index';
import { IApiResponse } from '../../../types';

export default {
  processPayment(params: IApiRequestParams<null, null, { bookingCode: string }>): Promise<IApiResponse<any>> {
    return apiService({
      url: '/payments/process',
      method: 'POST',
      ...params,
    });
  },
};
