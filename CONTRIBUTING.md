# Contributing to the GridKit website

This page is the short version. [AGENTS.md](AGENTS.md) and the files it links
hold the details, for people and coding agents alike. Read it before your
first change.

## Setup

You need Node 20.9 or newer, which Next.js 16 requires. Copy `.env.example` to
`.env` and set `GITHUB_TOKEN` in it (why it is needed is under
[Development](AGENTS.md#development)), then install and start the site with
the commands there.

The docs pages themselves are not in this repo: they are written in the
`gridkit` repo (see
[Relationship to the `gridkit` repo](AGENTS.md#relationship-to-the-gridkit-repo)).

## Workflow

Branch off `main`, one branch per change, and open a pull request into
`main`. The one exception is a live example that needs an unreleased
GridKit API: that branches off `development` and goes back into it (see
[Channels](AGENTS.md#channels)). Branch names and commit messages are under
[Branches and commits](AGENTS.md#branches-and-commits). The `ci` check runs
the same checks on every pull request and must pass before a merge.

## Before you open a pull request

- [ ] **Checks.** The local check sequence under
      [Standards](AGENTS.md#standards) passes, in order (the `verify` skill
      under [Where the rest lives](AGENTS.md#where-the-rest-lives) walks
      through it).
- [ ] **Rules.** You read [AGENTS.md](AGENTS.md) and the `AGENTS.md` or rule
      file for the area you changed, listed under
      [Where the rest lives](AGENTS.md#where-the-rest-lives).
- [ ] **Comments.** They describe the code as it is now, not the change. See
      [Comments](AGENTS.md#comments).
- [ ] **Commits and PR.** Conventional Commits, as under
      [Branches and commits](AGENTS.md#branches-and-commits); the PR
      description gives the end state and why it's needed.
