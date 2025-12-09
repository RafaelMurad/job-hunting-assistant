/* eslint-disable no-console */
/**
 * UX Data Seed Script
 *
 * Seeds the database with initial UX research data from /docs/ux/
 * Run with: npx tsx prisma/seed-ux.ts
 */

import { PrismaClient, UxSeverity, UxEffort, UxStatus } from "@prisma/client";

const prisma = new PrismaClient();

// =============================================================================
// PERSONAS
// =============================================================================

const personas = [
  {
    name: "Alex the Active Seeker",
    type: "primary",
    description:
      "Recently laid off tech professional actively searching for new opportunities. Applies to 5-10 jobs per week and needs to customize CV for each role.",
    goals: JSON.stringify([
      "Find new job within 3 months",
      "Target roles matching current skills",
      "Stand out from other candidates",
      "Track all applications efficiently",
    ]),
    frustrations: JSON.stringify([
      "Writing cover letters from scratch is time-consuming",
      "Hard to know if skills match job requirements",
      "Loses track of which jobs applied to",
      "CV formatting inconsistent across applications",
    ]),
    behaviors: JSON.stringify([
      "Checks job boards daily",
      "Uses multiple devices (laptop + phone)",
      "Prefers quick actions over detailed setup",
      "Values time savings over customization",
    ]),
    status: UxStatus.VALIDATED,
  },
  {
    name: "Sam the Strategic Optimizer",
    type: "secondary",
    description:
      "Employed professional passively looking for better opportunities. Only applies to perfect-match roles and spends significant time per application.",
    goals: JSON.stringify([
      "Only apply to roles with 80%+ match",
      "Create highly tailored applications",
      "Track and optimize conversion rate",
      "Build portfolio of application materials",
    ]),
    frustrations: JSON.stringify([
      "Generic cover letters feel low-effort",
      "Hard to assess job fit objectively",
      "Want to learn from past applications",
      "Need professional-looking CV templates",
    ]),
    behaviors: JSON.stringify([
      "Researches companies before applying",
      "Spends 30+ minutes per application",
      "Uses primarily desktop for editing",
      "Keeps detailed notes on each application",
    ]),
    status: UxStatus.VALIDATED,
  },
];

// =============================================================================
// JOURNEYS
// =============================================================================

