/**
 * Demo Data Seeding
 *
 * Lighter-weight seed script for demo mode.
 * Creates sample data for portfolio showcase without authentication.
 *
 * Run with: npx tsx prisma/seed-demo.ts
 *
 * @module prisma/seed-demo
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Demo user email - consistent for showcase
const DEMO_USER_EMAIL = "demo@careerpal.app";
const DEMO_USER_NAME = "Demo User";

// ============================================
// Sample LaTeX CV
// ============================================

const SAMPLE_CV_LATEX = `%-------------------------
% Resume in LaTeX - Demo User
%-------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\raggedbottom
\\raggedright

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape Demo User} \\\\ \\vspace{1pt}
    \\small Senior Software Engineer \\\\
    demo@careerpal.app $|$
    linkedin.com/in/demo $|$
    github.com/demo
\\end{center}

%-----------SUMMARY-----------
\\section{Summary}
Full-stack engineer with 5+ years of experience building scalable web applications. 
Passionate about clean architecture, developer experience, and AI-powered tools.

%-----------EXPERIENCE-----------
\\section{Experience}
\\textbf{Senior Software Engineer} \\hfill 2022 -- Present \\\\
\\textit{TechCorp, Remote}
\\begin{itemize}[leftmargin=0.15in, label={--}]
    \\item Led development of AI-powered analytics platform serving 50K+ users
    \\item Architected microservices migration reducing latency by 40\\%
    \\item Mentored 5 junior developers through code reviews
\\end{itemize}

\\textbf{Software Engineer} \\hfill 2019 -- 2022 \\\\
\\textit{StartupXYZ, San Francisco}
\\begin{itemize}[leftmargin=0.15in, label={--}]
    \\item Built real-time collaboration features using WebSockets
    \\item Implemented CI/CD pipeline reducing deployment time by 85\\%
\\end{itemize}

%-----------EDUCATION-----------
\\section{Education}
\\textbf{University of California, Berkeley} \\hfill 2015 -- 2019 \\\\
B.S. in Computer Science, GPA: 3.8/4.0

%-----------SKILLS-----------
\\section{Technical Skills}
\\textbf{Languages:} TypeScript, JavaScript, Python, Go \\\\
\\textbf{Frameworks:} React, Next.js, Node.js, FastAPI \\\\
\\textbf{Tools:} PostgreSQL, Redis, Docker, Kubernetes, AWS

\\end{document}`;

// ============================================
// Sample Applications
// ============================================

const SAMPLE_APPLICATIONS = [
  {
    company: "Vercel",
    role: "Senior Engineer, Next.js Team",
    jobDescription: "Join the Next.js core team to build the future of web development.",
    jobUrl: "https://vercel.com/careers",
    matchScore: 95,
    analysis:
      "**Excellent Match (95%)**\n\n✅ Expert-level Next.js experience\n✅ React specialist with 5+ years\n✅ Strong TypeScript skills",
    coverLetter: "Dear Vercel Team,\n\nI am excited to apply...",
    status: "interviewing",
    appliedAt: new Date(),
    notes: "Completed take-home project. Onsite scheduled next week.",
  },
  {
    company: "Stripe",
    role: "Staff Engineer, Developer Experience",
    jobDescription: "Own the end-to-end developer experience for Stripe's APIs and SDKs.",
    jobUrl: "https://stripe.com/jobs",
    matchScore: 88,
    analysis:
      "**Strong Match (88%)**\n\n✅ Strong DX focus\n✅ API design experience\n⚠️ Limited fintech experience",
    coverLetter: "Dear Stripe Team,\n\nI am passionate about DX...",
    status: "applied",
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    notes: "Applied via referral from ex-colleague.",
  },
  {
    company: "Notion",
    role: "Full-Stack Engineer",
    jobDescription: "Build real-time collaboration features for millions of users.",
    jobUrl: "https://notion.so/careers",
    matchScore: 90,
    analysis:
      "**Excellent Match (90%)**\n\n✅ WebSocket experience\n✅ Full-stack background\n✅ Product-minded",
    coverLetter: "",
    status: "saved",
    appliedAt: null,
    notes: "Great company culture. Will apply after current interviews.",
  },
  {
    company: "Linear",
    role: "Senior Frontend Engineer",
    jobDescription: "Build the fastest project management tool.",
    jobUrl: "https://linear.app/careers",
    matchScore: 93,
    analysis:
      "**Excellent Match (93%)**\n\n✅ React expertise\n✅ Performance optimization\n✅ Startup mindset",
    coverLetter: "Dear Linear Team,\n\nI've been a Linear user...",
    status: "offer",
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    notes: "🎉 Received offer! $280K + equity. Need to decide by Friday.",
  },
  {
    company: "Meta",
    role: "Software Engineer, React Core",
    jobDescription: "Work on React itself at Meta.",
    jobUrl: "https://meta.com/careers",
    matchScore: 78,
    analysis: "**Good Match (78%)**\n\n✅ Strong React user\n⚠️ Compiler experience lacking",
    coverLetter: "Dear Meta Team...",
    status: "rejected",
    appliedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    notes: "Rejected at resume screen. Needed more compiler background. Good learning experience.",
  },
];

// ============================================
// Main Seed Function
// ============================================

async function seedDemoData(): Promise<void> {
  /* eslint-disable no-console */

  console.log("🌱 Seeding demo data...\n");

  // 1. Create or update demo user
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {
      name: DEMO_USER_NAME,
      summary:
        "Full-stack engineer with 5+ years of experience building scalable web applications.",
      experience:
        "Senior Software Engineer at TechCorp (2022-Present)\nSoftware Engineer at StartupXYZ (2019-2022)",
      skills: "TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, AWS, Docker",
      location: "San Francisco, CA",
      phone: "+1 (555) 123-4567",
    },
    create: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
      summary:
        "Full-stack engineer with 5+ years of experience building scalable web applications.",
      experience:
        "Senior Software Engineer at TechCorp (2022-Present)\nSoftware Engineer at StartupXYZ (2019-2022)",
      skills: "TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, AWS, Docker",
      location: "San Francisco, CA",
      phone: "+1 (555) 123-4567",
    },
  });

  console.log(`👤 Demo user: ${demoUser.email}`);

  // 2. Delete existing CVs and create sample
  await prisma.cV.deleteMany({ where: { userId: demoUser.id } });

  const cv = await prisma.cV.create({
    data: {
      userId: demoUser.id,
      name: "Software Engineer - General",
      latexContent: SAMPLE_CV_LATEX,
      isActive: true,
      pdfUrl: null,
    },
  });

  console.log(`📄 Created CV: ${cv.name}`);

  // 3. Delete existing applications and create samples
  await prisma.application.deleteMany({ where: { userId: demoUser.id } });

  for (const app of SAMPLE_APPLICATIONS) {
    await prisma.application.create({
      data: {
        userId: demoUser.id,
        ...app,
      },
    });
  }

  console.log(`📋 Created ${SAMPLE_APPLICATIONS.length} sample applications`);

  console.log("\n✅ Demo seeding complete!");
  console.log("\n📊 Summary:");
  console.log("   - 1 demo user");
  console.log("   - 1 CV");
  console.log(`   - ${SAMPLE_APPLICATIONS.length} applications`);
  console.log(`     (1 offer, 1 interviewing, 1 applied, 1 saved, 1 rejected)`);

  /* eslint-enable no-console */
}

// ============================================
// Export for use by cron job
// ============================================

export { seedDemoData };

// ============================================
// CLI execution
// ============================================

if (require.main === module) {
  seedDemoData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
