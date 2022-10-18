import LocalStorage from "./storage";

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

interface UserToken {
  accessToken: string;
  refreshToken: string;
}

class CustomerAuth {
  static clearTokens(): void {
    LocalStorage.remove(ACCESS_TOKEN);
    LocalStorage.remove(REFRESH_TOKEN);
  }

  static setTokens(token: UserToken): void {
    LocalStorage.setItem(ACCESS_TOKEN, token.accessToken);
    LocalStorage.setItem(REFRESH_TOKEN, token.refreshToken);
  }

  static get refreshToken(): string | null {
    return LocalStorage.getItem(REFRESH_TOKEN);
  }

  static get accessToken(): string | null {
    return LocalStorage.getItem(ACCESS_TOKEN);
  }

  static get isAuthenticated(): boolean {
    return Boolean(CustomerAuth.accessToken);
  }
}

export default CustomerAuth;
