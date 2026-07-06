import type { ConstructionAgency } from '@appTypes/deliveryProvider';

/** Verified construction agencies available for delivery provider association. */
export const VERIFIED_CONSTRUCTION_AGENCIES: ConstructionAgency[] = [
  {
    id: 'buildstrong-ltd',
    name: 'BuildStrong Ltd',
    logoUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1lV8yWOSrjZWyPs5UsgUw2BLnMm0JvBP3wrrt50t4V5SIw9JMRRjDLIuCDUCB2z1-xGfotX6gygCZKpspKM4dHK5ZKFZ3S8Y8evF8wfb2_T9Z_QfvwACgk-KcNH8-sNo9vjCHeqRK9FjhCixhxYeF30aWg2UKczBkYNigxLYGOOw8dVqdZuOm8pg4K1Jnx0wmu4rBbTCnjRQU_cQ8yFTruLhn11JM1eegRBqiGG5aVi_BlcSRMjmj',
    verified: true,
  },
  {
    id: 'apex-builders',
    name: 'Apex Builders Ghana',
    logoUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU6z37ivgb9E8BnrC7zMlkwk_Sa3sYQanhVtqGz4DlVXcp-fp42BFblf2MDj-Yf_IKRKMwGIQ27MgrPGN7o43_WR1ya6CYD5NGhpNb7GtQkHUyhe5TfzBtRoo1PbweNnGwH5ZK9K5QwKFp0Elc9x2nUi1W7nDrooqcIcE5fsg_NMPU-8qjLi94eLwyMhOMZSSbKRFhCH8YtpUwgcNt40-kMsoJ0NPw0v33fhDoXqgDKUMWv2jGth9W',
    verified: true,
  },
];

export function findConstructionAgencyById(id: string | null): ConstructionAgency | undefined {
  if (!id) {
    return undefined;
  }

  return VERIFIED_CONSTRUCTION_AGENCIES.find((agency) => agency.id === id);
}

export function filterConstructionAgencies(query: string): ConstructionAgency[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return VERIFIED_CONSTRUCTION_AGENCIES;
  }

  return VERIFIED_CONSTRUCTION_AGENCIES.filter((agency) =>
    agency.name.toLowerCase().includes(normalized),
  );
}
