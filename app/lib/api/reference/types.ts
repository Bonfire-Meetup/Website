export const API_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export type ApiMethod = (typeof API_METHODS)[number];

export type ApiAccess =
  | { kind: "public" }
  | { kind: "optional-user" }
  | { kind: "user" }
  | { kind: "self" }
  | { kind: "role"; role: string }
  | { kind: "secret" }
  | { kind: "signature" };

export type ApiShape =
  | { kind: "object"; fields: ApiField[] }
  | { kind: "array"; item: ApiShape }
  | { kind: "union"; variants: ApiShape[] }
  | { kind: "enum"; values: string[] }
  | { kind: "literal"; value: string }
  | { kind: "primitive"; type: string }
  | { kind: "unknown"; source?: string };

export interface ApiTypeInfo {
  shape: ApiShape;
  optional: boolean;
  nullable: boolean;
  notes: string[];
}

export interface ApiField extends ApiTypeInfo {
  name: string;
}

export interface ApiResponse {
  status: number;
  error?: string;
  fields?: string[];
  shape?: ApiTypeInfo;
  stream?: boolean;
}

export interface ApiEndpoint {
  id: string;
  method: ApiMethod;
  path: string;
  group: string;
  summary: string | null;
  description: string | null;
  access: ApiAccess;
  rateLimited: boolean;
  pathParams: string[];
  queryParams: string[];
  body: ApiTypeInfo | null;
  responses: ApiResponse[];
  sourceFile: string;
}

export interface ApiReferenceGroup {
  name: string;
  endpoints: ApiEndpoint[];
}

export interface ApiReference {
  groups: ApiReferenceGroup[];
  endpointCount: number;
}
