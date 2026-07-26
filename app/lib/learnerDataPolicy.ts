import {
  defaultLearnerDataPolicy,
  validateLearnerDataPolicy,
} from "@project42/platform";

const validation = validateLearnerDataPolicy(defaultLearnerDataPolicy);

if (!validation.valid) {
  throw new Error(
    `The configured learner-data policy is invalid: ${validation.errors.join("; ")}`,
  );
}

export const learnerDataPolicy = defaultLearnerDataPolicy;
