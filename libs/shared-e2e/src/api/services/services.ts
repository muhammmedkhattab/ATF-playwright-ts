import services from './services.data.json';

const SSO_PARAMS = `?api_service=${services.api.params.service}&api_secret=${services.api.params.secret}&api_output=${services.api.params.output}&api_product=${services.api.params.product}`;
export default class Services {

  public loginService() {
    return `${services.api.services.login}${SSO_PARAMS}`;
  }
}
