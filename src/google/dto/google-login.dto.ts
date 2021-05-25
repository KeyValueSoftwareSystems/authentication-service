export class GoogleLoginDto {
  constructor(idToken: string) {
    this.idToken = idToken;
  }
  idToken: string;
}
