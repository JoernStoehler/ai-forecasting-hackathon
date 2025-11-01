<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Forecasting Hackathon

Submitted by: Jörn Stöhler  
[Code](https://github.com/JoernStoehler/ai-forecasting-hackathon) | [Documentation](https://joernstoehler.github.io/ai-forecasting-hackathon/) | [WebApp](https://ai-forecasting-hackathon.joernstoehler.com) | [Hackathon](https://apartresearch.com/sprints/the-ai-forecasting-hackathon-2025-10-31-to-2025-11-02)

<!-- TODO: replace the GPT-5 model with our Gemini model; replace the backend agent with a LLM call architecture -->
<!-- TODO: verify the Documentation link still reflects current stack (we may no longer publish MkDocs) -->

## Overview

> This event focuses on developing predictive models and forecasting methodologies to anticipate AI development timelines and capability advancements.  
> -- Hackathon description

The central idea of this submitted project is to formalize the informal expectations of an expert (me) on the topic of AI x-risk into a probabilistic model that allows for  
- **detailing** the full forecast trajectory
- **conditioning** on observations
- **intervening** on policy choices and latent variables
- **sampling** from posteriors
- **extending** with new expert-informed submodels
- **visualizing** the results in a layman-friendly way

Such an ask is ambitious. 

The level of detail we aim for is not achievable with hand-written variable spaces, but it is achievable by human experts in conversations. Similarly, conditioning is computationally expensive for formal methods, yet human experts can wing it and do approximate, biased Bayesian updates subconsciously. Interventions require that their detail level is still causally represented, which is hard to fully formalize in advance for all conceivable interventions, and human experts instead translate concrete intervention families into an adapted model on the fly. Extending formal models requires human expert work, and a flexible formal language that encourages good programming practices. Visualization methods for high dimensional heterogenous variable spaces are hard to do, but human experts can ad-hoc present graphs and text explanations.

If we consider modern AI, we see that it basically achieves all our asks at once for conventional world modeling already. GPT-5 (and other models) can, if scaffolded properly, make detailed forecasts, condition on observations, intervene on variables, sample from posteriors, extend their reasoning with new submodels, and visualize results in layman-friendly ways. I'd dare to say they even exceed human expert capabilities, and additionally beat human experts in speed, cost and determinism/reproducibility.
Also, if GPT-5 falls short for our project, perhaps GPT-6 will not.

I do think that GPT-5 currently fails a multitude of relevant capabilities that we require for this project. However, I think we can compensate.
1. GPT-5 is not a human expert on AI x-risk. Despite having read the canonical sources, they haven't been learned and incorporated into GPT-5's world model on a deep enough level that it can extrapolate correctly to the unusual out-of-distribution scenarios we must forecast. We can compensate by providing GPT-5 with expert-written background material that presents the expert model, and presents correct reasoning chains (i.e. inferences) made with the model, as a sort of anchor/support points that GPT-5 can use when extrapolating.
2. GPT-5's world model was built via training, and while in-context learning is a major part of how GPT-5 decompresses its world model, prompting may not interface with GPT-5's cognition in the same way. Worded differently: GPT-5's forecasting abilities may be represented in circuits that load/utilize factual and procedural knowledge from its weights, and prompts are not loaded in the same way. There isn't really a sophisticated way to deal with this potential issue, except empirically testing and iterating on prompt design, to see if we can squeeze our human expert model into GPT-5's cognition.
3. GPT-5 may be biased in inhuman, hard-to-notice ways when it comes to inferencing and conditioning and intervening. We can check if GPT-5 behaves similarly-enough to a human expert by fuzzing inputs (e.g. creating a layman-written input dataset). We can adjust prompts to reduce irrationality, but there's no established technique for guiding GPT-5 well here, except trial-and-error. Additional tools such as a CAG or prepared code files can help here, similar to how human experts rely on computable models to guide their forecasting reasoning.
4. GPT-5's coding abilities are less reliable than human experts. We can compensate by providing code snippets for a select array of submodels that GPT-5 may have need for, e.g. by querying what submodels a human expert ever took a look at or would consult for various requests. Whenever we notice that GPT-5 can not provide a correct code snippet without expert feedback, we add a corrected version of said snippet to the library.
5. GPT-5's prose is not that great. Rumors say Claude series models are better at prose, and prompting may again help. We will do some trial and error until we nail one or more 

With these compensations in place, I believe we can get GPT-5 with scaffolding to act as a human expert on AI x-risk forecasting, and leverage its capabilities to achieve all our asks at once.

## Project Components

The project consists of the following components:

- **Project Documentation**: We maintain a record of what we did (CHANGELOG, ADRs, failed experiments, git history) so that future experiments can learn from our process.
- **Expert Model Material**: An expert-written document that outlines how to forecast AI x-risk. We iterate by doing human writing, AI review, and checks on prepared forecast requests.
- **Expert Example Material**: We provide expert-made inferences/forecasts, as a form of support/anchor point for GPT-5's reasoning. We also use part of the material for testing, e.g. to check if GPT-5 can replicate expert reasoning given the materials and prompts.
- **GPT-5 Prompt Material**: A human-written document that provides context and procedural knowledge to GPT-5 on how to carry out the work we want it to do. This covers everything outside the forecasting itself, e.g. workflows, writing style, coding, information about the human's GUI, etc.
- **Code Material**: A set of symbolic calculations of interest, e.g. simple SDE simulations, that GPT-5 can ad-hoc adapt and run, instead of having to approximate their results using textual reasoning only.
- **Agent Scaffolding**: Provides GPT-5 with the ability to run tools such as code executing, reasoning chains, loading materials instead of having all in context at once, and populating the user interface. We may explore using scaffolding that is faster e.g. a single- or multi-step LLM chain (e.g. history -> reasoning -> output read and code calls -> read output -> reasoning -> output history calls)
- **WebApp**: A user interface that responds to forecast requests. We have yet to decide what requests to support and in what format. Candidate ideas are:
  - One-shot question-answer pairs without iteration
  - A conversational chat, where the agent serves as a forecasting expert
  - A collaborative trajectory inference, in a roleplay format, where the user acts as one decision maker in particular and the agent samples an intervened forecast trajectory over a short time interval, until both together have filled out a full forecast trajectory  

  Overall, the basic design is to have a GUI with one or more modes, that result in different materials and scaffolding, that the user and agent then populates interactively in alternating turns.
- **User Documentation**: Probably a few screenshots on GitHub Pages and a youtube video.
- **Developer Documentation**: To enable extensions, especially during our own development, we maintain a documentation on how to refactor and extend the project's different components.

## Future Work

None planned yet.

## Tech Stack (Summary)

<edit>
- Frontend: Vite + React 19 + TypeScript, single-page app rooted in `App.tsx` with UI logic under `components/`.
- AI Runtime: Gemini 2.5 Flash via `@google/genai`; JSON schema enforcement lives in `services/geminiService.ts`.
- Data & Types: Timeline seed data in `metadata.json`, shared TypeScript contracts in `types.ts` and constants in `constants.ts`.
- Tooling: Codex CLI for auth, ripgrep for search, Vibe Kanban (`npm run vk`) for worktree orchestration; all provisioned through `npm run provision`.
- Deployment: Gemini Apps handles hosting and attaches API keys per end-user session—no custom backend in this MVP.
</edit>

## Quick Start

<edit>
Minimal reproduction requires Node >= 20 and npm inside the GitHub Codespace.

The `.devcontainer/devcontainer.json` image bootstraps a Codespace and automatically runs `npm run provision`. For manual shells, follow the steps below.

1) Install JavaScript dependencies:

