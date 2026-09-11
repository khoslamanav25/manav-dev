// Single source of truth for all portfolio content.
// Rendered by the game targets, the slide-in panels, and the /text route.
// Intentionally omitted everywhere: phone number, graduation year, resume PDF.

export type SectionId =
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "about";

export interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string; // dates / location line
  summary?: string; // short paragraph style
  bullets?: string[]; // direct list style (education, skills)
  tags?: string[];
  link?: { label: string; href: string };
}

export interface Section {
  id: SectionId;
  label: string; // nav label
  heading: string; // big panel heading
  items: ContentItem[];
}

export const IDENTITY = {
  name: "Manav Khosla",
  tagline: "software engineer · university of michigan",
  email: "mkhosla@umich.edu",
  github: "https://github.com/khoslamanav25",
  linkedin: "https://www.linkedin.com/in/manav-khosla",
};

export const SECTIONS: Section[] = [
  {
    id: "experience",
    label: "Experience",
    heading: "work",
    items: [
      {
        id: "autositu",
        title: "Software Engineering Intern",
        subtitle: "AutoSitu (Y Combinator W26)",
        meta: "Aug 2026 – Present · Remote",
        summary:
          "I build agentic systems for construction intelligence at AutoSitu. My work spans a Gemini agent pipeline that turns knowledge graphs of 3D CAD elements into priced material lists, a PostGIS engine that checks whether a proposed building actually fits its lot across hundreds of real customer sites, and a multi-agent reviewer that compares drawings against subcontractor bids.",
        tags: ["Gemini", "Knowledge Graphs", "PostGIS", "Multi-Agent"],
      },
      {
        id: "blue-origin",
        title: "Software Engineering Intern",
        subtitle: "Blue Origin",
        meta: "May 2026 – Aug 2026 · Renton, WA",
        summary:
          "At Blue Origin I made high-performance computing self-serve for aerospace engineers. I built an automation layer for scheduling multi-day simulations through Slurm on shared CPU/GPU clusters, and a provisioning pipeline that spins up fully configured HPC clusters on demand from a single API request. Pre-baked machine images with all simulation dependencies cut environment setup time by 80% and eliminated most of the manual work per deploy.",
        tags: ["Slurm", "AWS", "Terraform", "FastAPI", "CI/CD"],
      },
      {
        id: "circular-action",
        title: "Software Developer",
        subtitle: "Circular Action Alliance",
        meta: "Jan 2026 – Apr 2026 · Ann Arbor, MI",
        summary:
          "I architected the data pipeline cataloging packaging dimensions, weight, and materials across 2,000+ member producers — the Walmarts and Coca-Colas of the world. To feed it, I deployed AI agents that discover and scrape producer catalogs on the open web while filtering junk URLs and hallucinated products. Research that took an analyst an hour now takes about two minutes.",
        tags: ["Data Pipelines", "AI Agents", "Tavily"],
      },
      {
        id: "recognition-robotics",
        title: "Software Engineering Intern",
        subtitle: "Recognition Robotics",
        meta: "Jun 2025 – Aug 2025 · Wixom, MI",
        summary:
          "I wrote the kinematics solver that converts target part positions into arm movements for 15+ industrial robots, replacing iterative approximation with closed-form NumPy solutions accurate to ±1 mm. Simulating everything in RoboDK first meant motion paths were validated before they ever touched hardware, cutting on-robot tuning from half an hour to about seven minutes.",
        tags: ["Python", "NumPy", "Robotics", "RoboDK"],
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    heading: "projects",
    items: [
      {
        id: "riteoff",
        title: "Riteoff",
        subtitle: "Founder",
        summary:
          "Riteoff is a multi-agent blueprint analysis platform I founded to automate data extraction for construction estimators, cutting their manual workflows by ~95%. Its self-correcting segmentation pipeline runs synchronized Meta SAM3 and GPT-5.1 agents over raw blueprints. It won 1st place at UMich V1 Demo Day as the VC judges' top-voted startup.",
        tags: ["Multi-Agent", "SAM3", "GPT-5.1", "Computer Vision"],
      },
      {
        id: "vision-localization",
        title: "Multi-Camera Vision Localization",
        summary:
          "A robot localization system fusing encoder data, IMU readings, and stereo vision into custom position estimation models that reduced error by 99.5%. A simplified Kalman filter reconciles robot kinematics with timestamped vision data and keeps latency under 30 ms.",
        tags: ["Kalman Filters", "Stereo Vision", "IMU"],
      },
      {
        id: "gunshot-detection",
        title: "Gunshot Detection Alarm",
        summary:
          "A Raspberry Pi device that detects gunfire and alerts law enforcement within about 15 seconds. Its CRNN — Conv2D and LSTM layers over an STFT feature pipeline — reaches 97%+ recall and 90%+ accuracy, beating the published state of the art of 86.7%.",
        tags: ["CRNN", "TensorFlow", "Raspberry Pi", "Audio ML"],
        link: {
          label: "github.com/khoslamanav25/GunshotDetectionAlarm",
          href: "https://github.com/khoslamanav25/GunshotDetectionAlarm",
        },
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    heading: "education",
    items: [
      {
        id: "umich-cs",
        title: "B.S.E. Computer Science",
        subtitle: "University of Michigan · College of Engineering",
        meta: "Ann Arbor, MI",
        bullets: [
          "Relevant coursework: Data Structures & Algorithms, Distributed Systems, Introductory Computer Architecture, Discrete Math",
          "Activities: Atlas Digital Tech Consulting, V1 Startup Accelerator, Michigan Investment Group (Quant)",
        ],
      },
      {
        id: "umich-math",
        title: "B.S. Pure Mathematics",
        subtitle: "University of Michigan · College of LSA",
        meta: "Ann Arbor, MI",
        bullets: [
          "Relevant coursework: Calculus I, Calculus II, Proof-Based Linear Algebra, Advanced Calculus I (Intro to Real Analysis)",
        ],
      },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    heading: "skills",
    items: [
      {
        id: "languages",
        title: "Languages & Frameworks",
        bullets: [
          "Languages: Java, Python, C/C++, Bash, JavaScript",
          "Frameworks: React.js, React Native",
        ],
      },
      {
        id: "technologies",
        title: "Technologies",
        bullets: [
          "Docker, Kubernetes, Linux, Slurm",
          "Git, CI/CD, Terraform, Packer",
          "AWS, Supabase, TensorFlow",
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    heading: "about",
    items: [
      {
        id: "about-me",
        title: "Hey, I'm Manav 👋",
        summary:
          "I'm a software engineer studying CS and pure math at the University of Michigan, currently building agentic systems at AutoSitu (YC W26). I like problems where software meets the physical world — robots, rockets, construction sites. Off the keyboard it's tennis (hence this website), pickleball, poker, chess, NFL football, weightlifting, traveling, NYT games, and the occasional crypto rabbit hole.",
        tags: ["Tennis", "Pickleball", "Poker", "Chess", "NFL", "Traveling"],
      },
    ],
  },
];

export function getSection(id: SectionId): Section {
  const s = SECTIONS.find((s) => s.id === id);
  if (!s) throw new Error(`unknown section: ${id}`);
  return s;
}
