import { Ajv, AjvFormats } from "../deps.ts";

export const ajv = AjvFormats(new Ajv({}) as any, [
  'date-time',
  'time',
  'date',
  'email',
  'hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex',
])
  .addKeyword("kind")
  .addKeyword("modifier");
