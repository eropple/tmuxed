# `tmuxed` #

<center><b>Because `tmux` is cool and your dev environment can be too!</b></center>

## What is `tmuxed`? ##
`tmuxed` is an application for controlling the [`tmux` terminal multiplexer](https://github.com/tmux/tmux). Unlike prior art in this space, like [`tmuxinator`](https://github.com/tmuxinator/tmuxinator) (which is cool, too!), I've chosen instead to have the application handle issuing commands to `tmux` directly. This allows for a couple of major benefits:

- input handling for panes is handled in parallel
- supports out-of-band commands; at the moment, `wait` is the primary command supported, but more could be added, including direct tmux commands.

The motivation behind building this application was as much to stretch out Deno as anything, but `tmuxed` is shipped as a single binary (albeit a large one--shrinking that's on the list, I promise!) and works just about anywhere without having to install Ruby or any other particular runtime.

## Getting `tmuxed` ##
New releases will always be on the--wait for it--[releases page](https://github.com/eropple/tmuxed/releases). I'll automatically publish releases for any platform targeted by both `tmux` and Deno; this means that there's no Windows release because there's no `tmux` target. On the other hand, I use `tmuxed` in WSL2 pretty much every day, so we're all set.

You can also grab mainline development releases from the [GitHub Actions page](https://github.com/eropple/tmuxed/actions).

## How does it work? ##
It's easy: `tmuxed go`!

Of course, you'll need to tell it what to do for that to work. `tmuxed go` can accept a configuration file as a positional parameter, e.g. `tmuxed go tmuxed-dev.yaml`, but will by default look in the current working directory for a `.tmuxed.yaml` file.

If you'd like a formal schema for what this configuration file should include, you can go `tmuxed config-schema`, or you can take a peek instead at [`example.tmuxed.yaml`](https://github.com/eropple/tmuxed/blob/main/example.tmuxed.yaml), also inlined below:

```yaml
# required
version: 1
# required
name: testproject

# a string or list of strings to be executed as shell
# commands before the tmux session is started
onStart:
  - echo "this is a start"
  - echo "I'm doing start things"
  - echo "have a \"quoted\" line"

# a string or list of strings to be executed as shell
# commands *either* after the tmux session is detached
# or is killed (I don't typically detach tmuxed sessions
# that I haven't detached via :kill-session; if you do,
# you won't want to use onClose!)
onClose:
  - echo "and now we're closing"
  - echo "we're doing close things"
  - echo "have a \"quoted\" line here, too"

# you need at least one window
windows:
# the first window will be switched to when attaching to tmux
- name: test1
  # supports all tmuxed layout formats, both named and encoded,
  # e.g. "bb62,159x48,0,0{79x48,0,0,79x48,80,0}"
  #
  # if you do `tmux list-windows` you'll get an encoded layout
  # that you can pass here.
  layout: main-vertical
  # wait time, in seconds, before input starts (useful if,
  # like me, your shell is a little bit pudgy and takes a
  # second to get ready before it takes input!)
  waitBeforeInput: 2
  # you need at least one pane, defined as either a string or an
  # object with a `steps` key.
  panes:
    - ~ # YAML 'null' means 'do nothing'; just open a standard shell in this pane
    - steps:
      - echo "I am pane Number 2"
      - pwd
      - wait: 3
      - pwd
      - wait: 3
    - steps:
      - echo "I am pane Number 3."
      - pwd
      - wait: 2
      - pwd
      - wait: 4
- name: test2
  layout: main-vertical
  waitBeforeInput: 4
  panes:
    - top
    - pwd
    - pwd
```

You can probably start to see the uses for "hey, let's run a bunch of stuff that's easy to view at a glance", right? My standard approach is to have a `dev` window and an `ops` window, both using `main-vertical` layouts that just pop up a terminal. In `dev`, I tend to run the services I'm working on in the side panes; in `ops`, one pane will be running `docker-compose`, another might be running `ngrok`, stuff like that. The possibilities are--wait for it--endless!

## Contributing ##

`tmuxed` is pretty much finished for my needs, but if you're interested in extending it for your own purposes, let's chat! Please file an issue before submitting any sweeping changes, but I'll be glad to hear from you nevertheless.
