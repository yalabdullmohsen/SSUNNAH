export {
  REQUIRED_SECTION_COUNT,
  SECTION_IA_GROUPS,
  SECTION_PRODUCT_CATALOG,
} from "./section-product-catalog";
export {
  listRegistryGaps,
  summarizeSectionAvailability,
  validateSectionProductCatalog,
} from "./validate";
export type { ProductRegistryIssue } from "./validate";
export {
  SECTION_AVAILABILITY_STATES,
  SECTION_PUBLICATION_STATES,
} from "./types";
export type {
  SectionAvailabilityState,
  SectionIaGroup,
  SectionIaGroupId,
  SectionLearningType,
  SectionProductEntry,
  SectionPublicationState,
} from "./types";
