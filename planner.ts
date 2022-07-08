import { ConfigLatest, DirectiveLatest, PaneLatest } from "./config/types.ts";
import { Path, Static, Type } from "./deps.ts";

export const TmuxPlanStep = Type.Object({
  command: Type.String(),
  args: Type.Array(Type.String()),
});
export type TmuxPlanStep = Static<typeof TmuxPlanStep>;

export type TmuxPlan = {
  sessionName: string,
  newSession: TmuxPlanStep,
  onStart: string[];
  onClose: string[];
  initSteps: TmuxPlanStep[];
  parallelSteps: Record<string, (TmuxPlanStep | DirectiveLatest)[]>;
  finishSteps: TmuxPlanStep[];
};

export function buildTmuxPlan(basePath: string, config: ConfigLatest): TmuxPlan {
  /**
   * The way a plan builds:
   * 
   * - Initialize a session.
   * - Create windows and name them.
   * - Create panes in windows and name them.
   * - Apply layout.
   * - FOR EACH PANE:
   *   - run steps, individually, in NodeJS space (one async fn per pane).
   *   - String steps are send-keys. Other directives should be handled as appropriate.
   */

  function deriveCwd(cwdPath = '.') {
    if (Path.isAbsolute(cwdPath)) {
      return cwdPath;
    }
  
    return Path.resolve(Path.join(basePath, cwdPath));
  }

  const ret: TmuxPlan = {
    sessionName: config.name,
    newSession: {
      command: "new-session",
      args: [
        `-d`, // do not attach
        `-s`, config.name,
        `-c`, deriveCwd(config.cwd),
        `-n`, config.windows[0].name,
      ],
    },
    onStart: [],
    onClose: [],
    initSteps: [],
    parallelSteps: {},
    finishSteps: [],
  };

  ret.onStart = [config.onStart ?? []].flat();
  ret.onClose = [config.onClose ?? []].flat();

  // guaranteed, json schema min 1 window
  const restWindows = config.windows.slice(1);

  ret.initSteps.push();

  for (const window of restWindows) {
    const windowArgs: string[] = [];
    if (window.cwd) {
      windowArgs.push(`-c`, deriveCwd(window.cwd));
    }

    windowArgs.push(`-n`, window.name);

    ret.initSteps.push({
      command: "new-window",
      args: windowArgs,
    })
  }

  for (const window of config.windows) {
    const windowFullName = `${config.name}:${window.name}`;

    // split the rest of the panes not created during window instantiation
    const restPanes = window.panes.slice(1);
    for (const [paneIndex, _polymorphicPane] of restPanes.entries()) {
      const targetPaneName = `${windowFullName}.${paneIndex}`;

      ret.initSteps.push({
        command: "split-window",
        args: [
          `-t`, targetPaneName,
        ],
      });

      if (window.layout) {
        ret.initSteps.push({
          command: "select-layout",
          args: [
            `-t`, windowFullName,
            window.layout,
          ],
        });
      }
    }

    // now iterate all of them, including window.0, to get what we want.
    for (const [paneIndex, polymorphicPane] of window.panes.entries()) {
      const pane: PaneLatest =
        typeof(polymorphicPane) === 'object' ? polymorphicPane : { steps: [polymorphicPane]};
      const fullPaneName = `${windowFullName}.${paneIndex}`;

      ret.parallelSteps[fullPaneName] = pane.steps.map(step => {
        if (typeof(step) === 'object') {
          return step;
        }

        return [
          {
            command: 'send-keys',
            args: [
              `-t`, fullPaneName,
              step,
            ]
          },
          {
            command: 'send-keys',
            args: [
              `-t`, fullPaneName,
              "Enter"
            ]
          },
        ];
      }).flat();
    }
  }

  return ret;
}
