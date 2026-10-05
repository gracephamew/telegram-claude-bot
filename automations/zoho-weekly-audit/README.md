# Zoho weekly full audit (cloud)

Claude Code Routine that replaces the "Requires your computer" routine "Zoho vendors products weekly summary" (trig_01Rk7N6zZZqremYNpVpUSdDx).

- Routine id: trig_01SKuBEpay6SR2gFNEwM7Bge
- Schedule: `CRON_TZ=Australia/Sydney 52 6 * * 1` (Mondays 06:52 Sydney)
- Connectors needed: Slack, Zoho CRM, Zoho Books, Google Drive
- Network: `contentdw.easyweddings.com` must be allowed in the cloud environment for Section M
- Prompt: `prompt.md` (record only; editing it does not change the Routine)

## Changes from the computer version
- No local folder. Rules come from the prompt plus the 2 Drive files.
- "Same as daily" references replaced with the daily audit's rules written out in full.
- Now reads `audit-output-rules.md` and follows its two-audience routing (findings to channel, everything else DM to Grace).
- Adds known false positives, corrected K3 tax rule, query traps and the D3/T/J blockers from the daily audit.
- Tells the run to complete every section; the 05/10/2026 run skipped B, C, D, I, K, L and M4.
