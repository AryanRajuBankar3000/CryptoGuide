import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|ta|hi|es|de|ur|ja|fr|zh|ko|pt|it)/:path*']
};
