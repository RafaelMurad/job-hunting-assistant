import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Guard: Only allow seeding in development/staging
const ALLOWED_ENVS = ["development", "test", "staging"];
const currentEnv = process.env.NODE_ENV || "development";

if (!ALLOWED_ENVS.includes(currentEnv)) {
  console.error(`❌ Seeding is not allowed in ${currentEnv} environment.`);
  console.error(`   Allowed environments: ${ALLOWED_ENVS.join(", ")}`);
  process.exit(1);
}

// ============================================
// Helper: Generate realistic LaTeX CV content
// ============================================
function generateLatexCV(variant: {
  name: string;
  title: string;
  focus: string;
  highlights: string[];
}): string {
  return `%-------------------------
% Resume in LaTeX
% Author: ${variant.name}
% Focus: ${variant.focus}
%-------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${variant.name}} \\\\ \\vspace{1pt}
    \\small ${variant.title} \\\\
    \\href{mailto:rafael.murad@example.com}{rafael.murad@example.com} $|$
    \\href{https://linkedin.com/in/rafaelmurad}{linkedin.com/in/rafaelmurad} $|$
    \\href{https://github.com/rafaelmurad}{github.com/rafaelmurad}
\\end{center}

%-----------SUMMARY-----------
\\section{Summary}
${variant.focus}

%-----------EXPERIENCE-----------
\\section{Experience}
\\textbf{Senior Software Engineer} \\hfill 2022 -- Present \\\\
\\textit{TechCorp, San Francisco, CA}
\\begin{itemize}[leftmargin=0.15in, label={--}]
    ${variant.highlights.map((h) => `\\item ${h}`).join("\n    ")}
\\end{itemize}

\\textbf{Software Engineer} \\hfill 2019 -- 2022 \\\\
\\textit{StartupXYZ, Remote}
\\begin{itemize}[leftmargin=0.15in, label={--}]
    \\item Built real-time collaboration features using WebSockets and Redis
    \\item Implemented CI/CD pipeline reducing deployment time by 85\\%
    \\item Contributed to open-source libraries with 2K+ GitHub stars
\\end{itemize}

%-----------EDUCATION-----------
\\section{Education}
\\textbf{University of California, Berkeley} \\hfill 2013 -- 2017 \\\\
B.S. in Computer Science, GPA: 3.8/4.0

%-----------SKILLS-----------
\\section{Technical Skills}
\\textbf{Languages:} TypeScript, JavaScript, Python, Go, SQL \\\\
\\textbf{Frameworks:} React, Next.js, Node.js, Express, FastAPI \\\\
\\textbf{Tools:} PostgreSQL, Redis, Docker, Kubernetes, AWS, GCP

\\end{document}`;
}

