import { StopType } from './fetch';

export const stopTypeToIcon = (stopType: StopType) => {
  switch (stopType) {
    case 'bus':
      return 'bus';
    case 'train':
      return 'train';
    case 'subway':
      return 'train-subway';
    case 'tram':
      return 'train-tram';
    default:
      return 'bus';
  }
};
