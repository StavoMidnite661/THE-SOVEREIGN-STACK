---
description: Hand off tasks between AI sessions (Antigravity, Kilo Code, etc.)
---

# AI Agent Handoff Protocol

When coordinating between multiple AI sessions (e.g., Antigravity, Kilo Code, Claude), use this protocol to ensure seamless context transfer.

## Handoff Document Template

Create this document when transitioning a task to another AI agent:

```markdown
# TASK HANDOFF: [Task Name]

## Current Status
- **Phase:** [PLANNING | EXECUTION | VERIFICATION]
- **Completion:** [X%]
- **Blocked On:** [What's preventing progress]

## Context Summary
[2-3 sentence summary of the work done]

## Files Modified
| File | Change Type | Status |
|------|-------------|--------|
| [path] | [added/modified/deleted] | [complete/partial] |

## Next Steps
1. [Immediate next action]
2. [Following action]
3. [etc.]

## Specialist Assignment
**Recommended Cabinet Member:** [Name from AGENT CABINET.MD]
**Engagement Template:**
[Pre-filled template from engage-cabinet.md]

## Technical Context
- **Key Interfaces:** [List critical interfaces]
- **Dependencies:** [List dependencies]
- **Constraints:** [List constraints]

## Validation Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

---

## Handoff Triggers

Use this workflow when:
1. Current session is ending
2. Task requires specialist expertise
3. Parallel workstreams are needed
4. Review/validation by different perspective needed

---

## Session-Specific Instructions

### For Kilo Code
- Reference: `.agent/AGENT CABINET.MD` for specialist roles
- Reference: `.agent/workflows/engage-cabinet.md` for templates
- Check: `C:\Users\GMCon\.gemini\antigravity\brain\[conversation-id]\task.md` for progress

### For Antigravity (This Agent)
- Update task.md immediately upon receiving handoff
- Review walkthrough.md for prior context
- Validate files mentioned in handoff document

### For Other Agents
- Read the AGENT CABINET.MD to understand available roles
- Follow the engagement templates in engage-cabinet.md
- Document all changes in the handoff format

---

## Quick Handoff Commands

When ending a session, create a handoff with:
```
Create a handoff document for [TASK NAME] following the protocol in 
.agent/workflows/ai-handoff-protocol.md

Current status: [STATUS]
Next specialist: [CABINET MEMBER]
```

When receiving a handoff:
```
Continue from handoff document at [PATH].
I am acting as [CABINET MEMBER ROLE].
```