async function main(): Promise<void> {
  /* eslint-disable no-console */
  console.log(`🌱 Start seeding (env: ${currentEnv})...`);
  console.log("");
  /* eslint-enable no-console */

  // ============================================
  // USER 1: Primary test user (experienced engineer)
  // NOTE: ID must match Neon Auth user ID for authenticated sessions
  // ============================================
  const user1 = await prisma.user.upsert({
    where: { email: "rafael.murad@example.com" },
    update: {},
    create: {
      id: "6f010d61-6ccf-4aff-9e58-38c8f8453f38", // Neon Auth ID
      email: "rafael.murad@example.com",
      name: "Rafael Murad",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      summary:
        "Senior Full-Stack Engineer with 8+ years of experience building scalable web applications. Passionate about clean architecture, developer experience, and AI-powered tools. Led teams of 5-10 engineers at startups and enterprise companies.",
      experience: `Senior Software Engineer at TechCorp (2022-Present)
- Led development of AI-powered analytics platform serving 50K+ users
- Architected microservices migration reducing latency by 40%
- Mentored 5 junior developers through code reviews and pair programming

Software Engineer at StartupXYZ (2019-2022)
- Built real-time collaboration features using WebSockets
- Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes
- Contributed to open-source libraries with 2K+ GitHub stars

Junior Developer at WebAgency (2017-2019)
- Developed responsive web applications for 20+ clients
- Introduced TypeScript adoption across the engineering team`,
      skills:
        "TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, AWS, Docker, Kubernetes, GraphQL, REST APIs, CI/CD, Agile/Scrum",
    },
  });

  // ============================================
  // USER 2: Junior developer (different persona)
  // NOTE: ID must match Neon Auth user ID for authenticated sessions
  // ============================================
  const user2 = await prisma.user.upsert({
    where: { email: "sarah.chen@example.com" },
    update: {},
    create: {
      id: "6efeb30d-9d86-49e4-9f7f-da523456cb75", // Neon Auth ID
      email: "sarah.chen@example.com",
      name: "Sarah Chen",
      phone: "+1 (555) 987-6543",
      location: "Austin, TX",
      summary:
        "Enthusiastic Junior Developer with 2 years of experience. Bootcamp graduate passionate about frontend development and accessibility. Quick learner eager to grow into full-stack roles.",
      experience: `Junior Frontend Developer at LocalTech (2024-Present)
- Developed responsive React components for e-commerce platform
- Improved Lighthouse accessibility score from 72 to 95
- Collaborated with designers on component library

Freelance Web Developer (2023-2024)
- Built 5 portfolio websites for local businesses
- Implemented SEO best practices increasing organic traffic by 150%`,
      skills: "JavaScript, React, HTML, CSS, Tailwind CSS, Git, Figma, Accessibility (WCAG)",
    },
  });

  // ============================================
  // USER 3: Career changer (data scientist → SWE)
  // NOTE: ID must match Neon Auth user ID for authenticated sessions
  // ============================================
  const user3 = await prisma.user.upsert({
    where: { email: "marcus.johnson@example.com" },
    update: {},
    create: {
      id: "742b1a28-111f-4f1d-af6e-74287832cd96", // Neon Auth ID
      email: "marcus.johnson@example.com",
      name: "Marcus Johnson",
      phone: "+1 (555) 456-7890",
      location: "Seattle, WA",
      summary:
        "Data Scientist transitioning to Software Engineering. 5 years of Python experience with ML/AI focus. Looking to combine data expertise with modern web development.",
      experience: `Senior Data Scientist at DataCorp (2021-Present)
- Built ML pipelines processing 10TB+ data daily
- Developed Python APIs for model serving
- Led team of 3 data scientists

Data Analyst at Analytics Inc (2019-2021)
- Created dashboards reducing report generation time by 60%
- Automated ETL processes with Python and SQL`,
      skills:
        "Python, SQL, TensorFlow, PyTorch, Pandas, NumPy, FastAPI, Docker, AWS SageMaker, PostgreSQL",
    },
  });

  /* eslint-disable no-console */
  console.log(`👤 Created 3 users:`);
  console.log(`   - ${user1.name} (${user1.email}) - Senior Engineer`);
  console.log(`   - ${user2.name} (${user2.email}) - Junior Developer`);
  console.log(`   - ${user3.name} (${user3.email}) - Career Changer`);
  console.log("");
  /* eslint-enable no-console */

  // ============================================
  // CVs for User 1 (Rafael - 7 CV variants)
  // ============================================

  const user1CVs = [
    {
      name: "Software Engineer - General",
      latexContent: generateLatexCV({
        name: "Rafael Murad",
        title: "Senior Software Engineer",
        focus:
          "Versatile full-stack engineer with 8+ years building scalable web applications. Expert in TypeScript/React ecosystem with strong distributed systems background.",
        highlights: [
          "Led development of AI-powered analytics platform serving 50K+ users",
          "Architected microservices migration reducing latency by 40\\%",
          "Mentored 5 junior developers through code reviews and pair programming",
          "Implemented event-driven architecture handling 10K requests/second",
        ],
      }),
      isActive: true,
    },
    {
      name: "Full-Stack Developer",
      latexContent: generateLatexCV({
        name: "Rafael Murad",
        title: "Full-Stack Developer",
        focus:
          "End-to-end product development specialist. Equally comfortable building beautiful UIs and robust backend systems. Passionate about developer experience and code quality.",
        highlights: [
          "Built complete product features from database design to UI implementation",
          "Created reusable component library used across 5 product teams",
          "Designed RESTful and GraphQL APIs serving mobile and web clients",
          "Established testing practices achieving 85\\% code coverage",
        ],
      }),
      isActive: false,
    },
    {
      name: "Frontend Specialist",
      latexContent: generateLatexCV({
        name: "Rafael Murad",
        title: "Senior Frontend Engineer",
        focus:
          "Frontend performance expert specializing in React and Next.js. Obsessed with user experience, accessibility, and sub-second load times.",
        highlights: [
          "Reduced bundle size by 60\\% through code splitting and tree shaking",
          "Achieved 100/100 Lighthouse performance score on customer-facing pages",
          "Implemented design system adopted by 50+ engineers",
          "Led migration from Create React App to Next.js improving SEO by 200\\%",
        ],
      }),
      isActive: false,
    },
    {
      name: "Tech Lead Resume",
      latexContent: generateLatexCV({
        name: "Rafael Murad",
        title: "Technical Lead",
        focus:
          "Engineering leader with track record of building high-performing teams. Balance technical excellence with business impact. Strong communicator bridging product and engineering.",
        highlights: [
          "Led team of 8 engineers delivering flagship product on schedule",
          "Established engineering standards reducing production incidents by 70\\%",
          "Drove technical roadmap aligned with $10M revenue growth target",
          "Introduced OKR framework improving team delivery predictability",
        ],
      }),
      isActive: false,
    },
    {
      name: "AI/ML Focus",
      latexContent: generateLatexCV({
        name: "Rafael Murad",
        title: "AI/ML Engineer",
        focus:
          "Software engineer with growing AI/ML expertise. Experience building LLM-powered applications and ML pipelines. Bridges traditional software engineering with modern AI tooling.",
        highlights: [
          "Built AI-powered analytics platform using OpenAI and custom embeddings",
          "Implemented RAG system reducing customer support queries by 40\\%",
          "Designed ML feature pipeline processing 1M+ events daily",
          "Integrated Claude and GPT-4 APIs for intelligent document processing",
        ],
      }),
      isActive: false,
    },
    {
      name: "Startup/Early Stage",
      latexContent: generateLatexCV({
        name: "Rafael Murad",
        title: "Founding Engineer",
        focus:
          "Versatile engineer thriving in ambiguity. Experience wearing multiple hats from DevOps to product design. Startup veteran who ships fast without sacrificing quality.",
        highlights: [
          "First engineering hire, grew team from 1 to 15 engineers",
          "Built MVP in 6 weeks leading to \\$2M seed funding",
          "Wore multiple hats: backend, frontend, DevOps, hiring",
          "Established engineering culture emphasizing autonomy and ownership",
        ],
      }),
      isActive: false,
    },
    {
      name: "Remote Work Emphasis",
      latexContent: generateLatexCV({
        name: "Rafael Murad",
        title: "Senior Software Engineer (Remote)",
        focus:
          "Distributed work expert with 4+ years remote experience. Excellent async communicator. Self-motivated professional delivering results across time zones.",
        highlights: [
          "Led distributed team across 5 time zones (US, EU, APAC)",
          "Established async communication practices adopted company-wide",
          "Maintained high productivity with documented work patterns",
          "Created onboarding docs reducing new hire ramp-up time by 50\\%",
        ],
      }),
      isActive: false,
    },
  ];

  // ============================================
  // CVs for User 2 (Sarah - 3 CV variants)
  // ============================================

  const user2CVs = [
    {
      name: "Frontend Developer",
      latexContent: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}

\\begin{document}

\\begin{center}
    \\textbf{\\Huge Sarah Chen} \\\\ \\vspace{2pt}
    Junior Frontend Developer \\\\
    sarah.chen@example.com $|$ Austin, TX
\\end{center}

\\section*{Summary}
Passionate frontend developer with 2 years of experience building accessible, responsive web applications. Bootcamp graduate eager to grow into full-stack roles.

\\section*{Experience}
\\textbf{Junior Frontend Developer} -- LocalTech \\hfill 2024 -- Present
\\begin{itemize}
    \\item Developed responsive React components for e-commerce platform
    \\item Improved Lighthouse accessibility score from 72 to 95
    \\item Collaborated with designers on component library
\\end{itemize}

\\section*{Skills}
JavaScript, React, TypeScript, HTML, CSS, Tailwind CSS, Git, Figma

\\end{document}`,
      isActive: true,
    },
    {
      name: "React Specialist",
      latexContent: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\begin{document}
\\begin{center}
    \\textbf{\\Huge Sarah Chen} \\\\ \\vspace{2pt}
    React Developer \\\\
    sarah.chen@example.com $|$ Austin, TX
\\end{center}

\\section*{Summary}
React specialist focused on component architecture and state management. Experience with hooks, context, and modern React patterns.

\\section*{Key Projects}
\\begin{itemize}
    \\item Built reusable component library with 20+ components
    \\item Implemented complex forms with React Hook Form + Zod
    \\item Created custom hooks for data fetching and caching
\\end{itemize}

\\end{document}`,
      isActive: false,
    },
    {
      name: "Accessibility Focus",
      latexContent: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\begin{document}
\\begin{center}
    \\textbf{\\Huge Sarah Chen} \\\\ \\vspace{2pt}
    Accessibility-Focused Developer \\\\
    sarah.chen@example.com $|$ Austin, TX
\\end{center}

\\section*{Summary}
Frontend developer passionate about inclusive design and WCAG compliance. Believes the web should be accessible to everyone.

\\section*{Accessibility Achievements}
\\begin{itemize}
    \\item Improved platform accessibility score from 72 to 95
    \\item Led accessibility audit and remediation project
    \\item Trained team of 5 developers on a11y best practices
\\end{itemize}

\\end{document}`,
      isActive: false,
    },
  ];

  // ============================================
  // CVs for User 3 (Marcus - 4 CV variants)
  // ============================================

  const user3CVs = [
    {
      name: "Software Engineer (Career Change)",
      latexContent: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\begin{document}
\\begin{center}
    \\textbf{\\Huge Marcus Johnson} \\\\ \\vspace{2pt}
    Software Engineer \\\\
    marcus.johnson@example.com $|$ Seattle, WA
\\end{center}

\\section*{Summary}
Data Scientist with 5 years of Python experience transitioning to Software Engineering. Strong foundation in building production ML systems, seeking to apply skills to broader software challenges.

\\section*{Relevant Experience}
\\textbf{Senior Data Scientist} -- DataCorp \\hfill 2021 -- Present
\\begin{itemize}
    \\item Built Python APIs serving ML models to 100K+ daily requests
    \\item Designed data pipelines processing 10TB+ daily
    \\item Containerized applications with Docker, deployed on Kubernetes
\\end{itemize}

\\section*{Technical Skills}
Python, FastAPI, PostgreSQL, Docker, Kubernetes, AWS, Git, CI/CD

\\end{document}`,
      isActive: true,
    },
    {
      name: "ML Engineer",
      latexContent: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\begin{document}
\\begin{center}
    \\textbf{\\Huge Marcus Johnson} \\\\ \\vspace{2pt}
    Machine Learning Engineer \\\\
    marcus.johnson@example.com $|$ Seattle, WA
\\end{center}

\\section*{Summary}
ML Engineer specializing in production ML systems. Expert in model training, deployment, and monitoring at scale.

\\section*{ML Projects}
\\begin{itemize}
    \\item Deployed recommendation system improving click-through by 25\\%
    \\item Built real-time fraud detection processing 50K transactions/sec
    \\item Created feature store reducing model training time by 60\\%
\\end{itemize}

\\end{document}`,
      isActive: false,
    },
    {
      name: "Backend Engineer",
      latexContent: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\begin{document}
\\begin{center}
    \\textbf{\\Huge Marcus Johnson} \\\\ \\vspace{2pt}
    Backend Engineer \\\\
    marcus.johnson@example.com $|$ Seattle, WA
\\end{center}

\\section*{Summary}
Backend engineer with strong Python foundation. Experience building APIs, data pipelines, and distributed systems.

\\section*{Backend Experience}
\\begin{itemize}
    \\item Designed REST APIs handling 100K+ requests/day
    \\item Built ETL pipelines reducing processing time by 70\\%
    \\item Implemented caching layer improving response times by 5x
\\end{itemize}

\\end{document}`,
      isActive: false,
    },
    {
      name: "Data Engineer",
      latexContent: `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\begin{document}
\\begin{center}
    \\textbf{\\Huge Marcus Johnson} \\\\ \\vspace{2pt}
    Data Engineer \\\\
    marcus.johnson@example.com $|$ Seattle, WA
\\end{center}

\\section*{Summary}
Data Engineer building robust data infrastructure. Expert in ETL, data warehousing, and real-time streaming.

\\section*{Data Engineering}
\\begin{itemize}
    \\item Architected data warehouse supporting 500+ daily users
    \\item Built Kafka streaming pipeline processing 1M events/hour
    \\item Migrated legacy batch jobs to real-time processing
\\end{itemize}

\\end{document}`,
      isActive: false,
    },
  ];

  // Delete existing CVs and create new ones
  await prisma.cV.deleteMany({ where: { userId: user1.id } });
  await prisma.cV.deleteMany({ where: { userId: user2.id } });
  await prisma.cV.deleteMany({ where: { userId: user3.id } });

  for (const cv of user1CVs) {
    await prisma.cV.create({ data: { userId: user1.id, pdfUrl: null, ...cv } });
  }
  for (const cv of user2CVs) {
    await prisma.cV.create({ data: { userId: user2.id, pdfUrl: null, ...cv } });
  }
  for (const cv of user3CVs) {
    await prisma.cV.create({ data: { userId: user3.id, pdfUrl: null, ...cv } });
  }

  /* eslint-disable no-console */
  console.log(`📄 Created ${user1CVs.length + user2CVs.length + user3CVs.length} CVs total:`);
  console.log(`   - Rafael: ${user1CVs.length} CVs`);
  console.log(`   - Sarah: ${user2CVs.length} CVs`);
  console.log(`   - Marcus: ${user3CVs.length} CVs`);
  console.log("");
  /* eslint-enable no-console */

  // ============================================
  // Applications for User 1 (Rafael - 15 applications)
  // Various statuses for testing dashboard/tracker
  // ============================================

  const user1Applications = [
    // OFFER (2)
    {
      company: "Vercel",
      role: "Senior Engineer, Next.js Core Team",
      jobDescription: `Work on the framework powering the modern web.

About the Role:
Join the Next.js core team to build the future of web development. You'll work on features used by millions of developers worldwide.

Responsibilities:
- Design and implement new Next.js features
- Optimize build times and runtime performance
- Collaborate with React team at Meta
- Engage with open source community

Requirements:
- Deep knowledge of React and Next.js
- Experience with build tools, bundlers, and compilers
- Open source contribution history preferred
- Strong communication skills`,
      jobUrl: "https://vercel.com/careers/nextjs-senior",
      matchScore: 95,
      analysis: `**Excellent Match (95%)**

✅ Perfect Alignment:
- Expert-level Next.js experience from production apps
- React specialist with 6+ years experience
- Open source contributions (2K+ stars)
- Strong TypeScript skills

⚠️ Minor Gaps:
- Limited compiler/bundler internals experience
- Consider highlighting any Webpack/Turbopack work

💡 Recommendation: Strong apply! This role seems tailor-made for your skillset. Your production Next.js experience is exactly what they need.`,
      coverLetter: `Dear Vercel Hiring Team,

I am thrilled to apply for the Senior Engineer position on the Next.js Core Team. As someone who has built and scaled multiple production applications with Next.js, I'm deeply passionate about the framework's mission to simplify web development.

At TechCorp, I led the migration from Create React App to Next.js, resulting in a 200% improvement in SEO metrics and a 60% reduction in Time to First Byte. This hands-on experience with Next.js at scale has given me insight into both its strengths and areas for improvement.

I'm particularly excited about the opportunity to work on features like Server Components and the App Router. I've already contributed to the Next.js documentation and reported several issues, and I would love to make a more significant impact as a core team member.

I look forward to discussing how my experience building with Next.js can translate into building Next.js itself.

Best regards,
Rafael Murad`,
      status: "offer",
      appliedAt: new Date("2025-12-15"),
      notes:
        "🎉 Received offer on Jan 5! $285K base + $200K equity over 4 years. Remote-friendly but prefer SF area. Need to respond by Jan 20. Strong team culture vibes during interviews.",
    },
    {
      company: "Stripe",
      role: "Staff Engineer, Developer Experience",
      jobDescription: `Stripe is looking for a Staff Engineer to lead our Developer Experience team.

About the Role:
Own the end-to-end developer experience for Stripe's APIs and SDKs. You'll make it easier for millions of developers to integrate payments.

Responsibilities:
- Lead technical direction for SDKs and API design
- Drive engineering excellence across DX teams
- Mentor and grow senior engineers
- Represent Stripe at conferences and in open source

Requirements:
- 10+ years of software development experience
- Track record of improving developer experience
- Experience building and maintaining SDKs
- Strong communication and leadership skills`,
      jobUrl: "https://stripe.com/jobs/staff-dx",
      matchScore: 88,
      analysis: `**Strong Match (88%)**

✅ Strengths:
- Strong DX focus in previous roles
- API design experience
- Leadership track record
- 8 years experience (slightly under 10)

⚠️ Gaps:
- No SDK maintenance experience specifically
- Fintech domain experience limited

💡 Strong opportunity, worth pursuing. Your focus on developer experience aligns perfectly.`,
      coverLetter: `Dear Stripe Team,

I am excited to apply for the Staff Engineer, Developer Experience position. Throughout my career, I've been passionate about making developers' lives easier...

Best regards,
Rafael Murad`,
      status: "offer",
      appliedAt: new Date("2025-12-01"),
      notes:
        "🎉 Second offer! $310K base + equity. More senior role but payments domain less exciting than Next.js. Decision between Vercel and Stripe by Jan 20.",
    },

    // INTERVIEWING (4)
    {
      company: "Notion",
      role: "Full-Stack Engineer, Collaboration",
      jobDescription: `Build the future of collaborative workspaces.

About the Role:
Join the team making work more beautiful and productive. You'll build features that millions of teams rely on daily.

Responsibilities:
- Build real-time collaboration features
- Optimize performance at scale
- Create beautiful, intuitive user experiences
- Work across the full stack

Requirements:
- 5+ years of full-stack experience
- Experience with real-time systems (WebSocket, CRDT)
- Strong product sense
- Passion for productivity tools`,
      jobUrl: "https://notion.so/careers/fullstack-collab",
      matchScore: 90,
      analysis: `**Excellent Match (90%)**

✅ Strong Alignment:
- WebSocket experience from StartupXYZ
- Full-stack background
- Product-minded approach
- Performance optimization skills

💡 Your real-time collaboration experience is directly relevant!`,
      coverLetter: `Dear Notion Team...`,
      status: "interviewing",
      appliedAt: new Date("2026-01-03"),
      notes:
        "Completed take-home project (collaborative text editor with OT). Onsite scheduled for Jan 18. 4 rounds: system design, coding, product sense, team fit.",
    },
    {
      company: "Google",
      role: "Senior Software Engineer, Cloud Platform",
      jobDescription: `Join Google Cloud as a Senior Software Engineer working on next-generation infrastructure.

Responsibilities:
- Design and implement scalable distributed systems
- Collaborate with product and UX teams
- Mentor junior engineers
- Participate in on-call rotation

Requirements:
- 5+ years of software development experience
- Strong knowledge of distributed systems
- Experience with Go, Java, or C++
- BS/MS in Computer Science`,
      jobUrl: "https://careers.google.com/jobs/cloud-senior",
      matchScore: 82,
      analysis: `**Good Match (82%)**

✅ Strengths:
- Distributed systems experience
- Leadership/mentorship track record
- Strong cloud experience (AWS)

⚠️ Gaps:
- Primary languages are Go/Java/C++, you're TypeScript focused
- Consider brushing up on Go

💡 Worth applying, be prepared for language flexibility discussion.`,
      coverLetter: `Dear Google Cloud Team...`,
      status: "interviewing",
      appliedAt: new Date("2026-01-08"),
      notes:
        "Phone screen passed! Technical interview with 2 engineers scheduled Jan 15. Need to review Go basics and distributed systems patterns.",
    },
    {
      company: "Linear",
      role: "Senior Frontend Engineer",
      jobDescription: `Build the fastest project management tool.

Requirements:
- React expertise and performance obsession
- Eye for design and attention to detail
- Experience building complex UIs
- Startup mindset`,
      jobUrl: "https://linear.app/careers/senior-frontend",
      matchScore: 93,
      analysis: `**Excellent Match (93%)**

Perfect for your React expertise and performance optimization experience. Linear's engineering blog shows values aligned with yours.`,
      coverLetter: `Dear Linear Team...`,
      status: "interviewing",
      appliedAt: new Date("2026-01-09"),
      notes:
        "Passed initial screen. Take-home assignment: build a Kanban board with drag-and-drop. Due Jan 14.",
    },
    {
      company: "Startup ABC (YC W26)",
      role: "Founding Engineer",
      jobDescription: `Join as one of the first 5 engineers at an AI-powered dev tools startup.

Requirements:
- Full-stack experience
- Comfortable with ambiguity
- Startup experience preferred
- Interest in AI/developer tools`,
      jobUrl: "https://startabc.com/jobs/founding",
      matchScore: 94,
      analysis: `**Excellent Match (94%)**

Your startup background and full-stack skills make you ideal. The AI focus aligns with your recent work.`,
      coverLetter: `Dear Startup ABC Team...`,
      status: "interviewing",
      appliedAt: new Date("2026-01-07"),
      notes:
        "Met founders at SF AI meetup. Great chemistry! Seed stage, $3M raised. Equity heavy (0.5-1%). Final interview with investors next week.",
    },

    // APPLIED (3)
    {
      company: "Anthropic",
      role: "Software Engineer, Claude Platform",
      jobDescription: `Help build the infrastructure powering Claude.

Requirements:
- Python and/or TypeScript
- Experience with LLMs or ML systems
- Distributed systems background
- Strong engineering fundamentals`,
      jobUrl: "https://anthropic.com/careers/claude-platform",
      matchScore: 85,
      analysis: `**Strong Match (85%)**

✅ Distributed systems + TypeScript experience is solid
⚠️ ML experience growing but not primary focus

Worth applying given AI interest!`,
      coverLetter: `Dear Anthropic Team...`,
      status: "applied",
      appliedAt: new Date("2026-01-10"),
      notes: "Applied today! Really excited about this one. Used Claude in job hunting app.",
    },
    {
      company: "Figma",
      role: "Software Engineer, Performance",
      jobDescription: `Make Figma even faster.

Requirements:
- Performance optimization expertise
- WebGL or Canvas experience a plus
- Strong CS fundamentals`,
      jobUrl: "https://figma.com/careers/perf-engineer",
      matchScore: 79,
      analysis: `**Good Match (79%)**

Performance skills align but WebGL/Canvas is a gap. Worth trying!`,
      coverLetter: `Dear Figma Team...`,
      status: "applied",
      appliedAt: new Date("2026-01-09"),
      notes: "Long shot but love the product. Mentioned performance work at TechCorp heavily.",
    },
    {
      company: "Planetscale",
      role: "Senior Engineer, Edge Databases",
      jobDescription: `Build the future of serverless databases.

Requirements:
- Database internals knowledge
- Distributed systems experience
- Go or Rust preferred`,
      jobUrl: "https://planetscale.com/careers/edge",
      matchScore: 72,
      analysis: `**Moderate Match (72%)**

Distributed systems is good, but database internals and Go/Rust are gaps.`,
      coverLetter: `Dear Planetscale Team...`,
      status: "applied",
      appliedAt: new Date("2026-01-08"),
      notes: "Stretch role. Interested in database space but need to skill up.",
    },

    // SAVED (3)
    {
      company: "OpenAI",
      role: "Software Engineer, API Platform",
      jobDescription: `Build APIs used by millions of developers.

Requirements:
- 5+ years experience
- API design expertise
- Python or Go
- Scale experience`,
      jobUrl: "https://openai.com/careers/api-platform",
      matchScore: 87,
      analysis: `**Strong Match (87%)**

API experience is strong. Python is secondary skill but sufficient.`,
      coverLetter: "", // Not yet written - saved for later
      status: "saved",
      appliedAt: null,
      notes: "Waiting for Vercel/Stripe decisions before applying to more AI companies.",
    },
    {
      company: "Shopify",
      role: "Staff Developer, Checkout",
      jobDescription: `Lead development of Shopify's checkout experience.

Requirements:
- 8+ years experience
- E-commerce background preferred
- React and GraphQL`,
      jobUrl: "https://shopify.com/careers/staff-checkout",
      matchScore: 82,
      analysis: `**Good Match (82%)**

Technical skills align. E-commerce experience limited but strong general background.`,
      coverLetter: "", // Not yet written - saved for later
      status: "saved",
      appliedAt: null,
      notes: "Backup option. Remote-first is appealing. Will apply if others fall through.",
    },
    {
      company: "Datadog",
      role: "Senior Engineer, Observability",
      jobDescription: `Build monitoring tools for the cloud era.

Requirements:
- Distributed systems expertise
- Go or Java
- Observability/APM experience`,
      jobUrl: "https://datadog.com/careers/observability",
      matchScore: 75,
      analysis: `**Moderate Match (75%)**

Good distributed systems fit, but Go/Java and APM specifics are gaps.`,
      coverLetter: "", // Not yet written - saved for later
      status: "saved",
      appliedAt: null,
      notes: "Interesting domain. Save for later exploration.",
    },

    // REJECTED (3) - Different rejection reasons for testing
    {
      company: "Netflix",
      role: "Senior UI Engineer",
      jobDescription: `Join the team building the Netflix experience for 200M+ subscribers.

Requirements:
- Expert JavaScript/TypeScript skills
- Performance optimization experience
- A/B testing and experimentation
- TV/streaming experience preferred`,
      jobUrl: "https://netflix.com/jobs/senior-ui",
      matchScore: 88,
      analysis: `**Strong Match (88%)**

Your frontend optimization work is highly relevant. A/B testing matches analytics experience.`,
      coverLetter: `Dear Netflix Team...`,
      status: "rejected",
      appliedAt: new Date("2025-12-20"),
      notes:
        "Rejected after final round. Feedback: Strong technical skills but looking for more TV/streaming domain experience. Hiring manager said to reapply in 6 months.",
    },
    {
      company: "Meta",
      role: "Software Engineer, React Core",
      jobDescription: `Work on React itself at Meta.

Requirements:
- Deep React knowledge
- Compiler experience
- Framework development`,
      jobUrl: "https://meta.com/careers/react-core",
      matchScore: 78,
      analysis: `**Good Match (78%)**

Strong React user but compiler experience lacking.`,
      coverLetter: `Dear Meta Team...`,
      status: "rejected",
      appliedAt: new Date("2025-11-15"),
      notes:
        "Rejected at resume screen. Feedback: Looking for more compiler/language theory background. The Vercel role is better fit anyway.",
    },
    {
      company: "Discord",
      role: "Senior Backend Engineer",
      jobDescription: `Scale Discord's real-time infrastructure.

Requirements:
- Elixir, Rust, or C++
- Real-time systems experience
- Gaming/community platform experience`,
      jobUrl: "https://discord.com/jobs/backend",
      matchScore: 65,
      analysis: `**Weak Match (65%)**

Real-time experience is relevant but language requirements are a poor fit.`,
      coverLetter: `Dear Discord Team...`,
      status: "rejected",
      appliedAt: new Date("2025-12-01"),
      notes:
        "Rejected. Expected - language stack mismatch. Good learning experience in interview prep.",
    },
  ];

  // ============================================
  // Applications for User 2 (Sarah - 8 applications)
  // Junior-level roles
  // ============================================

  const user2Applications = [
    {
      company: "Webflow",
      role: "Junior Frontend Developer",
      jobDescription: `Join our team building the future of visual development.

Requirements:
- 1-3 years React experience
- Strong CSS skills
- Passion for design tools`,
      jobUrl: "https://webflow.com/careers/junior-frontend",
      matchScore: 88,
      analysis: `**Strong Match for Your Level (88%)**

Your React and CSS skills align well. Accessibility focus is a differentiator!`,
      coverLetter: `Dear Webflow Team...`,
      status: "interviewing",
      appliedAt: new Date("2026-01-05"),
      notes: "Phone screen went well! Coding challenge scheduled for Jan 12.",
    },
    {
      company: "Mailchimp",
      role: "Frontend Engineer I",
      jobDescription: `Build email marketing tools used by millions.

Requirements:
- 1+ years professional experience
- React and TypeScript
- Good communication skills`,
      jobUrl: "https://mailchimp.com/careers/fe-1",
      matchScore: 85,
      analysis: `**Good Match (85%)**

Experience level aligns. E-commerce background from LocalTech is relevant.`,
      coverLetter: `Dear Mailchimp Team...`,
      status: "applied",
      appliedAt: new Date("2026-01-08"),
      notes: "Applied through LinkedIn. Company has good junior engineering culture.",
    },
    {
      company: "Canva",
      role: "Junior Software Engineer",
      jobDescription: `Help millions of people design anything.

Requirements:
- Recent grad or 1-2 years experience
- JavaScript/TypeScript
- Interest in creative tools`,
      jobUrl: "https://canva.com/careers/junior-swe",
      matchScore: 82,
      analysis: `**Good Match (82%)**

Creative tools interest aligns. Good growth opportunity.`,
      coverLetter: `Dear Canva Team...`,
      status: "saved",
      appliedAt: null,
      notes: "Remote role in Austin! Will apply after Webflow interview.",
    },
    {
      company: "Local Startup",
      role: "Frontend Developer",
      jobDescription: `Early-stage Austin startup needs frontend help.

Requirements:
- React experience
- Move fast, wear multiple hats`,
      jobUrl: "https://localstartup.com/jobs",
      matchScore: 90,
      analysis: `**Great Match (90%)**

Startup will value your energy and growth mindset!`,
      coverLetter: `Dear Local Startup...`,
      status: "offer",
      appliedAt: new Date("2025-12-28"),
      notes:
        "🎉 Offer received! $85K + equity. Small team of 4 engineers. Good learning opportunity but less structure.",
    },
    {
      company: "Indeed",
      role: "Associate Frontend Engineer",
      jobDescription: `Help job seekers find work.

Requirements:
- 1-2 years experience
- React or Vue
- Austin area preferred`,
      jobUrl: "https://indeed.com/careers/assoc-fe",
      matchScore: 84,
      analysis: `**Good Match (84%)**

Local Austin role. Good benefits and growth path.`,
      coverLetter: `Dear Indeed Team...`,
      status: "applied",
      appliedAt: new Date("2026-01-09"),
      notes: "Large company with structured mentorship. Applied via referral.",
    },
    {
      company: "Atlassian",
      role: "Junior Developer, Trello",
      jobDescription: `Work on Trello's web experience.

Requirements:
- 1-3 years experience
- React expertise
- Remote-first`,
      jobUrl: "https://atlassian.com/careers/trello-junior",
      matchScore: 86,
      analysis: `**Good Match (86%)**

Your React experience fits. Remote flexibility is nice.`,
      coverLetter: `Dear Atlassian Team...`,
      status: "rejected",
      appliedAt: new Date("2025-12-10"),
      notes:
        "Rejected after phone screen. They wanted more TypeScript depth. Good feedback to improve.",
    },
    {
      company: "Zillow",
      role: "Frontend Engineer I",
      jobDescription: `Build tools for home buyers and sellers.

Requirements:
- 1-2 years web development
- React and performance
- Seattle or Austin`,
      jobUrl: "https://zillow.com/careers/fe-1",
      matchScore: 80,
      analysis: `**Good Match (80%)**

React skills fit. Real estate domain is new but learnable.`,
      coverLetter: `Dear Zillow Team...`,
      status: "applied",
      appliedAt: new Date("2026-01-07"),
      notes: "Interesting product space. Austin office available.",
    },
    {
      company: "GitHub",
      role: "Junior Frontend Engineer",
      jobDescription: `Help developers collaborate better.

Requirements:
- Early career (0-2 years)
- JavaScript/TypeScript
- Git expertise`,
      jobUrl: "https://github.com/careers/junior-fe",
      matchScore: 91,
      analysis: `**Excellent Match (91%)**

Dev tools passion + React skills. Dream company!`,
      coverLetter: `Dear GitHub Team...`,
      status: "interviewing",
      appliedAt: new Date("2026-01-04"),
      notes:
        "Passed coding screen! Virtual onsite with 3 rounds scheduled for Jan 16. Prepare portfolio presentation.",
    },
  ];

  // ============================================
  // Applications for User 3 (Marcus - 6 applications)
  // Career change focused
  // ============================================

  const user3Applications = [
    {
      company: "Amazon",
      role: "Software Development Engineer",
      jobDescription: `Join AWS to build cloud services.

Requirements:
- 3+ years development experience
- Strong CS fundamentals
- Java or Python`,
      jobUrl: "https://amazon.jobs/sde",
      matchScore: 83,
      analysis: `**Good Match (83%)**

Python experience is strong. DS background shows problem-solving skills.`,
      coverLetter: `Dear Amazon Team...`,
      status: "interviewing",
      appliedAt: new Date("2026-01-06"),
      notes: "Phone screen passed. Loop scheduled for Jan 20. Review Leadership Principles!",
    },
    {
      company: "Snowflake",
      role: "Software Engineer, Data Platform",
      jobDescription: `Build the data cloud.

Requirements:
- Data systems experience
- Python or Java
- SQL expertise`,
      jobUrl: "https://snowflake.com/careers/data-platform",
      matchScore: 92,
      analysis: `**Excellent Match (92%)**

Your data background is perfect for this role. Python + SQL expertise aligns.`,
      coverLetter: `Dear Snowflake Team...`,
      status: "offer",
      appliedAt: new Date("2025-12-18"),
      notes: "🎉 Offer! $175K base + equity. Great bridge between DS and SWE. Decision by Jan 15.",
    },
    {
      company: "Databricks",
      role: "Software Engineer, MLOps",
      jobDescription: `Build ML infrastructure at scale.

Requirements:
- ML systems experience
- Python expertise
- Spark knowledge preferred`,
      jobUrl: "https://databricks.com/careers/mlops",
      matchScore: 90,
      analysis: `**Excellent Match (90%)**

MLOps experience aligns perfectly. This leverages your ML background.`,
      coverLetter: `Dear Databricks Team...`,
      status: "applied",
      appliedAt: new Date("2026-01-09"),
      notes: "Great role that bridges ML and engineering. Applied via referral from ex-colleague.",
    },
    {
      company: "Airbnb",
      role: "Software Engineer, Data Services",
      jobDescription: `Build data infrastructure for millions of hosts and guests.

Requirements:
- 3+ years experience
- Data pipeline experience
- Python or Scala`,
      jobUrl: "https://airbnb.com/careers/data-services",
      matchScore: 85,
      analysis: `**Strong Match (85%)**

Data pipeline experience is directly relevant. Python is primary language.`,
      coverLetter: `Dear Airbnb Team...`,
      status: "saved",
      appliedAt: null,
      notes: "Interesting role. Will apply after Snowflake decision.",
    },
    {
      company: "Lyft",
      role: "Software Engineer, ML Platform",
      jobDescription: `Scale ML at Lyft.

Requirements:
- ML systems experience
- Python
- Kubernetes experience`,
      jobUrl: "https://lyft.com/careers/ml-platform",
      matchScore: 88,
      analysis: `**Strong Match (88%)**

ML platform experience aligns. Good K8s experience too.`,
      coverLetter: `Dear Lyft Team...`,
      status: "rejected",
      appliedAt: new Date("2025-12-01"),
      notes:
        "Rejected after onsite. Feedback: Strong ML but wanted more production SWE experience. Fair assessment.",
    },
    {
      company: "Weights & Biases",
      role: "Software Engineer",
      jobDescription: `Build ML developer tools.

Requirements:
- ML background
- Python
- Startup mindset`,
      jobUrl: "https://wandb.com/careers/swe",
      matchScore: 91,
      analysis: `**Excellent Match (91%)**

Perfect intersection of ML expertise and engineering. Great culture fit.`,
      coverLetter: `Dear W&B Team...`,
      status: "interviewing",
      appliedAt: new Date("2026-01-08"),
      notes: "Phone screen went great! They loved my ML background. Coding interview next week.",
    },
  ];

  // Delete existing applications and create new ones
  await prisma.application.deleteMany({ where: { userId: user1.id } });
  await prisma.application.deleteMany({ where: { userId: user2.id } });
  await prisma.application.deleteMany({ where: { userId: user3.id } });

  for (const app of user1Applications) {
    await prisma.application.create({ data: { userId: user1.id, ...app } });
  }
  for (const app of user2Applications) {
    await prisma.application.create({ data: { userId: user2.id, ...app } });
  }
  for (const app of user3Applications) {
    await prisma.application.create({ data: { userId: user3.id, ...app } });
  }

  const totalApps = user1Applications.length + user2Applications.length + user3Applications.length;

  /* eslint-disable no-console */
  console.log(`📋 Created ${totalApps} applications total:`);
  console.log(`   - Rafael: ${user1Applications.length} applications`);
  console.log(
    `     (${user1Applications.filter((a) => a.status === "offer").length} offers, ` +
      `${user1Applications.filter((a) => a.status === "interviewing").length} interviewing, ` +
      `${user1Applications.filter((a) => a.status === "applied").length} applied, ` +
      `${user1Applications.filter((a) => a.status === "saved").length} saved, ` +
      `${user1Applications.filter((a) => a.status === "rejected").length} rejected)`
  );
  console.log(`   - Sarah: ${user2Applications.length} applications`);
  console.log(
    `     (${user2Applications.filter((a) => a.status === "offer").length} offers, ` +
      `${user2Applications.filter((a) => a.status === "interviewing").length} interviewing, ` +
      `${user2Applications.filter((a) => a.status === "applied").length} applied, ` +
      `${user2Applications.filter((a) => a.status === "saved").length} saved, ` +
      `${user2Applications.filter((a) => a.status === "rejected").length} rejected)`
  );
  console.log(`   - Marcus: ${user3Applications.length} applications`);
  console.log(
    `     (${user3Applications.filter((a) => a.status === "offer").length} offers, ` +
      `${user3Applications.filter((a) => a.status === "interviewing").length} interviewing, ` +
      `${user3Applications.filter((a) => a.status === "applied").length} applied, ` +
      `${user3Applications.filter((a) => a.status === "saved").length} saved, ` +
      `${user3Applications.filter((a) => a.status === "rejected").length} rejected)`
  );
  console.log("");

  console.log(`✅ Seeding complete!`);
  console.log("");
  console.log(`📊 Summary:`);
  console.log(`   - 3 users with different personas`);
  console.log(`   - ${user1CVs.length + user2CVs.length + user3CVs.length} CV variants`);
  console.log(`   - ${totalApps} job applications across all statuses`);
  /* eslint-enable no-console */
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
