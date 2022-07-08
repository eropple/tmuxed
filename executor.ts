import { Shlex, sleep } from "./deps.ts";
import { TmuxPlan, TmuxPlanStep } from "./planner.ts";

async function doExec(cmd: string[]): Promise<void> {
  const process = Deno.run({
    cmd,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'null',
  });

  const status = await process.status();

  if (!status.success) {
    throw new Error(`Error when running:\n\n${cmd.join(' ')}\n\nProcess failed with code: ${status.code}.`);
  }
}

async function execTmuxStep(step: TmuxPlanStep): Promise<void> {
  const cmd = [
    "tmux",
    step.command,
    ...step.args,
  ];

  const result = await doExec(cmd);

  // prompt("hit enter to continue.");

  return result;
}

async function attachToSession(sessionName: string): Promise<void> {
  const attachProcess = Deno.run({
    cmd: ["tmux", "attach-session", "-t", sessionName],

    stderr: 'inherit',
    stdout: 'inherit',
    stdin: 'inherit',
  });

  await attachProcess.status();
}

export async function executePlan(plan: TmuxPlan): Promise<boolean> {
  for (const onStartLine of plan.onStart) {
    console.log(`onStart >> ${onStartLine}`);
    await doExec(Shlex.split(onStartLine));
  }

  try {
    // we need a session to attach to
    await execTmuxStep(plan.newSession);

    for (const step of plan.initSteps) {
      await execTmuxStep(step);
    }

    const attachAwaiter = attachToSession(plan.sessionName);
    
    await Promise.all(
      Object.values(plan.parallelSteps).map((paneSteps) => (async () => {
      for (const step of paneSteps) {
        if ('command' in step) {
          await execTmuxStep(step);
        } else if ('wait' in step) {
          await sleep(step.wait);
        }
      }
    // }
      })()),
    );

    for (const step of plan.finishSteps) {
      await execTmuxStep(step);
    }

    await attachAwaiter;

    for (const onCloseLine of plan.onClose) {
      console.log(`onClose >> ${onCloseLine}`);
      await doExec(Shlex.split(onCloseLine));
    }
  } catch (err) {
    console.error("Caught an error; trying to kill-session and will rethrow.", err);

    await execTmuxStep({
      command: 'kill-session',
      args: [`-t`, plan.sessionName],
    });

    throw err;
  }

  
  return true;
}
