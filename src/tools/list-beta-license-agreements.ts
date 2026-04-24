import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaLicenseAgreementsGetCollectionData,
  BetaLicenseAgreementsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app ID(s)"),
  limit: z.number().min(1).max(200).default(50).optional(),
};

export const metadata: ToolMetadata = {
  name: "list-beta-license-agreements",
  description:
    "List TestFlight (beta) license agreements. One per app. Use get-beta-license-agreement to read or update text.",
  annotations: {
    title: "List beta license agreements",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBetaLicenseAgreementsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<BetaLicenseAgreementsGetCollectionData["query"]> = {
    limit: args.limit ?? 50,
    ...(toArray(args["filter.app"])?.length && {
      "filter[app]": toArray(args["filter.app"])!,
    }),
  };
  const result =
    await client.api.BetaLicenseAgreements.betaLicenseAgreementsGetCollection({
      query,
    });
  const data = unwrapApiResult<BetaLicenseAgreementsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
