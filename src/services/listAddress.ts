import { api } from './api';

class ListAddressService {
  private GET_LIST_ADDRESS_URL = '/token-account';

  get getListAddressUrl() {
    return this.GET_LIST_ADDRESS_URL;
  }

  constructor() {}

  getListAddress = (address: string): any => {
    return api.get(`${this.getListAddressUrl}/${address}`);
  };

  createListAddress = (params: any): any => {
    return api.post(this.getListAddressUrl, params);
  };

  updateListAddress = (id: string, params: any): any => {
    return api.put(`${this.getListAddressUrl}/${id}`, params);
  };
}

const listAddressService = new ListAddressService();

export default listAddressService;
