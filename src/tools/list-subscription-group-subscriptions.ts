import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  SubscriptionGroupsSubscriptionsGetToManyRelatedData,
  SubscriptionGroupsSubscriptionsGetToManyRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const stateEnum = z.enum([
  "MISSING_METADATA",
  "READY_TO_SUBMIT",
  "WAITING_FOR_REVIEW",
  "IN_REVIEW",
  "DEVELOPER_ACTION_NEEDED",
  "PENDING_BINARY_APPROVAL",
  "APPROVED",
  "DEVELOPER_REMOVED_FROM_SALE",
  "REMOVED_FROM_SALE",
  "REJECTED",
]);

export const schema = {
  subscriptionGroupId: z
    .string()
    .describe(
      "Subscription group ID (e.g. Premium group ID). Get from app → subscription groups."
    ),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of subscriptions to return (default 50, max 200)"),
  "filter.productId": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by product ID(s), e.g. premium_monthly_v2"),
  "filter.name": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by subscription name(s)"),
  "filter.state": z
    .union([stateEnum, z.array(stateEnum)])
    .optional()
    .describe("Filter by state (e.g. APPROVED)"),
  sort: z
    .enum(["name", "-name"])
    .optional()
    .describe("Sort by name (use -name for descending)"),
};

export const metadata: ToolMetadata = {
  name: "list-subscription-group-subscriptions",
  description:
    "List all auto-renewable subscriptions in a subscription group (productId, name, state, prices, etc.). Use to verify products like premium_monthly_v2 and premium_annual_v2 in a group.",
  annotations: {
    title: "List subscription group subscriptions",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listSubscriptionGroupSubscriptionsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<
    SubscriptionGroupsSubscriptionsGetToManyRelatedData["query"]
  > = {
    limit: args.limit,
    ...(toArray(args["filter.productId"])?.length && {
      "filter[productId]": toArray(args["filter.productId"])!,
    }),
    ...(toArray(args["filter.name"])?.length && {
      "filter[name]": toArray(args["filter.name"])!,
    }),
    ...(toArray(args["filter.state"])?.length && {
      "filter[state]": toArray(args["filter.state"])!,
    }),
    ...(args.sort && { sort: [args.sort] }),
  };
  const result =
    await client.api.SubscriptionGroups.subscriptionGroupsSubscriptionsGetToManyRelated(
      {
        path: { id: args.subscriptionGroupId },
        query,
      }
    );
  const data =
    unwrapApiResult<SubscriptionGroupsSubscriptionsGetToManyRelatedResponse>(
      result
    );
  return JSON.stringify(data, null, 2);
}
