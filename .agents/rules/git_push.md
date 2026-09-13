---
trigger: always_on
---

## Commit Message Convention

All Git commit messages **must** follow this format:

```text
<type>(<name_of_the_folder_changed>): <message>
```

### Examples

```text
feat(api): created admin module
feat(app): added auth screens
feat(dashboard): created user dashboard
fix(api): fixed authentication endpoint
fix(app): fixed login validation
refactor(dashboard): simplified user dashboard components
```

### Rules

* `<type>` describes the nature of the change, such as:

  * `feat` — new functionality
  * `fix` — bug fix
  * `refactor` — code restructuring without changing behavior
  * `docs` — documentation changes
  * `test` — test-related changes
  * `chore` — maintenance/configuration changes
* `<name_of_the_folder_changed>` must be the primary top-level folder affected by the commit.
* Keep the message concise and describe **what was changed**.
* Use lowercase for the type, folder name, and message.
* Do not use generic commit messages such as `updated code`, `changes`, `fixed stuff`, or `minor changes`.
* If multiple folders are changed, use the folder that represents the **primary purpose of the commit**.
* If changes are unrelated and belong to different areas, create separate commits whenever practical.
* The agent must follow this convention whenever it creates a Git commit.
