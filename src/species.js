export const DEFAULT_SPECIES = "tlacuache";
export const NAME_MAX = 12;

export const SPECIES = {
  tlacuache: {
    id: "tlacuache",
    label: "Tlacuache",
    bodyKey: "pet-tlacuache",
    sickKey: "pet-tlacuache-sick",
    armColor: 0xc4b8aa,
    lidColor: 0xcfc4b8,
  },
  borrego: {
    id: "borrego",
    label: "Borrego",
    bodyKey: "pet-borrego",
    sickKey: "pet-borrego-sick",
    armColor: 0xe8d5c4,
    lidColor: 0xffe8c8,
  },
};

export const SPECIES_LIST = Object.values(SPECIES);

export function normalizeSpecies(value) {
  return value && SPECIES[value] ? value : DEFAULT_SPECIES;
}

export function sanitizeName(raw) {
  return String(raw ?? "").trim().slice(0, NAME_MAX);
}