const journeys = [
  {
    name: "First-Time User Setup",
    description:
      "New user uploads CV and sets up their profile. Critical first impression that determines user retention.",
    personaName: "Alex the Active Seeker",
    steps: [
      {
        stage: "Discovery",
        action: "Visits landing page from job board link or search",
        thinking: "What is this? Can it help me?",
        feeling: "Curious",
        touchpoint: "Landing page",
        opportunity: "Clear value proposition above the fold",
      },
      {
        stage: "Consideration",
        action: 'Clicks "Get Started" button',
        thinking: "Let me try it out",
        feeling: "Hopeful",
        touchpoint: "CTA button",
        opportunity: "No signup wall, immediate value",
      },
      {
        stage: "Onboarding",
        action: "Uploads CV (PDF/DOCX)",
        thinking: "Will it understand my CV?",
        feeling: "Anxious",
        touchpoint: "Upload component",
        opportunity: "Drag-and-drop, format hints",
      },
      {
        stage: "Processing",
        action: "Waits for AI extraction",
        thinking: "Is it working? How long will this take?",
        feeling: "Impatient",
        touchpoint: "Loading state",
        opportunity: "Progress steps, estimated time",
      },
      {
        stage: "Review",
        action: "Reviews extracted data in form",
        thinking: "Did it get everything right?",
        feeling: "Skeptical",
        touchpoint: "Profile form",
        opportunity: "Highlight AI-extracted fields, easy corrections",
      },
      {
        stage: "Completion",
        action: "Saves profile",
        thinking: "Great, now what?",
        feeling: "Accomplished",
        touchpoint: "Save confirmation",
        opportunity: "Clear next step CTA",
      },
    ],
  },
  {
    name: "Job Analysis Flow",
    description:
      "User analyzes a job posting to see skill match and generates a cover letter. Core value proposition of the app.",
    personaName: "Alex the Active Seeker",
    steps: [
      {
        stage: "Intent",
        action: "Navigates to analyze page with job description in clipboard",
        thinking: "I found an interesting job, let me check my fit",
        feeling: "Eager",
        touchpoint: "Navigation",
        opportunity: "Quick-paste button, recent analyses",
      },
      {
        stage: "Input",
        action: "Pastes job description into textarea",
        thinking: "Hope this is the right format",
        feeling: "Neutral",
        touchpoint: "Job description input",
        opportunity: "Auto-detect job URL, paste formatting",
      },
      {
        stage: "Analysis",
        action: "Clicks Analyze and waits for results",
        thinking: "How well do I match?",
        feeling: "Anxious",
        touchpoint: "Analysis loading",
        opportunity: "Show progress, partial results",
      },
      {
        stage: "Results",
        action: "Views match score and skill breakdown",
        thinking: "Is this a good match? What am I missing?",
        feeling: "Validated/Disappointed",
        touchpoint: "Results panel",
        opportunity: "Actionable gap advice, comparison context",
      },
      {
        stage: "Generation",
        action: "Clicks Generate Cover Letter",
        thinking: "Make me look good!",
        feeling: "Expectant",
        touchpoint: "Cover letter CTA",
        opportunity: "Tone options, gap mitigation",
      },
      {
        stage: "Output",
        action: "Reviews and copies cover letter",
        thinking: "Does this sound like me?",
        feeling: "Relieved",
        touchpoint: "Cover letter display",
        opportunity: "Edit inline, multiple versions",
      },
    ],
  },
  {
    name: "Application Tracking",
    description:
      "User tracks job applications and updates status over time. Supports long-term engagement and follow-up.",
    personaName: "Alex the Active Seeker",
    steps: [
      {
        stage: "Overview",
        action: "Visits tracker page to see all applications",
        thinking: "What's the status of my job search?",
        feeling: "Organized/Overwhelmed",
        touchpoint: "Tracker list",
        opportunity: "Filtering, search, Kanban view",
      },
      {
        stage: "Search",
        action: "Looks for specific application",
        thinking: "Where was that Google role?",
        feeling: "Frustrated",
        touchpoint: "Application list",
        opportunity: "Search bar, company filters",
      },
      {
        stage: "Update",
        action: "Changes application status",
        thinking: "I had an interview, let me update",
        feeling: "Progress",
        touchpoint: "Status dropdown",
        opportunity: "Quick actions, keyboard shortcuts",
      },
      {
        stage: "Notes",
        action: "Adds notes about interview",
        thinking: "I need to remember what we discussed",
        feeling: "Proactive",
        touchpoint: "Notes field",
        opportunity: "Rich text, reminders",
      },
      {
        stage: "Insights",
        action: "Checks dashboard for trends",
        thinking: "How is my search going overall?",
        feeling: "Reflective",
        touchpoint: "Dashboard",
        opportunity: "Response rates, suggestions",
      },
    ],
  },
  {
    name: "CV Editing Flow",
    description:
      "User edits CV using templates and downloads professional PDF. Premium feature for users who value presentation.",
    personaName: "Sam the Strategic Optimizer",
    steps: [
      {
        stage: "Start",
        action: "Navigates to CV editor",
        thinking: "I need a polished CV for this role",
        feeling: "Determined",
        touchpoint: "CV page",
        opportunity: "Template gallery, recent CVs",
      },
      {
        stage: "Template",
        action: "Browses and selects template",
        thinking: "Which style fits this industry?",
        feeling: "Creative",
        touchpoint: "Template selector",
        opportunity: "Industry suggestions, previews",
      },
      {
        stage: "Edit",
        action: "Modifies CV content",
        thinking: "How do I change this section?",
        feeling: "Confused/Confident",
        touchpoint: "Editor",
        opportunity: "Simple mode, AI suggestions",
      },
      {
        stage: "Preview",
        action: "Reviews live preview",
        thinking: "Does this look professional?",
        feeling: "Critical",
        touchpoint: "Preview panel",
        opportunity: "Full-page preview, zoom",
      },
      {
        stage: "Download",
        action: "Compiles and downloads PDF",
        thinking: "Hope it works!",
        feeling: "Anxious",
        touchpoint: "Download button",
        opportunity: "Progress indicator, error recovery",
      },
    ],
  },
];

// =============================================================================
// PAIN POINTS
// =============================================================================

