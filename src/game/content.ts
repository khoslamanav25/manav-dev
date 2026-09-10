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
  bullets: string[];
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
        bullets: [
          "Launched a Gemini agent pipeline querying a knowledge graph of 3D CAD building elements to produce priced construction material lists mapped directly into customers' CSV/Excel templates, demoed to 5+ general contractors.",
          "Shipped a lot-fitting system analyzing raw site plan geometry in a PostGIS spatial engine to determine whether a proposed building fits within lot constraints, processing 27,000+ geometry objects per drawing across 204 real customer sites.",
          "Delivered a multi-agent scope review system comparing design drawings against subcontractor bids to flag unpriced or unassigned work, cutting estimator review of full bid packages from 2 hours to 4.5 minutes with cited evidence.",
        ],
        tags: ["Gemini", "Knowledge Graphs", "PostGIS", "Multi-Agent"],
      },
      {
        id: "blue-origin",
        title: "Software Engineering Intern",
        subtitle: "Blue Origin",
        meta: "May 2026 – Aug 2026 · Renton, WA",
        bullets: [
          "Engineered a High-Performance Computing automation layer for aerospace engineers to schedule multi-day simulations through Slurm across shared CPU/GPU clusters without infrastructure support, onboarding 3 teams.",
          "Designed a provisioning pipeline that builds fully configured HPC clusters on demand using AWS Parallel Computing Service from a single FastAPI request, replacing manual configuration with Terraform to cut environment setup by 80%.",
          "Automated a CI/CD pipeline that pre-builds Amazon Machine Images with configured Linux environments, including simulation dependencies and Datadog monitoring agents, eliminating 45 minutes of manual work per deploy.",
        ],
        tags: ["Slurm", "AWS", "Terraform", "FastAPI", "CI/CD"],
      },
      {
        id: "circular-action",
        title: "Software Developer",
        subtitle: "Circular Action Alliance",
        meta: "Jan 2026 – Apr 2026 · Ann Arbor, MI",
        bullets: [
          "Architected a packaging data pipeline cataloging product dimensions, weight, and material across 2000+ member producers (Walmart, Coca-Cola, Amazon, etc.), generating 7500+ validated entries with 60% less analyst work.",
          "Built an automated product discovery system deploying AI agents on the web to scrape producer catalogs via Tavily search, filtering junk URLs and blocking hallucinated products, cutting research 30× from 1 hour to 2 minutes.",
        ],
        tags: ["Data Pipelines", "AI Agents", "Tavily"],
      },
      {
        id: "recognition-robotics",
        title: "Software Engineering Intern",
        subtitle: "Recognition Robotics",
        meta: "Jun 2025 – Aug 2025 · Wixom, MI",
        bullets: [
          "Developed a Python kinematics solver converting target part positions into arm movements across 15+ industrial robots, replacing iterative approximations with NumPy closed-form solutions to cut placement error to ±1 mm.",
          "Simulated robot kinematics in RoboDK to validate motion paths and debug arm movements before deploying to hardware, cutting on-robot tuning time from ~30 minutes to 7 minutes across 2,000+ simulations.",
        ],
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
        bullets: [
          "Founded a multi-agent blueprint analysis platform automating data extraction for construction estimators, reducing manual workflows by 95% and winning 1st place at UMich V1 Demo Day as the top-voted startup by VC judges.",
          "Built a self-correcting segmentation pipeline using synchronized Meta SAM3 and GPT-5.1 agents on raw blueprints.",
        ],
        tags: ["Multi-Agent", "SAM3", "GPT-5.1", "Computer Vision"],
      },
      {
        id: "vision-localization",
        title: "Multi-Camera Vision Localization System",
        bullets: [
          "Deployed custom position estimation models fusing encoder data, IMU, and stereo vision to reduce error by 99.5%.",
          "Devised a simplified Kalman filter combining robot kinematics with timestamped vision data, handling <30 ms latency.",
        ],
        tags: ["Kalman Filters", "Stereo Vision", "IMU"],
      },
      {
        id: "gunshot-detection",
        title: "Gunshot Detection Alarm",
        bullets: [
          "Created a Raspberry Pi 4-based gunshot detection alarm, alerting law enforcement within ~15 seconds of detected gunfire.",
          "Implemented a Convolutional Recurrent Neural Network (CRNN) with Conv2D layers, LSTM layers, and an STFT-based feature extraction pipeline, attaining 97%+ recall and 90%+ accuracy, outperforming the SOTA standard of 86.7%.",
        ],
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
        id: "umich",
        title: "University of Michigan",
        subtitle:
          "B.S.E. Computer Science (Engineering) · B.S. Pure Mathematics (LSA)",
        meta: "Ann Arbor, MI",
        bullets: [
          "Coursework: Data Structures & Algorithms, Distributed Systems, Introductory Computer Architecture, Discrete Math.",
          "Activities: Atlas Digital Tech Consulting, V1 Startup Accelerator, Michigan Investment Group (Quant).",
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
        bullets: [],
        tags: [
          "Java",
          "Python",
          "C/C++",
          "Bash",
          "JavaScript",
          "React.js",
          "React Native",
        ],
      },
      {
        id: "technologies",
        title: "Technologies",
        bullets: [],
        tags: [
          "Docker",
          "Kubernetes",
          "Linux",
          "Slurm",
          "Git",
          "CI/CD",
          "Terraform",
          "Packer",
          "AWS",
          "Supabase",
          "TensorFlow",
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
        bullets: [
          "I'm a software engineer studying computer science and pure math at the University of Michigan. I like building agentic systems, robotics software, and things that move fast — currently doing that at AutoSitu (YC W26).",
          "Off the keyboard: tennis (hence this website), pickleball, poker, NFL football, chess, traveling, weightlifting, NYTimes games, and cryptocurrency.",
        ],
        tags: [
          "Tennis",
          "Pickleball",
          "Poker",
          "NFL Football",
          "Chess",
          "Traveling",
          "Weightlifting",
          "NYTimes Games",
          "Cryptocurrency",
        ],
      },
    ],
  },
];

export function getSection(id: SectionId): Section {
  const s = SECTIONS.find((s) => s.id === id);
  if (!s) throw new Error(`unknown section: ${id}`);
  return s;
}
