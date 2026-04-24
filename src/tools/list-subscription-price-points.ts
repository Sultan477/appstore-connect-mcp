import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  SubscriptionsPricePointsGetToManyRelatedData,
  SubscriptionsPricePointsGetToManyRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  subscriptionId: z
    .string()
    .describe(
      "Subscription ID (from create-subscription or list-subscription-group-subscriptions)"
    ),
  "filter.territory": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe(
      "Filter by territory ID(s), e.g. USA. Omit to return price points for all territories."
    ),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of price points to return (default 50, max 200)"),
};

export const metadata: ToolMetadata = {
  name: "list-subscription-price-points",
  description:
    "List available price points for a subscription. Use the returned price point id as subscriptionPricePointId in create-subscription-price.",
  annotations: {
    title: "List subscription price points",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listSubscriptionPricePointsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<
    SubscriptionsPricePointsGetToManyRelatedData["query"]
  > = {
    limit: args.limit,
    ...(toArray(args["filter.territory"])?.length && {
      "filter[territory]": toArray(args["filter.territory"])!,
    }),
  };
  const result =
    await client.api.Subscriptions.subscriptionsPricePointsGetToManyRelated({
      path: { id: args.subscriptionId },
      query,
    } as SubscriptionsPricePointsGetToManyRelatedData);
  const data =
    unwrapApiResult<SubscriptionsPricePointsGetToManyRelatedResponse>(result);
  return JSON.stringify(data, null, 2);
}
