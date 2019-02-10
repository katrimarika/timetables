import { stringify } from 'query-string';

export const routes = {
  frontpage: '/',
  stop: (stopId: string) => `/stop/${stopId}`,
  shareUrl: (star: string[], pin: string[]) => `?${stringify({ star, pin })}`,
};
