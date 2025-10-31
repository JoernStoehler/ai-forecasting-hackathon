<!-- ACQUIRE PROJECT OWNER APPROVAL BEFORE EDITING THIS FILE -->

# AI Forecasting Hackathon

Submitted by: Jörn Stöhler  
[Code](https://github.com/JoernStoehler/ai-forecasting-hackathon) | [Documentation](https://joernstoehler.github.io/ai-forecasting-hackathon/) | [WebApp](https://ai-forecasting-hackathon.joernstoehler.com) | [Hackathon](https://apartresearch.com/sprints/the-ai-forecasting-hackathon-2025-10-31-to-2025-11-02)

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
5. GPT-5's prose is not that great. Rumors say Claude series models are better at prose, and prompting may again help. We will do some trial and error until we nail one or more acceptable writing styles for the visualizations.

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

## Development Setup

1. Fork the repository on GitHub.
2. Open a GitHub Codespace from your fork.
3. Run `bash scripts/setup-dev-environment.sh --interactive` and follow the interactive instructions in a second terminal tab.

The main files of importance are:
- `AGENTS.md`: Developer Documentation (written for both AI and human developers)
- `docs/`: User & Project Documentation, mkdocs
- `scripts/`:
  - `setup-dev-environment.sh --interactive`: Guides you through setup
  - `run-docs.sh --watch`: Local docs server
  - `run-frontend.sh --watch`: Local WebApp server
  - `run-backend.sh --no-watch`: Local Backend server
  - `tunnel.sh --start/--stop`: Exposes local frontend and backend via cloudflared to our domain
  - `run-example.sh --example <file>`: Runs a specific expert example end-to-end using our agent scaffolding; assumes the local backend server is running
- `frontend/`: WebApp source code, usual React stuff
- `backend/`: Backend source code, includes agent scaffolding, usual 
- `materials/`:
  - `code-snippets/`: Code Material
  - `expert-examples/`: Expert Example Material
  - `expert-model/`: Expert Model Material
  - `prompts/`: GPT-5 Prompt Material

Various config files that serve as source of truth:
- `.gitignore`
- `.editorconfig`
- `frontend/`, `backend/`
  - `package.json`
  - `tsconfig.json`
- `eslint.config.js`
- `prettier.config.js`
- `mkdocs.yml`
