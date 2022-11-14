export const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'JWT_TOKEN_EXPTIME':
        return '3600';
      case 'ENV':
        return 'local';
      case 'JWT_SECRET':
        return 'secret';
    }
  },
};
