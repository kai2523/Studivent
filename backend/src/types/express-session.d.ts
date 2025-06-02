import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user: {
      userId: number;
      email: string;
    };
  }
}
