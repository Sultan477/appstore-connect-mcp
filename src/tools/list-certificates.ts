import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  CertificatesGetCollectionData,
  CertificatesGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const certificateTypeEnum = z.enum([
  "APPLE_PAY",
  "DEVELOPMENT",
  "DISTRIBUTION",
  "IOS_DEVELOPMENT",
  "IOS_DISTRIBUTION",
  "MAC_APP_DISTRIBUTION",
  "MAC_APP_DEVELOPMENT",
  "MAC_INSTALLER_DISTRIBUTION",
  "DEVELOPER_ID_APPLICATION",
  "DEVELOPER_ID_KEXT",
  "DEVELOPER_ID_APPLICATION_G2",
  "DEVELOPER_ID_KEXT_G2",
  "APPLE_PAY_MERCHANT_IDENTITY",
  "APPLE_PAY_PSP_IDENTITY",
  "APPLE_PAY_RSA",
  "IDENTITY_ACCESS",
  "PASS_TYPE_ID",
  "PASS_TYPE_ID_WITH_NFC",
]);

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe("Maximum number of certificates to return (default 100, max 200)"),
  "filter.certificateType": z
    .union([certificateTypeEnum, z.array(certificateTypeEnum)])
    .optional()
    .describe("Filter by certificate type(s)"),
  "filter.serialNumber": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by serial number(s)"),
  "filter.displayName": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by display name(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by certificate ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-certificates",
  description: "Get a list of signing certificates in your team",
  annotations: {
    title: "List certificates",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listCertificatesTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<CertificatesGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.certificateType"])?.length && {
      "filter[certificateType]": toArray(args["filter.certificateType"])!,
    }),
    ...(toArray(args["filter.serialNumber"])?.length && {
      "filter[serialNumber]": toArray(args["filter.serialNumber"])!,
    }),
    ...(toArray(args["filter.displayName"])?.length && {
      "filter[displayName]": toArray(args["filter.displayName"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result = await client.api.Certificates.certificatesGetCollection({
    query,
  });
  const data = unwrapApiResult<CertificatesGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
