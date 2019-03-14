import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTimes,
  faBus,
  faStar,
  faChevronDown,
  faThumbtack,
  faTrashAlt,
  faArrowLeft,
  faSearch,
  faSign,
} from '@fortawesome/free-solid-svg-icons';

export const iconSetup = () =>
  library.add(
    faTimes,
    faBus,
    faStar,
    faChevronDown,
    faThumbtack,
    faTrashAlt,
    faArrowLeft,
    faSearch,
    faSign
  );
