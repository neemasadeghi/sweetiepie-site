/**
 * This repo deploys the sweetiepie.film site. On Vercel, the public API + embedded
 * Studio must use this project id even if `NEXT_PUBLIC_SANITY_PROJECT_ID` was copied
 * from another site (e.g. Neema) by mistake — otherwise Manage "Register" opens the
 * wrong project (`tn1vmlrk`).
 */
export const SWEETIEPIE_SANITY_PROJECT_ID = "a7vpcuze";

export function resolvePublicSanityProjectId(): string | undefined {
  if (process.env.VERCEL) return SWEETIEPIE_SANITY_PROJECT_ID;
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
}
