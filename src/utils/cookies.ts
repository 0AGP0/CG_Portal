import Cookies from 'js-cookie';

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes): void => {
  Cookies.set(name, value, {
    ...options,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  });
};

export const removeCookie = (name: string, options?: Cookies.CookieAttributes): void => {
  Cookies.remove(name, options);
}; 