const painPoints = [
  {
    title: "No Filtering/Sorting in Tracker",
    description:
      "Users with many applications can't find specific ones quickly. Causes overwhelm with growing list, time wasted scrolling, and missed follow-ups.",
    category: "navigation",
    severity: UxSeverity.CRITICAL,
    effort: UxEffort.MEDIUM,
    userQuote: "I have 50+ applications and can't find anything!",
    solution:
      "Add status filter tabs, search box, sort by date/company/score, and consider Kanban board view.",
    status: UxStatus.VALIDATED,
  },
  {
    title: "No Actionable Advice for Skill Gaps",
    description:
      "We show skill gaps but don't suggest how to address them. User knows the problem but not the solution.",
    category: "feedback",
    severity: UxSeverity.CRITICAL,
    effort: UxEffort.MEDIUM,
    userQuote: "You tell me I'm missing skills but not what to do about it",
    solution:
      "Add 'How to address this' tips, suggest learning resources, auto-include gap mitigation in cover letter.",
    status: UxStatus.VALIDATED,
  },
  {
    title: "No Drag-and-Drop Upload",
    description:
      "File upload requires clicking button, no visual drop zone. Minor friction that feels outdated.",
    category: "interaction",
    severity: UxSeverity.MEDIUM,
    effort: UxEffort.LOW,
    userQuote: null,
    solution:
      "Add drop zone with visual feedback, show accepted file types, add paste from clipboard.",
    status: UxStatus.DRAFT,
  },
  {
    title: "No Extraction Progress Indication",
    description:
      "User sees spinner but no sense of progress or what's happening during CV upload. Creates anxiety and uncertainty.",
    category: "feedback",
    severity: UxSeverity.MEDIUM,
    effort: UxEffort.MEDIUM,
    userQuote: "Is it frozen? Should I refresh?",
    solution:
      'Show steps: "Uploading → Reading → Extracting → Done", estimated time remaining, partial results as they come.',
    status: UxStatus.DRAFT,
  },
  {
    title: "LaTeX Editor Intimidating",
    description:
      "Non-technical users see raw LaTeX code and feel the feature is inaccessible. Underutilizes AI modification capability.",
    category: "comprehension",
    severity: UxSeverity.MEDIUM,
    effort: UxEffort.HIGH,
    userQuote: "I don't know LaTeX, I can't use this",
    solution:
      'Add "Simple Mode" that hides LaTeX, form-based editing for common fields, better AI prompt suggestions.',
    status: UxStatus.DRAFT,
  },
  {
    title: "No Clear User State",
    description:
      "App doesn't remember/show user context between sessions. Landing page same for new vs returning users.",
    category: "navigation",
    severity: UxSeverity.MEDIUM,
    effort: UxEffort.MEDIUM,
    userQuote: null,
    solution:
      'Dashboard as home for returning users, recent activity on landing, "Continue where you left off" prompt.',
    status: UxStatus.DRAFT,
  },
  {
    title: "Dense Application Cards",
    description:
      "Each application card shows a lot of info at once in the tracker. Information overload on first glance.",
    category: "visual",
    severity: UxSeverity.LOW,
    effort: UxEffort.LOW,
    userQuote: null,
    solution:
      "Progressive disclosure (expand on click), visual status indicators (color dots), condensed view option.",
    status: UxStatus.DRAFT,
  },
  {
    title: "Limited Dashboard Insights",
    description:
      "Shows basic counts but no trends or actionable insights. Missed opportunity to motivate users.",
    category: "feedback",
    severity: UxSeverity.LOW,
    effort: UxEffort.MEDIUM,
    userQuote: null,
    solution:
      "Add charts (applications over time), success rate by role type, follow-up reminders, weekly summary.",
    status: UxStatus.DRAFT,
  },
  {
    title: "No Confirmation for Destructive Actions",
    description: "No 'are you sure?' for irreversible actions like deleting applications.",
    category: "safety",
    severity: UxSeverity.LOW,
    effort: UxEffort.LOW,
    userQuote: null,
    solution: "Confirmation dialog, undo capability, soft delete with recovery.",
    status: UxStatus.DRAFT,
  },
];

// =============================================================================
// PRINCIPLES
// =============================================================================

