import type { DiagramStep } from "../components/InteractiveDiagram";

/**
 * Step-through data for all 8 visual guides.
 *
 * Each diagram is decomposed into 4–6 steps that reveal the diagram
 * progressively with explanatory text. Step 0 is always the overview.
 */

export interface DiagramStepData {
    diagramId: string;
    steps: DiagramStep[];
}

export const diagramStepData: DiagramStepData[] = [
    {
        diagramId: "learning-evidence-loop",
        steps: [
            {
                step: 1,
                label: "Start with a question",
                description:
                    "Every learning cycle begins with a concrete question. The question defines what evidence you need and which sources are relevant. Without a clear question, you cannot measure whether you learned anything.",
            },
            {
                step: 2,
                label: "Gather primary sources",
                description:
                    "Collect dated, attributable primary sources — documentation, research papers, official specifications. Secondary sources and unsupported claims are excluded. Every source must have a retrieval date.",
            },
            {
                step: 3,
                label: "Form a claim",
                description:
                    "Synthesize what the sources say into a testable claim. The claim must be specific enough to verify and broad enough to be useful. Ambiguous claims produce ambiguous evidence.",
            },
            {
                step: 4,
                label: "Verify against evidence",
                description:
                    "Check the claim against each source. Does the source support, contradict, or remain ambiguous about the claim? Record the relationship explicitly — unsupported confidence is the most common failure mode.",
            },
            {
                step: 5,
                label: "Update or retire",
                description:
                    "If evidence supports the claim, publish it with a freshness date. If evidence contradicts it, revise or retire it. Stale claims that outlive their sources are worse than no claims at all.",
            },
        ],
    },
    {
        diagramId: "grounded-answer-workflow",
        steps: [
            {
                step: 1,
                label: "Receive the question",
                description:
                    "The workflow starts when a question arrives. The question may come from a human, an agent, or a system. The first job is to determine what kind of answer is needed — factual, procedural, comparative, or diagnostic.",
            },
            {
                step: 2,
                label: "Search for evidence",
                description:
                    "Query primary sources — documentation, code repositories, issue trackers, runbooks. The search must be reproducible: same query, same sources, same date should return the same evidence.",
            },
            {
                step: 3,
                label: "Evaluate source quality",
                description:
                    "Not all sources are equal. Check recency, authority, and relevance. A source from last week is better than one from last year. An official document beats a forum post. Reject sources that cannot be dated or attributed.",
            },
            {
                step: 4,
                label: "Construct the answer",
                description:
                    "Build the answer from evidence, not from memory. Every factual claim must cite at least one source. The answer must distinguish between what the evidence supports and what remains uncertain.",
            },
            {
                step: 5,
                label: "Verify and deliver",
                description:
                    "Review the answer: are all claims sourced? Are sources current? Is uncertainty clearly marked? Only then deliver the answer. The evidence trail stays with the answer for future verification.",
            },
        ],
    },
    {
        diagramId: "safe-agent-loop",
        steps: [
            {
                step: 1,
                label: "Receive the work order",
                description:
                    "Every agent run starts with a bounded work order — a specific task with explicit scope, permissions, and success criteria. Unbounded agents are unsafe by design.",
            },
            {
                step: 2,
                label: "Plan within guardrails",
                description:
                    "The agent plans its approach within declared guardrails: allowed tools, maximum steps, cost ceiling, and required approvals. The plan must be verifiable — a human should be able to read it and predict what the agent will do.",
            },
            {
                step: 3,
                label: "Execute with tool calls",
                description:
                    "The agent executes its plan, calling tools as needed. Each tool call is logged with its inputs, outputs, and timing. Tools that modify state require explicit confirmation.",
            },
            {
                step: 4,
                label: "Verify each step",
                description:
                    "After each tool call, the agent verifies the result against expectations. Unexpected outputs trigger a review gate. The agent must not proceed past a failed verification without human input.",
            },
            {
                step: 5,
                label: "Produce evidence package",
                description:
                    "The agent produces a complete evidence package: what it did, what tools it called, what outputs it received, and what decisions it made. The package is the basis for human review and audit.",
            },
            {
                step: 6,
                label: "Human review gate",
                description:
                    "The evidence package passes through a human review gate before any permanent changes are applied. The human can approve, reject, or request revision. No irreversible action happens without this gate.",
            },
        ],
    },
    {
        diagramId: "prompt-contract",
        steps: [
            {
                step: 1,
                label: "Define the role",
                description:
                    "Start by defining who the model is in this interaction — a researcher, a reviewer, a coder, a teacher. The role sets expectations for tone, depth, and boundaries.",
            },
            {
                step: 2,
                label: "State the task",
                description:
                    "Describe exactly what you want the model to do. Be specific about the output format, length, and level of detail. Vague tasks produce vague results.",
            },
            {
                step: 3,
                label: "Provide context",
                description:
                    "Supply the background the model needs — relevant facts, constraints, examples, and references. Context is what turns a generic response into a useful one.",
            },
            {
                step: 4,
                label: "Set success criteria",
                description:
                    "Define what a good answer looks like. Include acceptance criteria: must cite sources, must be under 500 words, must include a code example. Without criteria, you cannot evaluate the output.",
            },
            {
                step: 5,
                label: "Specify the output contract",
                description:
                    "Define the exact structure of the response — JSON schema, markdown format, required sections. A clear output contract makes the response machine-readable and human-verifiable.",
            },
        ],
    },
    {
        diagramId: "provider-selection",
        steps: [
            {
                step: 1,
                label: "Define your requirements",
                description:
                    "Start with your actual needs: latency budget, throughput, cost ceiling, capability requirements, compliance constraints. Provider selection without requirements is brand preference, not engineering.",
            },
            {
                step: 2,
                label: "Map capabilities to providers",
                description:
                    "Match your requirements against each provider's documented capabilities. Use official documentation and published benchmarks — not marketing claims or anecdotal reports.",
            },
            {
                step: 3,
                label: "Run comparative evaluations",
                description:
                    "Test providers against your actual workloads using the same prompts, the same evaluation criteria, and the same success metrics. Cross-provider comparisons are only valid when the test is identical.",
            },
            {
                step: 4,
                label: "Evaluate cost and reliability",
                description:
                    "Compare pricing models, rate limits, SLA terms, and historical reliability data. The cheapest provider that fails your latency budget is not cheaper — it is unusable.",
            },
            {
                step: 5,
                label: "Document and review",
                description:
                    "Record your selection decision with dated evidence. Revisit periodically — provider capabilities and pricing change. A decision made six months ago may no longer be optimal.",
            },
        ],
    },
    {
        diagramId: "tool-trust-boundaries",
        steps: [
            {
                step: 1,
                label: "Classify the tool",
                description:
                    "Every tool falls into one of three trust tiers: read-only (safe), read-write (requires confirmation), or destructive (requires human approval). Classification is the first security decision.",
            },
            {
                step: 2,
                label: "Define the data boundary",
                description:
                    "What data can the tool access? What data must it never see? Define explicit allowlists and denylists. A tool that can read everything is a tool that can leak everything.",
            },
            {
                step: 3,
                label: "Set the permission scope",
                description:
                    "Grant the minimum permissions the tool needs — no more. If a tool only needs to read one table, do not give it database admin. Principle of least privilege applies to AI tools exactly as it does to human users.",
            },
            {
                step: 4,
                label: "Add verification gates",
                description:
                    "Insert verification checks before and after tool calls. Before: is this call within scope? After: did the output match expectations? Failed verifications halt the workflow.",
            },
            {
                step: 5,
                label: "Audit every call",
                description:
                    "Log every tool invocation with its inputs, outputs, timing, and authorization decision. The audit trail must be complete enough to reconstruct what happened and why.",
            },
        ],
    },
    {
        diagramId: "multi-agent-handoff",
        steps: [
            {
                step: 1,
                label: "Define agent roles",
                description:
                    "Each agent in a multi-agent system has a specific role with bounded responsibilities. Roles must not overlap in ways that create ambiguity about who owns a decision.",
            },
            {
                step: 2,
                label: "Establish the handoff contract",
                description:
                    "Define exactly what data passes between agents: the payload schema, required fields, optional fields, and validation rules. A handoff without a schema is a handoff that will break.",
            },
            {
                step: 3,
                label: "Validate before transfer",
                description:
                    "The sending agent validates its output against the handoff contract before transferring. The receiving agent validates the input before processing. Double validation catches drift on either side.",
            },
            {
                step: 4,
                label: "Transfer with traceability",
                description:
                    "Every handoff is logged with a unique ID, timestamp, sender, receiver, and payload digest. The trace allows you to reconstruct the full chain of custody for any decision.",
            },
            {
                step: 5,
                label: "Handle handoff failures",
                description:
                    "Define what happens when a handoff fails: retry with backoff, escalate to a human, or abort the workflow. Unhandled handoff failures are the most common cause of silent multi-agent bugs.",
            },
        ],
    },
    {
        diagramId: "content-freshness-release",
        steps: [
            {
                step: 1,
                label: "Detect source drift",
                description:
                    "Monitor primary sources for changes. When a source updates, flag every piece of content that cites it. Source drift is the root cause of stale content — you cannot fix what you do not detect.",
            },
            {
                step: 2,
                label: "Assess impact",
                description:
                    "For each flagged content item, determine whether the source change affects the claims. A typo fix may require no action. A deprecated API requires immediate revision.",
            },
            {
                step: 3,
                label: "Update or retire content",
                description:
                    "Revise affected content to reflect the new source state, or retire it if it is no longer relevant. Every update records the new source version and the date of review.",
            },
            {
                step: 4,
                label: "Review and approve",
                description:
                    "Updated content passes through human review. The reviewer checks that claims still match sources, that no new errors were introduced, and that the freshness date is correct.",
            },
            {
                step: 5,
                label: "Release with attestation",
                description:
                    "Publish the updated content with a freshness attestation: what sources were checked, when they were checked, and who approved the release. The attestation is the proof that the content is current.",
            },
        ],
    },
    {
        diagramId: "agent-orchestration",
        steps: [
            {
                step: 1,
                label: "Classify the request",
                description:
                    "Every incoming request hits the router agent first. The router classifies intent — build, review, investigate, operate, refactor, test, or document — and selects the appropriate specialist agent. Misclassification is the most common failure mode in multi-agent systems.",
            },
            {
                step: 2,
                label: "Dispatch to specialist",
                description:
                    "The specialist agent receives the task with a bounded work order: explicit scope, allowed tools, cost ceiling, and success criteria. Each specialist has a narrow domain — a coder does not review, a reviewer does not investigate.",
            },
            {
                step: 3,
                label: "Execute with guardrails",
                description:
                    "The specialist executes within its guardrails. Tool calls are logged with inputs, outputs, and timing. State-modifying operations require explicit confirmation. The agent produces a complete evidence package of everything it did.",
            },
            {
                step: 4,
                label: "Independent review",
                description:
                    "Every output passes through an independent reviewer agent — running on a different model family than the specialist. The reviewer checks correctness, security, style, and test coverage. This cross-model review catches blind spots that same-model review misses.",
            },
            {
                step: 5,
                label: "Assemble and deliver",
                description:
                    "Approved outputs are assembled into a coherent response. The human receives the result with a complete audit trail: which agents were involved, what decisions they made, and what evidence supports each conclusion.",
            },
        ],
    },
    {
        diagramId: "cost-and-capacity-management",
        steps: [
            {
                step: 1,
                label: "Estimate workload cost",
                description:
                    "Start with a workload estimate: expected request volume, average token count per request, and model pricing. Multiply tokens by rate to get a cost projection. An estimate within 20% of actual is good enough to begin — you will refine it with real data.",
            },
            {
                step: 2,
                label: "Allocate budget",
                description:
                    "Set a budget based on the cost estimate plus a buffer for variance. The budget is a hard ceiling, not a suggestion. Every agent run checks remaining budget before starting. A run that would exceed budget is queued, not executed.",
            },
            {
                step: 3,
                label: "Provision capacity",
                description:
                    "Deploy endpoints with the right quota for your workload. Under-provisioning causes throttling and timeouts. Over-provisioning wastes money. Capacity planning is a continuous process — review quotas monthly against actual usage.",
            },
            {
                step: 4,
                label: "Monitor and alert",
                description:
                    "Real-time monitoring tracks spend against budget. Alerts fire at warning thresholds (80% of budget) and critical thresholds (95%). The monitoring dashboard shows per-model, per-agent, and per-run cost breakdowns.",
            },
            {
                step: 5,
                label: "Apply spend brakes",
                description:
                    "When spend hits the critical threshold, automated spend brakes engage: new runs are halted, running operations complete but no new ones start, and the human operator is notified. Spend brakes are the last line of defense — they must be tested regularly.",
            },
            {
                step: 6,
                label: "Audit and adjust",
                description:
                    "Periodically audit actual spend against estimates. Adjust budgets, quotas, and model choices based on real data. A model that looked cost-effective on paper may be expensive in practice. Continuous adjustment is the difference between controlled spend and surprise bills.",
            },
        ],
    },
];

/** Lookup steps by diagram ID. Returns empty array for unknown IDs. */
export function getDiagramSteps(diagramId: string): DiagramStep[] {
    return diagramStepData.find((d) => d.diagramId === diagramId)?.steps ?? [];
}
