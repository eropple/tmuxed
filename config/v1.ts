import {
  Static,
  Type
} from '../deps.ts';

export const IdentifierNameV1 = Type.String({
  description: "The name to use, inside of tmux, for the windows and panes of this session.",
  pattern: "[a-zA-Z0-9\_\-]",
});
export type IdentifierNameV1 = Static<typeof IdentifierNameV1>;

export const CWDV1 = Type.Optional(Type.String({}));
export type CWDV1 = Static<typeof CWDV1>;


export const WaitDirectiveV1 = Type.Object({
  wait: Type.Integer({ description: "Time to wait, in seconds (passed to 'sleep' builtin)." }),
});
export type WaitDirectiveV1 = Static<typeof WaitDirectiveV1>;

export const DirectiveV1 = Type.Union([
  WaitDirectiveV1,
]);
export type DirectiveV1 = Static<typeof DirectiveV1>;

export const PaneV1 = Type.Object({
  steps: Type.Array(
    Type.Union([
      Type.String({ description: "A statement to be executed in the pane's context (using the login shell). Single statement only. An 'enter' key will be appended." }),
      DirectiveV1,
    ]),
  { minItems: 1, description: "The set of steps to be run in this tmux pane." }),
});
export type PaneV1 = Static<typeof PaneV1>;


export const WindowV1 = Type.Object({
  name: IdentifierNameV1,
  cwd: CWDV1,
  layout: Type.Optional(Type.String()),
  waitBeforeInput: Type.Optional(Type.Integer({
    description: "A timespan, in seconds, to wait after creating a pane before beginning to send input to it.",
  })),
  panes: Type.Array(
    Type.Union([
      Type.Null(),
      Type.String(),
      PaneV1,
    ]),
    { minItems: 1 },
  ),
});
export type WindowV1 = Static<typeof WindowV1>;

export const ConfigV1 = Type.Object({
  version: Type.Integer({
    default: 1
  }),
  name: IdentifierNameV1,
  cwd: CWDV1,
  onStart: Type.Optional(
    Type.Union([
      Type.String({ description: "A bash script to be inlined before any tmux commands are run." }),
      Type.Array(Type.String(), { description: "A series of statements, one per line, to be inlined before any tmux commands are run."})
    ])
  ),
  onClose: Type.Optional(
    Type.Union([
      Type.String({ description: "A bash script to be inlined after tmux has finished running." }),
      Type.Array(Type.String(), { description: "A series of statements, one per line, to be inlined after tmux has finished running."})
    ])
  ),
  windows: Type.Array(WindowV1)
})
export type ConfigV1 = Static<typeof ConfigV1>;
