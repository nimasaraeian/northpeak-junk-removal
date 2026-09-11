"use server";

import {
  submitEstimateCore,
  type EstimateActionState,
} from "@/lib/estimate/submit-core";

export type { EstimateActionState };

export async function submitEstimate(
  _prev: EstimateActionState,
  formData: FormData,
): Promise<EstimateActionState> {
  return submitEstimateCore(formData);
}
