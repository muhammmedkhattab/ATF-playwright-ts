import crypto from 'crypto';

export default class Utilities {
  public convertToMd5(password: string) {
    return crypto.createHash('md5').update(password).digest('hex');
  }
  public async sleep(msec: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, msec, 0);
    });
  }
  public setEmailAndPassword(email: string, password: string) {
    return `&email=${email}&password=${password}`;
  }
}
