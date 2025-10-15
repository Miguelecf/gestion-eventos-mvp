export type AbilityRule = {
  action: string;
  subject: string;
};

export function defineAbility(rules: AbilityRule[] = []) {
  return rules;
}

