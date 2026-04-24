import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  CiProductsGetCollectionData,
  CiProductsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const productTypeEnum = z.enum(["APP", "FRAMEWORK"]);

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      "Maximum number of CI products to return (default 100, max 200)"
    ),
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app ID(s)"),
  "filter.productType": z
    .union([productTypeEnum, z.array(productTypeEnum)])
    .optional()
    .describe("Filter by product type(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-ci-products",
  description: "List Xcode Cloud CI products (integrations per app)",
  annotations: {
    title: "List CI products",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listCiProductsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<CiProductsGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.app"])?.length && {
      "filter[app]": toArray(args["filter.app"])!,
    }),
    ...(toArray(args["filter.productType"])?.length && {
      "filter[productType]": toArray(args["filter.productType"])!,
    }),
  };
  const result =
    await client.api.CiProducts.ciProductsGetCollection({ query });
  const data = unwrapApiResult<CiProductsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
