export const routes = {
  frontpage: '/',
  stop: (stopId: string, type?: string) =>
    `/stop/${stopId}${type ? `/${type}` : ''}`,
  station: (stationId: string, type?: string) =>
    `/station/${stationId}${type ? `/${type}` : ''}`,
};
