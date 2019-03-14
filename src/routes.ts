import { stringify } from 'query-string';

export const routes = {
  frontpage: '/',
  stop: (stopId: string, type?: string) =>
    `/stop/${stopId}${type ? `/${type}` : ''}`,
  station: (stationId: string, type?: string) =>
    `/station/${stationId}${type ? `/${type}` : ''}`,
  shareUrl: (star: string[], pin: string[]) => `?${stringify({ star, pin })}`,
};
