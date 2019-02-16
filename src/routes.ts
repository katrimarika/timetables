import { stringify } from 'query-string';

export const routes = {
  frontpage: '/',
  stop: (stopId: string) => `/stop/${stopId}`,
  station: (stationId: string) => `/station/${stationId}`,
  shareUrl: (star: string[], pin: string[]) => `?${stringify({ star, pin })}`,
};