```
npm install
```

2) Provision development tooling (installs `ripgrep` via `apt-get` and the `codex` CLI via `npm install -g`; the script will prompt for sudo inside the Codespace):

```
npm run provision
```

   - Optional: populate Codespaces secrets so provisioning can restore them automatically:
     - `CODEX_AUTH_JSON_B64` – base64-encoded `~/.codex/auth.json`
     - `ENV_LOCAL_B64` – base64-encoded project `.env.local`
   - Provisioning overwrites `~/.codex/config.toml` with repo defaults; tweak `scripts/provision-tools.sh` if you want to change them.
   - Create each value with `base64 -w0 < file` (or `base64 | tr -d '\n'` on macOS).

3) Authenticate the Codex CLI (browser login + localhost callback):

```
codex
```

Follow the browser flow, then `curl` the `http://localhost:...` URL you are redirected to in order to finish the handshake.

4) Add credentials for local runs by creating `.env.local` with your Gemini API key:

```
echo "API_KEY=<your key>" >> .env.local
```

5) Start the dev server:

```
npm run dev
```

Run `npm run vk` if you need the Vibe Kanban harness on port 3000.

Before handing off changes, make sure strict type-checking and the production build pass:

```
npx tsc --noEmit
npm run build
```

Production deploys through Gemini Apps—end users automatically receive managed API access and only need to open the shared app link.

If secrets are absent, provisioning preserves existing credential files and creates `.env.local` with `API_KEY=PLACEHOLDER` so you remember to fill it manually.
</edit>

## Repository Layout

<edit>
- `App.tsx`, `index.tsx`, `index.html`: React entrypoints rendered by Vite.
- `components/`: Presentational + interactive pieces of the timeline UI.
- `services/geminiService.ts`: Thin client for Gemini 2.5 Flash with JSON schema enforcement.
- `constants.ts`, `types.ts`, `metadata.json`: Shared configuration, type definitions, and seed timeline data.
- `scripts/provision-tools.sh`: One-time tooling bootstrap run via `npm run provision`.
- `dist/`: Generated assets after `npm run build` (ignored in source control if not needed).
- `README.md`, `AGENTS.md`: Source of truth for onboarding and conventions.
- `vite.config.ts`, `tsconfig.json`, `package.json`: Build/toolchain configuration.
</edit>

<edit>
## Gemini Integration

This MVP does not ship a custom backend API. All forecasting data flows directly between the React app and Gemini:

- `services/geminiService.ts` calls `ai.models.generateContent` on Gemini 2.5 Flash with a JSON schema that enforces the event structure returned to the UI.
- Timeline metadata lives client-side in `metadata.json`; the app merges Gemini responses into local state.
- If we ever reintroduce a backend (for persistence or key management), document the endpoints here.
</edit>
