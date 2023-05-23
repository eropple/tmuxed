OUTDIR ?= "/tmp"

cache-deps:
	deno cache --lock=deps-lock.json --lock-write --import-map=import_map.json deps.ts

deps:
	deno cache --lock=deps-lock.json deps.ts

build-local:
	./_build/build-local.bash

build-linux-x86_64: deps
	$(eval OUTFILE ?= tmuxed-linux-x86_64)
	deno compile \
		--unstable \
		--allow-net \
		--allow-read \
		--allow-run \
		--allow-write \
		--allow-env \
		--target=x86_64-unknown-linux-gnu \
		--output=${OUTDIR}/${OUTFILE} \
		./entry-point.ts

build-macos-x86_64: deps
	$(eval OUTFILE ?= tmuxed-macos-x86_64)
	deno compile \
		--unstable \
		--allow-net \
		--allow-read \
		--allow-run \
		--allow-write \
		--allow-env \
		--target=x86_64-apple-darwin \
		--output=${OUTDIR}/${OUTFILE} \
		./entry-point.ts

build-macos-aarch64: deps
	$(eval OUTFILE ?= tmuxed-macos-aarch64)
	deno compile \
		--unstable \
		--allow-net \
		--allow-read \
		--allow-run \
		--allow-write \
		--allow-env \
		--target=aarch64-apple-darwin \
		--output=${OUTDIR}/${OUTFILE} \
		./entry-point.ts

build-windows-x86_64: deps
	$(eval OUTFILE ?= tmuxed-windows-x86_64)
	deno compile \
		--unstable \
		--allow-net \
		--allow-read \
		--allow-run \
		--allow-write \
		--allow-env \
		--target=x86_64-pc-windows-msvc \
		--output=${OUTDIR}/${OUTFILE} \
		./entry-point.ts

build-completions: build-local
	mkdir -p ./share/fish/vendor_completions.d ./share/bash/bash_completion.d ./share/zsh/site-functions
	./bin/tmuxed completions fish > ./share/fish/vendor_completions.d/tmuxed.fish
	./bin/tmuxed completions bash > ./share/bash/bash_completion.d/tmuxed.bash
	./bin/tmuxed completions zsh > ./share/zsh/site-functions/tmuxed.zsh
