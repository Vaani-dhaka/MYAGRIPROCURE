import { Centre } from '../types/index';

export const sortCentres = (centres: Centre[]): Centre[] =>
  [...centres].sort((a, b) =>
    a.state.localeCompare(b.state, undefined, { sensitivity: 'base' }) ||
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

export const sortCentresByDistrict = (centres: Centre[]): Centre[] =>
  [...centres].sort((a, b) =>
    a.state.localeCompare(b.state, undefined, { sensitivity: 'base' }) ||
    a.district.localeCompare(b.district, undefined, { sensitivity: 'base' }) ||
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
