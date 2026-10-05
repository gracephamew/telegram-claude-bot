# Slack #newproduct automation

A Claude Code Routine that watches 2 Slack channels for `#newproduct` requests and creates the product in Zoho CRM.

- Routine name: Slack #newproduct requests
- Routine id: trig_01TEXd1dgyNiwm2Zp7prW9nT
- Schedule: `CRON_TZ=Australia/Melbourne 54 7-17 * * 1-5` (hourly at :54, 07:54 to 17:54, Monday to Friday)
- Session: a fresh cloud session on every run
- Connectors needed: Slack, Zoho CRM (attach in the claude.ai Routines settings)
- Prompt: `prompt.md` in this folder. It is a record of the prompt; editing the file does not change the Routine.

## Changes from the Chat scheduled task

- Schedule went from every 10 minutes to hourly. Routines have a 1 hour minimum interval.
- Tool names now use `mcp__Slack__*` and `mcp__Zoho_CRM__*` instead of the Chat connector ids.
- The workspace files `/Zoho CRM aa/Zoho Agents/...` are not reachable from a cloud session, so the prompt no longer loads them.
- Each run starts with no memory, so Stage 3 checks Zoho for an existing product with the same name before creating one.
- The 2 minute product code check no longer waits. The run re-checks at the end and posts the link either way.
