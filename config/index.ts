import { YAML } from "../deps.ts";
import { ajv } from "../util/ajv.ts";
import { ConfigAny, ConfigLatest } from "./types.ts";

function upgradeConfigFile(config: ConfigAny): ConfigLatest {
  switch (config.version) {
    case 1:
      return config;
    default:
      throw new Error(`Unrecognized config version: ${config.version}`);
  }
}

export async function parseConfig(content: string): Promise<ConfigLatest> {
  const data = await YAML.load(content);

  await ajv.validate(ConfigAny, data);
  if (!ajv.errors) {
    return upgradeConfigFile(data as ConfigAny);
  }

  throw new Error(`Config validation error: ${Deno.inspect(ajv.errors)}`);
}
