export type RuleStatus = 'requested' | 'in_dev' | 'implemented' | 'deprecated';
export type RuleCategory = 'pricing' | 'discounts' | 'fees_tax' | 'capacity' | 'room_fit' | 'vaccines' | 'booking' | 'pin_approvals' | 'daycare' | 'grooming' | 'operations' | 'people' | 'locations' | 'account';

export const RULE_CATEGORY_LABEL: Record<RuleCategory, string> = {
  pricing: 'Pricing', discounts: 'Discounts', fees_tax: 'Fees & tax', capacity: 'Capacity', room_fit: 'Room fit', vaccines: 'Vaccines', booking: 'Booking lifecycle',
  pin_approvals: 'PIN approvals', daycare: 'Daycare', grooming: 'Grooming & Spa', operations: 'Operations', people: 'People & staff', locations: 'Locations & hours', account: 'Account & settings',
};
export const RULE_STATUS_LABEL: Record<RuleStatus, string> = { requested: 'Requested', in_dev: 'In dev', implemented: 'Implemented', deprecated: 'Deprecated' };

/**
 * One business rule (D-006). Ids follow docs/rules/business-rules-from-designs.md (R-A01...) and are append-only
 * once in code. `pages` are page codes that implement or display the rule; `source` is the design file or decision.
 */
export interface Rule {
  id: string;
  title: string;
  description: string;
  category: RuleCategory;
  status: RuleStatus;
  pages: string[];
  source: string;
  /** Where it is enforced in code, when implemented. */
  implementedIn?: string;
}

export const defineRules = (rules: Rule[]): Rule[] => rules;