const principles = [
  {
    name: "Progressive Disclosure",
    description:
      "Show only what's needed, when it's needed. Start simple, reveal complexity on demand.",
    rationale:
      "Users are overwhelmed by too many options. Hide advanced features behind 'More' or settings. Don't overwhelm on first visit.",
    examples: JSON.stringify({
      do: [
        "LaTeX editor: Hide code, show form by default",
        "Tracker: Summary cards, expand for details",
        "Analysis: Match score first, drill into breakdown",
      ],
      dont: [
        "Show all LaTeX code immediately",
        "Display all application details at once",
        "Present full skill breakdown without summary",
      ],
    }),
    priority: 1,
    status: UxStatus.VALIDATED,
  },
  {
    name: "Guide the Journey",
    description: "Always show the next step. Users should never wonder 'what now?'",
    rationale:
      "Each page should suggest the natural next action. Celebrate completions and progress to maintain momentum.",
    examples: JSON.stringify({
      do: [
        "After profile save: 'Ready to analyze a job?'",
        "After analysis: 'Save to Tracker' or 'Generate Cover Letter'",
        "Empty tracker: 'Start by analyzing your first job'",
      ],
      dont: [
        "Leave user on success screen with no CTA",
        "Hide next steps below the fold",
        "Assume user knows what to do next",
      ],
    }),
    priority: 2,
    status: UxStatus.VALIDATED,
  },
  {
    name: "Reduce Anxiety",
    description:
      "Show progress and explain waits. AI operations take time; explain what's happening.",
    rationale:
      "Users get anxious when they don't know if something is working. Provide estimated times and fallbacks.",
    examples: JSON.stringify({
      do: [
        "CV extraction: 'Reading document... Extracting info... Almost done'",
        "Compilation: 'Generating PDF (10-15 seconds)'",
        "Errors: Clear message + suggested action",
      ],
      dont: ["Show spinner with no context", "Let errors fail silently", "Hide loading states"],
    }),
    priority: 3,
    status: UxStatus.VALIDATED,
  },
  {
    name: "Mobile-First Layouts",
    description: "Design for thumb, scale up for mouse. Touch targets 44px minimum.",
    rationale: "Many job seekers browse on mobile. Key actions should be reachable with one hand.",
    examples: JSON.stringify({
      do: [
        "Tables → Cards on mobile",
        "Bottom navigation for key actions",
        "Large touch targets (44px+)",
      ],
      dont: ["Small buttons that are hard to tap", "Hover-only interactions", "Tiny text links"],
    }),
    priority: 4,
    status: UxStatus.DRAFT,
  },
  {
    name: "Visual Hierarchy",
    description: "Make the important things obvious. Primary action should be visually dominant.",
    rationale:
      "Use color sparingly for meaning. Consistent iconography throughout. Nordic design: generous whitespace, subtle shadows.",
    examples: JSON.stringify({
      do: [
        "One primary CTA per view (Fjord blue)",
        "Secondary actions outlined",
        "Destructive actions in red",
      ],
      dont: ["Multiple competing primary buttons", "Random color usage", "Cluttered layouts"],
    }),
    priority: 5,
    status: UxStatus.DRAFT,
  },
];

// =============================================================================
// SEED FUNCTION
// =============================================================================

async function seedUx(): Promise<void> {
  console.log("🌱 Seeding UX data...\n");

  // Clear existing data
  console.log("Clearing existing UX data...");
  await prisma.uxChatMessage.deleteMany();
  await prisma.uxAiAnalysis.deleteMany();
  await prisma.uxComment.deleteMany();
  await prisma.uxVersion.deleteMany();
  await prisma.uxJourneyStep.deleteMany();
  await prisma.uxJourney.deleteMany();
  await prisma.uxPainPoint.deleteMany();
  await prisma.uxPrinciple.deleteMany();
  await prisma.uxPersona.deleteMany();

  // Seed Personas
  console.log("Creating personas...");
  const createdPersonas: Record<string, string> = {};
  for (const persona of personas) {
    const created = await prisma.uxPersona.create({ data: persona });
    createdPersonas[persona.name] = created.id;
    console.log(`  ✓ ${persona.name}`);
  }

  // Seed Journeys with Steps
  console.log("\nCreating journeys...");
  for (const journey of journeys) {
    const { steps, personaName, ...journeyData } = journey;
    const personaId = personaName ? (createdPersonas[personaName] ?? null) : null;

    const createdJourney = await prisma.uxJourney.create({
      data: {
        name: journeyData.name,
        description: journeyData.description,
        personaId: personaId,
      },
    });

    // Create steps
    for (const [i, step] of steps.entries()) {
      await prisma.uxJourneyStep.create({
        data: {
          stage: step.stage,
          action: step.action,
          thinking: step.thinking,
          feeling: step.feeling,
          touchpoint: step.touchpoint,
          opportunity: step.opportunity ?? null,
          journeyId: createdJourney.id,
          orderIndex: i,
        },
      });
    }

    console.log(`  ✓ ${journey.name} (${steps.length} steps)`);
  }

  // Seed Pain Points
  console.log("\nCreating pain points...");
  for (const painPoint of painPoints) {
    await prisma.uxPainPoint.create({ data: painPoint });
    console.log(`  ✓ ${painPoint.title}`);
  }

  // Seed Principles
  console.log("\nCreating principles...");
  for (const principle of principles) {
    await prisma.uxPrinciple.create({ data: principle });
    console.log(`  ✓ ${principle.name}`);
  }

  console.log("\n✅ UX data seeded successfully!");
  console.log(`   - ${personas.length} personas`);
  console.log(`   - ${journeys.length} journeys`);
  console.log(`   - ${painPoints.length} pain points`);
  console.log(`   - ${principles.length} principles`);
}

// Run seed
seedUx()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
