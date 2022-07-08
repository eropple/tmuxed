import { parseConfig } from "./config/index.ts";
import { ConfigLatest } from "./config/types.ts";
import { CliffyCommand, YAML } from './deps.ts';
import { executePlan } from "./executor.ts";
import { buildTmuxPlan } from "./planner.ts";
import { VERSION } from "./version.ts";

await
  (new CliffyCommand())
    .name("tmuxed")
    .version(VERSION)
    .description("tmuxed management that just won't quit.\n\nI mean, it won't quit.\n\nYou can. You should maybe go outside.")
    .globalOption("-v, --verbose", "Ups the level of log chatter. Good for debugging against tmux.")
    .command("go", "Hit it.")
    .arguments("[configFile:file]")
    .action(async (_options, ...args) => {
      const file = args[0] ?? "./.tmuxed.yaml";

      let rawConfig: string;
      try {
        rawConfig = await Deno.readTextFile(file);
      } catch (err) {
        console.error(`Error loading file: ${file}\n\n${err}`);
        Deno.exit(1);
      }

      const config = await parseConfig(rawConfig);
      const plan = buildTmuxPlan(Deno.cwd(), config);

      await executePlan(plan);
    })
    .command("config-schema", "Prints out the expected config schema for you.")
    .action(() => {
      console.log(YAML.dump(ConfigLatest));
    })
    .parse(Deno.args);
