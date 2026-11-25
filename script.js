/* ==========================================================================
   SkillSprout: LearnLoop — Core Application Logic
   Architecture: Modular Vanilla JS with localStorage Persistence & DAG Engine
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. STORAGE KEYS & APPLICATION STATE
     ------------------------------------------------------------------------ */

  const STORAGE_KEYS = {
    PROFILE: "skillsprout_student_profile",
    ENROLLMENTS: "skillsprout_enrollments",
    PROGRESS: "skillsprout_progress",
    PREFERENCES: "skillsprout_study_preferences",
    PEER_GROUPS: "skillsprout_peer_groups",
  };

  const VIEW_META = {
    overview: { title: "Overview", ctaLabel: "View Learning Roadmap", ctaView: "roadmap" },
    roadmap: { title: "My Learning Roadmap", ctaLabel: "Browse Course Catalog", ctaView: "catalog" },
    catalog: { title: "Course Catalog", ctaLabel: "My Enrollments", ctaView: "enrollments" },
    enrollments: { title: "My Enrollments", ctaLabel: "Track Progress", ctaView: "progress" },
    progress: { title: "Progress Tracker", ctaLabel: "Estimate Study Hours", ctaView: "estimator" },
    estimator: { title: "Study Hours Estimator", ctaLabel: "Find Study Peers", ctaView: "peers" },
    peers: { title: "Peer Study Groups", ctaLabel: "Create Study Group", ctaAction: "open-group-modal" },
    graph: { title: "Prerequisite Graph", ctaLabel: "My Learning Roadmap", ctaView: "roadmap" },
    profile: { title: "My Profile", ctaLabel: "Export Roadmap PDF", ctaView: "export" },
    export: { title: "Export Roadmap", ctaLabel: "Print / Save PDF", ctaAction: "print-pdf" },
  };

  const DIFFICULTY_MULTIPLIERS = {
    Beginner: 1.25,
    Intermediate: 1.75,
    Advanced: 2.25,
  };

  /* ------------------------------------------------------------------------
     2. STRUCTURED ENGINEERING COURSE CATALOG (43 AICTE/UGC Courses)
     ------------------------------------------------------------------------ */

  function createModules(prefix, titles) {
    return titles.map(function (title, idx) {
      return {
        id: prefix + "-m" + (idx + 1),
        title: "Module " + (idx + 1) + ": " + title,
        durationHours: 3 + (idx % 2),
      };
    });
  }

  const COURSE_CATALOG = [
    // --- FOUNDATIONAL COURSES (10) ---
    {
      id: "CS101",
      code: "CS101",
      title: "Programming Fundamentals",
      description:
        "Introduces algorithmic thinking, variables, control flow, functions, arrays, and debugging practices for first-year engineering students.",
      credits: 4,
      difficulty: "Beginner",
      semester: 1,
      prerequisites: [],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
        "Other",
      ],
      skillTags: ["Problem Solving", "Control Flow", "Functions", "Debugging"],
      careerTags: [
        "Full-Stack Web Development",
        "Artificial Intelligence and Machine Learning",
        "Data Science",
        "Cybersecurity",
        "Cloud Computing",
        "Software Development",
        "Mobile Application Development",
      ],
      modules: createModules("CS101", [
        "Variables, Expressions, and Input/Output",
        "Conditionals and Iterative Loops",
        "Modular Functions and Scope",
        "Arrays, Strings, and Basic Debugging",
      ]),
    },
    {
      id: "MA101",
      code: "MA101",
      title: "Mathematics I (Calculus & Matrices)",
      description:
        "Covers differential calculus, multivariable optimization, matrix algebra, and eigenvalues essential for engineering computation.",
      credits: 4,
      difficulty: "Beginner",
      semester: 1,
      prerequisites: [],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
        "Other",
      ],
      skillTags: ["Calculus", "Matrices", "Optimization"],
      careerTags: [
        "Artificial Intelligence and Machine Learning",
        "Data Science",
        "Software Development",
      ],
      modules: createModules("MA101", [
        "Limits, Continuity, and Derivatives",
        "Partial Derivatives and Optimization",
        "Systems of Linear Equations",
        "Eigenvalues and Matrix Diagonalization",
      ]),
    },
    {
      id: "MA102",
      code: "MA102",
      title: "Mathematics II (Differential Equations & Transforms)",
      description:
        "Builds upon Calculus I with ordinary differential equations, Laplace transforms, vector calculus, and series convergence.",
      credits: 4,
      difficulty: "Intermediate",
      semester: 2,
      prerequisites: ["MA101"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
      ],
      skillTags: ["Differential Equations", "Laplace Transforms", "Vector Calculus"],
      careerTags: [
        "Artificial Intelligence and Machine Learning",
        "Data Science",
      ],
      modules: createModules("MA102", [
        "First and Second Order ODEs",
        "Laplace Transforms and Applications",
        "Vector Differentiation and Integration",
        "Fourier Series and Convergence",
      ]),
    },
    {
      id: "PH101",
      code: "PH101",
      title: "Engineering Physics",
      description:
        "Explores wave optics, quantum mechanics basics, semiconductor physics, and laser principles relevant to modern computing hardware.",
      credits: 3,
      difficulty: "Beginner",
      semester: 1,
      prerequisites: [],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
      ],
      skillTags: ["Semiconductors", "Optics", "Quantum Basics"],
      careerTags: ["Cloud Computing", "Software Development"],
      modules: createModules("PH101", [
        "Wave Optics and Interference",
        "Quantum Mechanics Foundations",
        "Semiconductor Band Theory",
        "Optoelectronics and Fiber Optics",
      ]),
    },
    {
      id: "CH101",
      code: "CH101",
      title: "Engineering Chemistry",
      description:
        "Studies electrochemistry, battery storage materials, polymers, spectroscopy, and environmental engineering fundamentals.",
      credits: 3,
      difficulty: "Beginner",
      semester: 1,
      prerequisites: [],
      branches: [
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
        "Other",
      ],
      skillTags: ["Electrochemistry", "Materials", "Spectroscopy"],
      careerTags: ["Software Development"],
      modules: createModules("CH101", [
        "Atomic Structure and Bonding",
        "Electrochemistry and Energy Storage",
        "Engineering Polymers and Composites",
        "Water Treatment and Green Chemistry",
      ]),
    },
    {
      id: "EE101",
      code: "EE101",
      title: "Basic Electrical Engineering",
      description:
        "Covers DC/AC circuit analysis, Kirchhoff laws, transformers, electrical machines, and domestic power safety.",
      credits: 3,
      difficulty: "Beginner",
      semester: 1,
      prerequisites: [],
      branches: [
        "Computer Science Engineering (CSE)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering",
      ],
      skillTags: ["Circuit Analysis", "AC/DC Networks", "Power Basics"],
      careerTags: ["Cloud Computing", "Cybersecurity"],
      modules: createModules("EE101", [
        "DC Circuits and Network Theorems",
        "Single-Phase AC Circuits",
        "Transformers and Induction Motors",
        "Electrical Safety and Grounding",
      ]),
    },
    {
      id: "ME101",
      code: "ME101",
      title: "Engineering Graphics & CAD",
      description:
        "Develops spatial visualization using orthographic projections, isometric views, sectioning, and introductory CAD drafting.",
      credits: 2,
      difficulty: "Beginner",
      semester: 1,
      prerequisites: [],
      branches: [
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical and Electronics Engineering (EEE)",
        "Other",
      ],
      skillTags: ["CAD", "Orthographic Projection", "Spatial Design"],
      careerTags: ["Software Development"],
      modules: createModules("ME101", [
        "Engineering Scales and Curves",
        "Orthographic Projections",
        "Isometric Views and Solids",
        "2D Computer-Aided Drafting",
      ]),
    },
    {
      id: "HS101",
      code: "HS101",
      title: "Communication Skills",
      description:
        "Strengthens technical writing, engineering documentation, structured presentations, and collaborative team communication.",
      credits: 2,
      difficulty: "Beginner",
      semester: 1,
      prerequisites: [],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
        "Other",
      ],
      skillTags: ["Technical Writing", "Presentations", "Documentation"],
      careerTags: [
        "Full-Stack Web Development",
        "Software Development",
        "Data Science",
        "Cloud Computing",
      ],
      modules: createModules("HS101", [
        "Active Listening and Clarity",
        "Technical Report Writing",
        "Visual Presentation Design",
        "Engineering Team Collaboration",
      ]),
    },
    {
      id: "CS102",
      code: "CS102",
      title: "Problem Solving Using C",
      description:
        "Deepens procedural programming through pointers, dynamic memory management, structs, file I/O, and modular C compilation.",
      credits: 4,
      difficulty: "Beginner",
      semester: 2,
      prerequisites: ["CS101"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
      ],
      skillTags: ["C Programming", "Pointers", "Memory Management"],
      careerTags: ["Software Development", "Cybersecurity", "Cloud Computing"],
      modules: createModules("CS102", [
        "Pointers and Memory Addressing",
        "Dynamic Allocation and Valgrind",
        "Structures, Unions, and Enums",
        "File Handling and Preprocessor Directives",
      ]),
    },
    {
      id: "EC101",
      code: "EC101",
      title: "Digital Logic Design",
      description:
        "Covers Boolean algebra, Karnaugh maps, combinational circuits, flip-flops, counters, and finite state machines.",
      credits: 3,
      difficulty: "Beginner",
      semester: 2,
      prerequisites: ["EE101"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
      ],
      skillTags: ["Boolean Logic", "Combinational Circuits", "FSM"],
      careerTags: ["Cybersecurity", "Software Development"],
      modules: createModules("EC101", [
        "Number Systems and Boolean Algebra",
        "Combinational Logic and Muxes",
        "Sequential Circuits and Flip-Flops",
        "Registers, Counters, and State Machines",
      ]),
    },

    // --- COMPUTER SCIENCE CORE (11) ---
    {
      id: "CS204",
      code: "CS204",
      title: "Discrete Mathematics",
      description:
        "Establishes mathematical rigor for computer science via propositional logic, set theory, combinatorics, relations, and graph theory.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 2,
      prerequisites: ["MA101"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["Graph Theory", "Logic", "Combinatorics"],
      careerTags: [
        "Software Development",
        "Artificial Intelligence and Machine Learning",
        "Cybersecurity",
      ],
      modules: createModules("CS204", [
        "Propositional and Predicate Logic",
        "Sets, Relations, and Functions",
        "Counting, Permutations, and Recurrences",
        "Graphs, Trees, and Eulerian Paths",
      ]),
    },
    {
      id: "CS201",
      code: "CS201",
      title: "Object-Oriented Programming",
      description:
        "Teaches abstraction, encapsulation, inheritance, polymorphism, exception handling, and SOLID class design in Java/C++.",
      credits: 4,
      difficulty: "Intermediate",
      semester: 3,
      prerequisites: ["CS101"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
      ],
      skillTags: ["OOP", "SOLID Principles", "Java / C++"],
      careerTags: [
        "Software Development",
        "Full-Stack Web Development",
        "Mobile Application Development",
      ],
      modules: createModules("CS201", [
        "Classes, Objects, and Encapsulation",
        "Inheritance and Polymorphism",
        "Interfaces, Generics, and Exceptions",
        "Design Patterns and Unit Testing",
      ]),
    },
    {
      id: "CS202",
      code: "CS202",
      title: "Data Structures",
      description:
        "Implements linked lists, stacks, queues, binary search trees, heaps, hash tables, and graph traversals with complexity analysis.",
      credits: 4,
      difficulty: "Intermediate",
      semester: 3,
      prerequisites: ["CS102"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["Trees", "Graphs", "Hash Tables", "Complexity"],
      careerTags: [
        "Software Development",
        "Full-Stack Web Development",
        "Artificial Intelligence and Machine Learning",
        "Data Science",
      ],
      modules: createModules("CS202", [
        "Asymptotic Notation and Linked Lists",
        "Stacks, Queues, and Recursion",
        "Trees, AVL Balancing, and Heaps",
        "Hash Maps and Graph BFS/DFS",
      ]),
    },
    {
      id: "CS203",
      code: "CS203",
      title: "Computer Organization and Architecture",
      description:
        "Explains instruction set architecture, CPU datapaths, pipelining, cache memory hierarchies, and I/O interfacing.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 3,
      prerequisites: ["EC101"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
      ],
      skillTags: ["CPU Pipelining", "Cache Memory", "Assembly"],
      careerTags: ["Cloud Computing", "Cybersecurity", "Software Development"],
      modules: createModules("CS203", [
        "Instruction Sets and Addressing Modes",
        "Arithmetic Logic Unit and Control",
        "Instruction Pipelining Hazards",
        "Cache Hierarchy and Virtual Memory",
      ]),
    },
    {
      id: "CS301",
      code: "CS301",
      title: "Design and Analysis of Algorithms",
      description:
        "Covers divide-and-conquer, greedy strategies, dynamic programming, shortest paths, network flows, and NP-completeness.",
      credits: 4,
      difficulty: "Advanced",
      semester: 4,
      prerequisites: ["CS202", "CS204"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["Dynamic Programming", "Greedy Algorithms", "NP-Completeness"],
      careerTags: [
        "Software Development",
        "Artificial Intelligence and Machine Learning",
        "Data Science",
      ],
      modules: createModules("CS301", [
        "Divide-and-Conquer and Recurrences",
        "Greedy Algorithms and Spanning Trees",
        "Dynamic Programming Patterns",
        "Graph Flows and NP-Completeness",
      ]),
    },
    {
      id: "CS302",
      code: "CS302",
      title: "Database Management Systems",
      description:
        "Covers ER modeling, relational algebra, SQL querying, normalization, B+ tree indexing, and ACID transaction concurrency.",
      credits: 4,
      difficulty: "Intermediate",
      semester: 4,
      prerequisites: ["CS202"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["SQL", "Normalization", "Indexing", "Transactions"],
      careerTags: [
        "Full-Stack Web Development",
        "Software Development",
        "Data Science",
        "Cloud Computing",
      ],
      modules: createModules("CS302", [
        "ER Modeling and Relational Schema",
        "SQL Joins, Subqueries, and Views",
        "Normalization (1NF to BCNF)",
        "Indexing, ACID, and Concurrency Control",
      ]),
    },
    {
      id: "CS303",
      code: "CS303",
      title: "Operating Systems",
      description:
        "Examines process scheduling, threads, synchronization primitives, deadlocks, virtual memory paging, and file system design.",
      credits: 4,
      difficulty: "Advanced",
      semester: 4,
      prerequisites: ["CS202", "CS203"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["Processes", "Concurrency", "Virtual Memory", "Linux"],
      careerTags: ["Cloud Computing", "Cybersecurity", "Software Development"],
      modules: createModules("CS303", [
        "Processes, Threads, and CPU Scheduling",
        "Mutexes, Semaphores, and Deadlocks",
        "Paging, Segmentation, and Page Replacement",
        "File Systems and Disk Scheduling",
      ]),
    },
    {
      id: "CS304",
      code: "CS304",
      title: "Computer Networks",
      description:
        "Explores OSI/TCP-IP layers, routing protocols, congestion control, DNS, HTTP/TLS, and socket programming.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 5,
      prerequisites: ["CS303"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
      ],
      skillTags: ["TCP/IP", "HTTP/TLS", "Routing", "Sockets"],
      careerTags: [
        "Cloud Computing",
        "Cybersecurity",
        "Full-Stack Web Development",
      ],
      modules: createModules("CS304", [
        "Physical and Data Link Layers",
        "IP Addressing, Subnetting, and Routing",
        "TCP Congestion Control and UDP",
        "DNS, HTTP, and Transport Security",
      ]),
    },
    {
      id: "CS305",
      code: "CS305",
      title: "Software Engineering",
      description:
        "Teaches agile delivery, requirements specification, system architecture, automated testing, version control, and CI workflows.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 5,
      prerequisites: ["CS201", "CS302"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["System Architecture", "Agile", "Testing", "Git"],
      careerTags: [
        "Software Development",
        "Full-Stack Web Development",
        "Cloud Computing",
      ],
      modules: createModules("CS305", [
        "SDLC Models and Requirements",
        "Architecture Diagrams and Modularity",
        "Unit, Integration, and Regression Testing",
        "Code Reviews and Release Management",
      ]),
    },
    {
      id: "CS401",
      code: "CS401",
      title: "Theory of Computation",
      description:
        "Investigates finite automata, regular expressions, context-free grammars, Turing machines, and decidability limits.",
      credits: 3,
      difficulty: "Advanced",
      semester: 5,
      prerequisites: ["CS204", "CS301"],
      branches: ["Computer Science Engineering (CSE)"],
      skillTags: ["Automata", "Grammars", "Turing Machines"],
      careerTags: ["Software Development"],
      modules: createModules("CS401", [
        "DFA, NFA, and Regular Languages",
        "Context-Free Grammars and Pushdown Automata",
        "Turing Machines and Computability",
        "Decidability and Reducibility",
      ]),
    },
    {
      id: "CS402",
      code: "CS402",
      title: "Compiler Design",
      description:
        "Covers lexical analysis, LL/LR parsing, syntax-directed translation, intermediate code generation, and optimization passes.",
      credits: 4,
      difficulty: "Advanced",
      semester: 6,
      prerequisites: ["CS401", "CS203"],
      branches: ["Computer Science Engineering (CSE)"],
      skillTags: ["Lexing", "Parsing", "AST", "Code Generation"],
      careerTags: ["Software Development"],
      modules: createModules("CS402", [
        "Lexical Analysis and Tokenizers",
        "Top-Down and Bottom-Up Parsing",
        "Semantic Analysis and Type Checking",
        "Intermediate Representation and Optimization",
      ]),
    },

    // --- WEB & MOBILE DEVELOPMENT (7) ---
    {
      id: "WD101",
      code: "WD101",
      title: "HTML and CSS Fundamentals",
      description:
        "Builds accessible semantic HTML5 interfaces styled with modern CSS3 Flexbox, Grid, responsive breakpoints, and typography.",
      credits: 3,
      difficulty: "Beginner",
      semester: 1,
      prerequisites: [],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Other",
      ],
      skillTags: ["HTML5", "CSS3", "Flexbox & Grid", "Accessibility"],
      careerTags: ["Full-Stack Web Development", "Mobile Application Development"],
      modules: createModules("WD101", [
        "Semantic HTML5 and Document Structure",
        "CSS Box Model, Cascade, and Typography",
        "Flexbox and CSS Grid Layouts",
        "Responsive Media Queries and Forms",
      ]),
    },
    {
      id: "WD201",
      code: "WD201",
      title: "JavaScript Programming",
      description:
        "Covers modern ES6+ JavaScript, DOM manipulation, event delegation, asynchronous promises, fetch APIs, and client state.",
      credits: 4,
      difficulty: "Intermediate",
      semester: 2,
      prerequisites: ["CS101", "WD101"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
        "Other",
      ],
      skillTags: ["JavaScript ES6+", "DOM API", "Async/Await"],
      careerTags: [
        "Full-Stack Web Development",
        "Mobile Application Development",
        "Software Development",
      ],
      modules: createModules("WD201", [
        "Closures, Scope, and Array Higher-Order Functions",
        "DOM Manipulation and Event Delegation",
        "Asynchronous Promises and Fetch API",
        "Browser Storage and Client State Architecture",
      ]),
    },
    {
      id: "WD301",
      code: "WD301",
      title: "Frontend Development",
      description:
        "Teaches component-driven UI architecture, client-side routing, state management, form validation, and web performance.",
      credits: 4,
      difficulty: "Intermediate",
      semester: 3,
      prerequisites: ["WD201"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["Component Architecture", "State Management", "Web Performance"],
      careerTags: ["Full-Stack Web Development", "Software Development"],
      modules: createModules("WD301", [
        "Component Composition and Props",
        "Reactive State and Lifecycle Hooks",
        "Client Routing and Form Validation",
        "Bundle Optimization and Core Web Vitals",
      ]),
    },
    {
      id: "WD302",
      code: "WD302",
      title: "Backend Development",
      description:
        "Covers server-side runtime architecture, middleware pipelines, authentication sessions, database integration, and error logging.",
      credits: 4,
      difficulty: "Intermediate",
      semester: 3,
      prerequisites: ["WD201", "CS102"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["Node.js / Express", "Middleware", "Auth & Sessions"],
      careerTags: [
        "Full-Stack Web Development",
        "Cloud Computing",
        "Software Development",
      ],
      modules: createModules("WD302", [
        "HTTP Servers and Request Routing",
        "Express Middleware and Validation",
        "Authentication, Hashing, and Sessions",
        "Server Persistence and Error Handling",
      ]),
    },
    {
      id: "WD303",
      code: "WD303",
      title: "REST API Development",
      description:
        "Designs resource-oriented RESTful APIs with OpenAPI contracts, pagination, rate limiting, JWT security, and automated tests.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 4,
      prerequisites: ["WD302", "CS302"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["REST", "OpenAPI", "JWT", "Integration Testing"],
      careerTags: [
        "Full-Stack Web Development",
        "Cloud Computing",
        "Mobile Application Development",
      ],
      modules: createModules("WD303", [
        "Resource Modeling and Status Codes",
        "Filtering, Sorting, and Pagination",
        "Token Authentication and Rate Limiting",
        "API Documentation and Contract Testing",
      ]),
    },
    {
      id: "WD401",
      code: "WD401",
      title: "Full-Stack Web Development",
      description:
        "Integrates frontend applications with production REST APIs, relational schemas, caching, security hardening, and deployment.",
      credits: 4,
      difficulty: "Advanced",
      semester: 4,
      prerequisites: ["WD301", "WD303"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["End-to-End Architecture", "Security", "Deployment"],
      careerTags: ["Full-Stack Web Development", "Software Development"],
      modules: createModules("WD401", [
        "End-to-End Type-Safe Contracts",
        "Role-Based Access Control and Security",
        "Database Migrations and Query Tuning",
        "Production Build and Cloud Deployment",
      ]),
    },
    {
      id: "MB301",
      code: "MB301",
      title: "Mobile Application Development",
      description:
        "Builds cross-platform mobile experiences covering navigation stacks, offline storage, device sensors, and app store packaging.",
      credits: 4,
      difficulty: "Intermediate",
      semester: 5,
      prerequisites: ["CS201", "WD201"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["Mobile UI", "Offline Sync", "Device APIs"],
      careerTags: ["Mobile Application Development", "Full-Stack Web Development"],
      modules: createModules("MB301", [
        "Mobile Layouts and Touch Navigation",
        "Local Storage and Offline Synchronization",
        "REST Integration and Background Tasks",
        "Performance Profiling and Packaging",
      ]),
    },

    // --- ARTIFICIAL INTELLIGENCE & DATA SCIENCE (8) ---
    {
      id: "DS201",
      code: "DS201",
      title: "Python for Data Science",
      description:
        "Introduces Pythonic data structures, NumPy vectorized arrays, Pandas data frames, and reproducible notebook workflows.",
      credits: 3,
      difficulty: "Beginner",
      semester: 2,
      prerequisites: ["CS101"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Other",
      ],
      skillTags: ["Python", "NumPy", "Pandas"],
      careerTags: [
        "Data Science",
        "Artificial Intelligence and Machine Learning",
      ],
      modules: createModules("DS201", [
        "Python Data Structures and Comprehensions",
        "NumPy Arrays and Vectorization",
        "Pandas DataFrames and Merging",
        "Data Cleaning and Missing Value Handling",
      ]),
    },
    {
      id: "MA201",
      code: "MA201",
      title: "Statistics and Probability",
      description:
        "Covers probability distributions, Bayes theorem, hypothesis testing, confidence intervals, and statistical inference.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 3,
      prerequisites: ["MA102"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
      ],
      skillTags: ["Probability", "Hypothesis Testing", "Bayes Theorem"],
      careerTags: [
        "Data Science",
        "Artificial Intelligence and Machine Learning",
      ],
      modules: createModules("MA201", [
        "Random Variables and Distributions",
        "Expectation, Variance, and CLT",
        "Hypothesis Testing and p-Values",
        "Bayesian Inference Foundations",
      ]),
    },
    {
      id: "MA202",
      code: "MA202",
      title: "Linear Algebra",
      description:
        "Focuses on vector spaces, orthogonality, singular value decomposition, and matrix calculus used in ML algorithms.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 3,
      prerequisites: ["MA102"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["Vector Spaces", "SVD", "Matrix Calculus"],
      careerTags: [
        "Artificial Intelligence and Machine Learning",
        "Data Science",
      ],
      modules: createModules("MA202", [
        "Vector Spaces and Basis Transformations",
        "Orthogonal Projections and Least Squares",
        "Singular Value Decomposition (SVD)",
        "Gradients and Matrix Calculus",
      ]),
    },
    {
      id: "DS301",
      code: "DS301",
      title: "Data Analytics",
      description:
        "Teaches exploratory data analysis, feature engineering, A/B experimentation, time-series decomposition, and business metrics.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 4,
      prerequisites: ["DS201", "MA201"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["EDA", "A/B Testing", "Feature Engineering"],
      careerTags: ["Data Science", "Artificial Intelligence and Machine Learning"],
      modules: createModules("DS301", [
        "Exploratory Data Analysis Workflows",
        "Correlation and Feature Engineering",
        "A/B Testing and Experiment Design",
        "Time-Series Trend Decomposition",
      ]),
    },
    {
      id: "DS302",
      code: "DS302",
      title: "Data Visualization",
      description:
        "Applies perceptual chart design, interactive dashboards, statistical graphics, and visual storytelling for analytical clarity.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 4,
      prerequisites: ["DS201", "DS301"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["Visual Encoding", "Dashboards", "Storytelling"],
      careerTags: ["Data Science", "Full-Stack Web Development"],
      modules: createModules("DS302", [
        "Visual Perception and Chart Selection",
        "Multivariate Statistical Plots",
        "Interactive Dashboard Filtering",
        "Executive Analytical Narratives",
      ]),
    },
    {
      id: "AI301",
      code: "AI301",
      title: "Artificial Intelligence",
      description:
        "Covers heuristic search, constraint satisfaction, adversarial game trees, propositional inference, and probabilistic reasoning.",
      credits: 4,
      difficulty: "Advanced",
      semester: 5,
      prerequisites: ["CS301", "MA201"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
      ],
      skillTags: ["Heuristic Search", "Constraint Satisfaction", "Bayesian Networks"],
      careerTags: ["Artificial Intelligence and Machine Learning"],
      modules: createModules("AI301", [
        "Uninformed and A* Heuristic Search",
        "Constraint Satisfaction Problems",
        "Adversarial Search and Game Playing",
        "Knowledge Representation and Reasoning",
      ]),
    },
    {
      id: "AI302",
      code: "AI302",
      title: "Machine Learning",
      description:
        "Implements regression, classification, decision trees, ensembles, clustering, cross-validation, and bias-variance tuning.",
      credits: 4,
      difficulty: "Advanced",
      semester: 5,
      prerequisites: ["DS201", "MA201", "MA202"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["Supervised Learning", "Unsupervised Learning", "Scikit-Learn"],
      careerTags: [
        "Artificial Intelligence and Machine Learning",
        "Data Science",
      ],
      modules: createModules("AI302", [
        "Linear and Logistic Regression",
        "Decision Trees and Ensemble Methods",
        "Support Vector Machines and Clustering",
        "Validation Curves and Hyperparameter Tuning",
      ]),
    },
    {
      id: "AI401",
      code: "AI401",
      title: "Deep Learning",
      description:
        "Builds neural networks, backpropagation, CNNs for vision, sequence models, attention mechanisms, and regularization.",
      credits: 4,
      difficulty: "Advanced",
      semester: 6,
      prerequisites: ["AI302"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
      ],
      skillTags: ["Neural Networks", "CNNs", "Transformers"],
      careerTags: ["Artificial Intelligence and Machine Learning"],
      modules: createModules("AI401", [
        "Perceptrons and Backpropagation",
        "Convolutional Neural Networks",
        "Recurrent Models and Attention",
        "Training Stability and Transfer Learning",
      ]),
    },

    // --- ADVANCED TECHNOLOGY (7) ---
    {
      id: "CY301",
      code: "CY301",
      title: "Cybersecurity Fundamentals",
      description:
        "Explores cryptography basics, network threat modeling, web OWASP vulnerabilities, access control, and defensive hardening.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 5,
      prerequisites: ["CS304"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["Cryptography", "OWASP Top 10", "Network Security"],
      careerTags: ["Cybersecurity", "Cloud Computing", "Full-Stack Web Development"],
      modules: createModules("CY301", [
        "CIA Triad and Threat Modeling",
        "Symmetric and Public-Key Cryptography",
        "Web Security and OWASP Mitigations",
        "Network Intrusion Defense Basics",
      ]),
    },
    {
      id: "CL301",
      code: "CL301",
      title: "Cloud Computing",
      description:
        "Teaches virtualization, containers, cloud compute/storage abstractions, auto-scaling, serverless, and multi-region design.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 6,
      prerequisites: ["CS303", "CS304"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["Containers", "Cloud Architecture", "Serverless"],
      careerTags: ["Cloud Computing", "Full-Stack Web Development", "Software Development"],
      modules: createModules("CL301", [
        "Virtualization and Containerization",
        "Cloud Compute and Object Storage",
        "Load Balancing and Auto-Scaling",
        "IAM Security and Cost Governance",
      ]),
    },
    {
      id: "DO401",
      code: "DO401",
      title: "DevOps Fundamentals",
      description:
        "Automates build-test-deploy pipelines using CI/CD, Infrastructure as Code, container orchestration, and observability.",
      credits: 3,
      difficulty: "Advanced",
      semester: 6,
      prerequisites: ["CL301", "CS305"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["CI/CD", "Infrastructure as Code", "Observability"],
      careerTags: ["Cloud Computing", "Software Development", "Full-Stack Web Development"],
      modules: createModules("DO401", [
        "CI/CD Pipeline Automation",
        "Infrastructure as Code Basics",
        "Container Orchestration Concepts",
        "Metrics, Logging, and Incident Response",
      ]),
    },
    {
      id: "IT301",
      code: "IT301",
      title: "Internet of Things",
      description:
        "Connects embedded microcontrollers, sensor telemetry, MQTT protocols, edge preprocessing, and cloud dashboards.",
      credits: 3,
      difficulty: "Intermediate",
      semester: 6,
      prerequisites: ["EC101", "CS304"],
      branches: [
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Computer Science Engineering (CSE)",
      ],
      skillTags: ["Microcontrollers", "MQTT", "Edge Telemetry"],
      careerTags: ["Cloud Computing", "Cybersecurity"],
      modules: createModules("IT301", [
        "Sensors, Actuators, and GPIO",
        "Embedded Protocols (I2C, SPI, UART)",
        "MQTT and Telemetry Ingestion",
        "Edge Security and Fleet Updates",
      ]),
    },
    {
      id: "BD401",
      code: "BD401",
      title: "Big Data Technologies",
      description:
        "Covers distributed storage, MapReduce paradigms, Spark stream processing, data lakes, and scalable analytics pipelines.",
      credits: 4,
      difficulty: "Advanced",
      semester: 7,
      prerequisites: ["CS302", "DS301"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
      ],
      skillTags: ["Distributed Storage", "Spark", "Data Pipelines"],
      careerTags: ["Data Science", "Cloud Computing"],
      modules: createModules("BD401", [
        "Distributed File Systems Architecture",
        "Batch Processing and Spark RDDs",
        "Streaming Data Ingestion",
        "Data Warehouse Partitioning",
      ]),
    },
    {
      id: "CS403",
      code: "CS403",
      title: "Distributed Systems",
      description:
        "Examines consensus protocols, replication, eventual consistency, CAP trade-offs, and fault-tolerant microservices.",
      credits: 4,
      difficulty: "Advanced",
      semester: 7,
      prerequisites: ["CS303", "CS304"],
      branches: [
        "Computer Science Engineering (CSE)",
        "Information Technology (IT)",
      ],
      skillTags: ["Consensus", "Replication", "Fault Tolerance"],
      careerTags: ["Cloud Computing", "Software Development"],
      modules: createModules("CS403", [
        "Logical Clocks and Ordering",
        "Replication and CAP Trade-Offs",
        "Raft Consensus Fundamentals",
        "Distributed Fault Tolerance",
      ]),
    },
    {
      id: "PR401",
      code: "PR401",
      title: "Capstone Engineering Project",
      description:
        "Synthesizes full engineering lifecycle skills into a documented, tested, and peer-reviewed production software system.",
      credits: 4,
      difficulty: "Advanced",
      semester: 8,
      prerequisites: ["CS305"],
      branches: [
        "Computer Science Engineering (CSE)",
        "CSE – Artificial Intelligence and Machine Learning",
        "Information Technology (IT)",
        "Electronics and Communication Engineering (ECE)",
        "Electrical and Electronics Engineering (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
        "Other",
      ],
      skillTags: ["System Design", "Delivery", "Technical Defense"],
      careerTags: [
        "Full-Stack Web Development",
        "Artificial Intelligence and Machine Learning",
        "Data Science",
        "Cybersecurity",
        "Cloud Computing",
        "Software Development",
        "Mobile Application Development",
      ],
      modules: createModules("PR401", [
        "Problem Charter and Architecture RFC",
        "Core Implementation Milestone",
        "Testing and Security Audit",
        "Final Documentation and Defense",
      ]),
    },
  ];

  /* ------------------------------------------------------------------------
     3. SAMPLE PEER DIRECTORY (Transparently Marked Sample Profiles)
     ------------------------------------------------------------------------ */

  const SAMPLE_PEERS = [
    {
      id: "peer-1",
      name: "Ananya Iyer",
      branch: "Computer Science Engineering (CSE)",
      semester: 1,
      careerPathway: "Full-Stack Web Development",
      enrolledCourses: ["CS101", "WD101", "MA101"],
      interests: ["Semantic UI", "Problem Solving", "Open Source"],
    },
    {
      id: "peer-2",
      name: "Rohan Verma",
      branch: "Information Technology (IT)",
      semester: 2,
      careerPathway: "Full-Stack Web Development",
      enrolledCourses: ["CS101", "WD101", "WD201"],
      interests: ["JavaScript", "REST APIs", "Hackathons"],
    },
    {
      id: "peer-3",
      name: "Meera Nair",
      branch: "CSE – Artificial Intelligence and Machine Learning",
      semester: 2,
      careerPathway: "Artificial Intelligence and Machine Learning",
      enrolledCourses: ["CS101", "DS201", "MA102"],
      interests: ["Python", "Probability", "Neural Networks"],
    },
    {
      id: "peer-4",
      name: "Kabir Kulkarni",
      branch: "Computer Science Engineering (CSE)",
      semester: 3,
      careerPathway: "Cloud Computing",
      enrolledCourses: ["CS202", "CS203", "CS101"],
      interests: ["Linux", "Networking", "Containers"],
    },
    {
      id: "peer-5",
      name: "Diya Patel",
      branch: "Information Technology (IT)",
      semester: 1,
      careerPathway: "Cybersecurity",
      enrolledCourses: ["CS101", "EE101", "HS101"],
      interests: ["CTF Challenges", "Cryptography", "Systems"],
    },
    {
      id: "peer-6",
      name: "Siddharth Rao",
      branch: "Computer Science Engineering (CSE)",
      semester: 2,
      careerPathway: "Data Science",
      enrolledCourses: ["CS101", "DS201", "MA101"],
      interests: ["Analytics", "Visualizations", "SQL"],
    },
  ];

  const DEFAULT_PEER_GROUPS = [
    {
      id: "grp-1",
      name: "CS101 Foundations Cohort",
      focusCourse: "CS101",
      schedule: "Mon & Wed · 6:30 PM",
      members: ["Ananya Iyer", "Rohan Verma", "Siddharth Rao"],
      pathway: "Full-Stack Web Development",
    },
    {
      id: "grp-2",
      name: "Web Builders Study Loop",
      focusCourse: "WD101",
      schedule: "Sat · 11:00 AM",
      members: ["Ananya Iyer", "Rohan Verma"],
      pathway: "Full-Stack Web Development",
    },
    {
      id: "grp-3",
      name: "AI & Python Math Circle",
      focusCourse: "DS201",
      schedule: "Thu · 7:00 PM",
      members: ["Meera Nair", "Siddharth Rao"],
      pathway: "Artificial Intelligence and Machine Learning",
    },
  ];

  /* ------------------------------------------------------------------------
     4. IN-MEMORY RUNTIME STATE
     ------------------------------------------------------------------------ */

  const appState = {
    student: null,
    enrollments: {}, // { [courseId]: { studentId, courseId, enrollmentDate, status } }
    progress: {}, // { [courseId]: { courseId, completedModules: string[], totalModules, percentage, completionStatus } }
    preferences: {
      roadmapScope: "four-sem", // 'four-sem' | 'full'
      collapsedSemesters: {},
    },
    peerGroups: [],
    joinedGroupIds: [],
    activeView: "overview",
    catalogFilters: {
      query: "",
      credits: "all",
      difficulty: "all",
      branch: "all",
      pathway: "all",
      semester: "all",
      status: "all",
    },
    graphState: {
      pathwayFilter: "recommended",
      selectedCourseId: "CS101",
      zoom: 1,
    },
    simulatedCycleEdges: null, // Used only when user clicks "Test Cycle Detection"
    roadmapResult: null,
  };

  let courseMap = {};
  let searchDebounceTimer = null;
  let pendingConfirmCallback = null;

  /* ------------------------------------------------------------------------
     5. SAFE STORAGE LAYER (Ready for Future Express/SQLite Migration)
     ------------------------------------------------------------------------ */

  function safeParseJSON(raw, fallback) {
    if (!raw || typeof raw !== "string") {
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch (_err) {
      return fallback;
    }
  }

  function validateStudentProfile(profile) {
    if (!profile || typeof profile !== "object") {
      return false;
    }
    const requiredStrings = ["name", "branch", "programmingExperience", "careerPathway"];
    for (let i = 0; i < requiredStrings.length; i += 1) {
      if (typeof profile[requiredStrings[i]] !== "string" || !profile[requiredStrings[i]].trim()) {
        return false;
      }
    }
    const sem = Number(profile.semester);
    const hrs = Number(profile.weeklyStudyHours);
    if (!Number.isInteger(sem) || sem < 1 || sem > 8) {
      return false;
    }
    if (!Number.isFinite(hrs) || hrs < 1 || hrs > 80) {
      return false;
    }
    if (!Array.isArray(profile.knownLanguages) || profile.knownLanguages.length === 0) {
      return false;
    }
    return true;
  }

  function loadAllStateFromStorage() {
    const storedProfile = safeParseJSON(localStorage.getItem(STORAGE_KEYS.PROFILE), null);
    if (validateStudentProfile(storedProfile)) {
      appState.student = storedProfile;
    } else {
      appState.student = null;
    }

    const storedEnrollments = safeParseJSON(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS), {});
    appState.enrollments =
      storedEnrollments && typeof storedEnrollments === "object" && !Array.isArray(storedEnrollments)
        ? storedEnrollments
        : {};

    const storedProgress = safeParseJSON(localStorage.getItem(STORAGE_KEYS.PROGRESS), {});
    appState.progress =
      storedProgress && typeof storedProgress === "object" && !Array.isArray(storedProgress)
        ? storedProgress
        : {};

    // Reconcile progress entries against current catalog structure
    Object.keys(appState.enrollments).forEach(function (courseId) {
      const course = courseMap[courseId];
      if (!course) {
        delete appState.enrollments[courseId];
        delete appState.progress[courseId];
        return;
      }
      const existing = appState.progress[courseId];
      const completedModules =
        existing && Array.isArray(existing.completedModules)
          ? existing.completedModules.filter(function (mid) {
              return course.modules.some(function (m) {
                return m.id === mid;
              });
            })
          : [];
      appState.progress[courseId] = computeCourseProgressObject(course, completedModules);
    });

    const storedPrefs = safeParseJSON(localStorage.getItem(STORAGE_KEYS.PREFERENCES), null);
    if (storedPrefs && typeof storedPrefs === "object") {
      appState.preferences = {
        roadmapScope: storedPrefs.roadmapScope === "full" ? "full" : "four-sem",
        collapsedSemesters:
          storedPrefs.collapsedSemesters && typeof storedPrefs.collapsedSemesters === "object"
            ? storedPrefs.collapsedSemesters
            : {},
      };
    }

    const storedPeers = safeParseJSON(localStorage.getItem(STORAGE_KEYS.PEER_GROUPS), null);
    if (storedPeers && typeof storedPeers === "object") {
      appState.peerGroups = Array.isArray(storedPeers.groups) ? storedPeers.groups : DEFAULT_PEER_GROUPS.slice();
      appState.joinedGroupIds = Array.isArray(storedPeers.joinedIds) ? storedPeers.joinedIds : [];
    } else {
      appState.peerGroups = DEFAULT_PEER_GROUPS.slice();
      appState.joinedGroupIds = [];
    }
  }

  function saveProfileToStorage() {
    if (appState.student) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(appState.student));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    }
  }

  function saveEnrollmentAndProgressToStorage() {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(appState.enrollments));
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(appState.progress));
  }

  function savePreferencesToStorage() {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(appState.preferences));
  }

  function savePeerGroupsToStorage() {
    localStorage.setItem(
      STORAGE_KEYS.PEER_GROUPS,
      JSON.stringify({
        groups: appState.peerGroups,
        joinedIds: appState.joinedGroupIds,
      })
    );
  }

  /* ------------------------------------------------------------------------
     6. DAG ENGINE: KAHN'S TOPOLOGICAL SORT & CYCLE DETECTION
     ------------------------------------------------------------------------ */

  function getActiveCatalogWithSimulation() {
    if (!appState.simulatedCycleEdges) {
      return COURSE_CATALOG;
    }
    return COURSE_CATALOG.map(function (course) {
      const injected = appState.simulatedCycleEdges[course.id];
      if (!injected) {
        return course;
      }
      return Object.assign({}, course, {
        prerequisites: injected.slice(),
      });
    });
  }

  function scoreCourseRelevance(course, student) {
    if (!student) {
      return 0;
    }
    let score = 0;

    if (course.careerTags.indexOf(student.careerPathway) !== -1) {
      score += 40;
    }
    if (course.branches.indexOf(student.branch) !== -1) {
      score += 20;
    }

    const isBeginner =
      student.programmingExperience === "Complete beginner" ||
      student.knownLanguages.indexOf("None") !== -1;

    if (isBeginner) {
      if (course.difficulty === "Beginner") {
        score += 30;
      } else if (course.difficulty === "Advanced") {
        score -= 20;
      }
      if (course.id === "CS101" || course.id === "MA101" || course.id === "WD101") {
        score += 25;
      }
    } else if (student.programmingExperience === "Intermediate programming knowledge") {
      if (course.difficulty === "Intermediate") {
        score += 15;
      }
    } else if (student.programmingExperience === "Advanced programming knowledge") {
      if (course.difficulty !== "Beginner") {
        score += 12;
      }
    }

    // Earlier baseline semester gives slight tie-breaking priority
    score += Math.max(0, 10 - course.semester);
    return score;
  }

  function explainCourseRecommendation(course, student) {
    const reasons = [];
    const isBeginner =
      student.programmingExperience === "Complete beginner" ||
      student.knownLanguages.indexOf("None") !== -1;

    if (isBeginner && course.difficulty === "Beginner" && course.prerequisites.length === 0) {
      reasons.push("Beginner cold-start foundation");
    } else if (course.careerTags.indexOf(student.careerPathway) !== -1) {
      reasons.push("Aligned with " + student.careerPathway);
    } else if (course.branches.indexOf(student.branch) !== -1) {
      reasons.push("Core " + student.branch.split("(")[0].trim() + " requirement");
    } else {
      reasons.push("Curriculum breadth elective");
    }

    if (course.prerequisites.length > 0) {
      reasons.push("Requires " + course.prerequisites.join(", "));
    } else {
      reasons.push("No prerequisites");
    }

    return reasons.join(" · ");
  }

  /**
   * Executes Kahn's Topological Sorting Algorithm and Cycle Detection.
   * Returns:
   * - hasCycle: boolean
   * - cycleNodes: string[]
   * - cyclePath: string[]
   * - topoOrder: Course[]
   * - depthMap: { [courseId]: number }
   * - semesters: Array<{ semesterNumber, courses, totalCredits }>
   */
  function generateRoadmapWithKahn(courses, student) {
    const localMap = {};
    const inDegree = {};
    const adjacency = {};
    const missingRefs = [];

    courses.forEach(function (course) {
      localMap[course.id] = course;
      inDegree[course.id] = 0;
      adjacency[course.id] = [];
    });

    // Build directed edges: prereq -> course
    courses.forEach(function (course) {
      course.prerequisites.forEach(function (prereqId) {
        if (!localMap[prereqId]) {
          missingRefs.push(prereqId + " -> " + course.id);
          return;
        }
        adjacency[prereqId].push(course.id);
        inDegree[course.id] += 1;
      });
    });

    // 1. Seed Kahn's queue with all zero-indegree courses
    const queue = [];
    courses.forEach(function (course) {
      if (inDegree[course.id] === 0) {
        queue.push(course.id);
      }
    });

    function sortQueueByStudentPriority() {
      queue.sort(function (a, b) {
        const ca = localMap[a];
        const cb = localMap[b];
        if (ca.semester !== cb.semester) {
          return ca.semester - cb.semester;
        }
        return scoreCourseRelevance(cb, student) - scoreCourseRelevance(ca, student);
      });
    }

    sortQueueByStudentPriority();

    const topoOrder = [];
    const depthMap = {};

    // 2. Process queue in valid topological order
    while (queue.length > 0) {
      const currentId = queue.shift();
      const currentCourse = localMap[currentId];
      topoOrder.push(currentCourse);

      let maxPrereqDepth = -1;
      currentCourse.prerequisites.forEach(function (pid) {
        if (typeof depthMap[pid] === "number" && depthMap[pid] > maxPrereqDepth) {
          maxPrereqDepth = depthMap[pid];
        }
      });
      depthMap[currentId] = maxPrereqDepth + 1;

      const dependents = adjacency[currentId];
      for (let i = 0; i < dependents.length; i += 1) {
        const nextId = dependents[i];
        inDegree[nextId] -= 1;
        if (inDegree[nextId] === 0) {
          queue.push(nextId);
        }
      }
      sortQueueByStudentPriority();
    }

    // 3. Cycle Detection Check
    const cyclicNodeIds = Object.keys(inDegree).filter(function (id) {
      return inDegree[id] > 0;
    });

    if (topoOrder.length !== courses.length || cyclicNodeIds.length > 0) {
      const cyclePath = traceCyclePath(cyclicNodeIds, localMap);
      return {
        hasCycle: true,
        cycleNodes: cyclicNodeIds,
        cyclePath: cyclePath,
        missingRefs: missingRefs,
        topoOrder: topoOrder,
        depthMap: depthMap,
        semesters: [],
      };
    }

    // 4. Filter relevant curriculum & assign valid prerequisite-ordered semesters
    const relevantCourses = topoOrder.filter(function (course) {
      const matchesCareer = course.careerTags.indexOf(student.careerPathway) !== -1;
      const matchesBranch = course.branches.indexOf(student.branch) !== -1;
      const isCoreFoundational = course.semester <= 2 && course.credits >= 3;
      return matchesCareer || matchesBranch || isCoreFoundational;
    });

    const selectedIds = {};
    relevantCourses.forEach(function (c) {
      selectedIds[c.id] = true;
    });

    // Ensure every prerequisite of a selected course is also included
    function ensurePrereqs(courseId) {
      const c = localMap[courseId];
      if (!c) {
        return;
      }
      c.prerequisites.forEach(function (pid) {
        if (!selectedIds[pid]) {
          selectedIds[pid] = true;
          ensurePrereqs(pid);
        }
      });
    }
    relevantCourses.forEach(function (c) {
      ensurePrereqs(c.id);
    });

    const finalOrdered = topoOrder.filter(function (c) {
      return Boolean(selectedIds[c.id]);
    });

    // Assign each course to a semester >= max(prereqSem) + 1 and >= baseline semester
    const assignedSemester = {};
    const semesterBuckets = {};
    const semesterCredits = {};
    const MAX_CREDITS_PER_SEM = 22;

    finalOrdered.forEach(function (course) {
      let minSem = course.semester;
      course.prerequisites.forEach(function (pid) {
        if (assignedSemester[pid] && assignedSemester[pid] + 1 > minSem) {
          minSem = assignedSemester[pid] + 1;
        }
      });

      while ((semesterCredits[minSem] || 0) + course.credits > MAX_CREDITS_PER_SEM && minSem < 8) {
        minSem += 1;
      }

      assignedSemester[course.id] = minSem;
      if (!semesterBuckets[minSem]) {
        semesterBuckets[minSem] = [];
        semesterCredits[minSem] = 0;
      }
      semesterBuckets[minSem].push({
        course: course,
        relevanceScore: scoreCourseRelevance(course, student),
        reason: explainCourseRecommendation(course, student),
      });
      semesterCredits[minSem] += course.credits;
    });

    const semesters = Object.keys(semesterBuckets)
      .map(function (numStr) {
        return Number(numStr);
      })
      .sort(function (a, b) {
        return a - b;
      })
      .map(function (semNum) {
        const items = semesterBuckets[semNum].sort(function (a, b) {
          return b.relevanceScore - a.relevanceScore;
        });
        return {
          semesterNumber: semNum,
          items: items,
          totalCredits: semesterCredits[semNum],
        };
      });

    return {
      hasCycle: false,
      cycleNodes: [],
      cyclePath: [],
      missingRefs: missingRefs,
      topoOrder: topoOrder,
      depthMap: depthMap,
      semesters: semesters,
    };
  }

  function traceCyclePath(cyclicIds, localMap) {
    if (cyclicIds.length === 0) {
      return [];
    }
    const cyclicSet = {};
    cyclicIds.forEach(function (id) {
      cyclicSet[id] = true;
    });
    const visited = {};
    const stack = [];

    function dfs(nodeId) {
      visited[nodeId] = 1; // visiting
      stack.push(nodeId);
      const course = localMap[nodeId];
      const prereqs = course ? course.prerequisites : [];
      for (let i = 0; i < prereqs.length; i += 1) {
        const pid = prereqs[i];
        if (!cyclicSet[pid]) {
          continue;
        }
        if (visited[pid] === 1) {
          const startIdx = stack.indexOf(pid);
          return stack.slice(startIdx).concat([pid]);
        }
        if (!visited[pid]) {
          const res = dfs(pid);
          if (res) {
            return res;
          }
        }
      }
      stack.pop();
      visited[nodeId] = 2;
      return null;
    }

    for (let i = 0; i < cyclicIds.length; i += 1) {
      if (!visited[cyclicIds[i]]) {
        const found = dfs(cyclicIds[i]);
        if (found) {
          return found.reverse();
        }
      }
    }
    return cyclicIds;
  }

  /* ------------------------------------------------------------------------
     7. COURSE STATUS, ENROLLMENT & PROGRESS ENGINE
     ------------------------------------------------------------------------ */

  function computeCourseProgressObject(course, completedModules) {
    const total = course.modules.length;
    const completedCount = completedModules.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    let completionStatus = "Enrolled";
    if (completedCount === total && total > 0) {
      completionStatus = "Completed";
    } else if (completedCount > 0) {
      completionStatus = "In Progress";
    }
    return {
      courseId: course.id,
      completedModules: completedModules.slice(),
      totalModules: total,
      percentage: percentage,
      completionStatus: completionStatus,
    };
  }

  function getMissingPrerequisites(courseId) {
    const catalog = getActiveCatalogWithSimulation();
    const activeCourse = catalog.find(function (c) {
      return c.id === courseId;
    });
    if (!activeCourse) {
      return [];
    }
    return activeCourse.prerequisites.filter(function (pid) {
      const prog = appState.progress[pid];
      return !(prog && prog.percentage === 100);
    });
  }

  function isCourseBlockedByCycle(courseId) {
    if (!appState.roadmapResult || !appState.roadmapResult.hasCycle) {
      return false;
    }
    return appState.roadmapResult.cycleNodes.indexOf(courseId) !== -1;
  }

  function getCourseStatus(courseId) {
    if (isCourseBlockedByCycle(courseId)) {
      return "locked";
    }
    const enrolled = Boolean(appState.enrollments[courseId]);
    if (enrolled) {
      const prog = appState.progress[courseId];
      if (prog && prog.percentage === 100) {
        return "completed";
      }
      if (prog && prog.percentage > 0) {
        return "in-progress";
      }
      return "enrolled";
    }
    const missing = getMissingPrerequisites(courseId);
    return missing.length === 0 ? "unlocked" : "locked";
  }

  function getStatusMeta(status) {
    switch (status) {
      case "completed":
        return { label: "Completed", className: "status-completed", icon: "check" };
      case "in-progress":
        return { label: "In Progress", className: "status-in-progress", icon: "play" };
      case "enrolled":
        return { label: "Enrolled", className: "status-enrolled", icon: "book" };
      case "unlocked":
        return { label: "Unlocked", className: "status-unlocked", icon: "unlock" };
      default:
        return { label: "Locked", className: "status-locked", icon: "lock" };
    }
  }

  function enrollInCourse(courseId) {
    try {
      const course = courseMap[courseId];
      if (!course) {
        showToast("Course record not found.", "error");
        return false;
      }

      if (appState.roadmapResult && appState.roadmapResult.hasCycle && isCourseBlockedByCycle(courseId)) {
        showToast(
          "Cannot enroll in " + course.code + " while a circular prerequisite dependency exists.",
          "error"
        );
        return false;
      }

      if (appState.enrollments[courseId]) {
        showToast("You are already enrolled in " + course.code + " (" + course.title + ").", "warning");
        return false;
      }

      const missing = getMissingPrerequisites(courseId);
      if (missing.length > 0) {
        showToast(
          "Locked: Complete prerequisites first (" + missing.join(", ") + ") before enrolling in " + course.code + ".",
          "error"
        );
        return false;
      }

      appState.enrollments[courseId] = {
        studentId: appState.student.id,
        courseId: courseId,
        enrollmentDate: new Date().toISOString().slice(0, 10),
        status: "Enrolled",
      };
      appState.progress[courseId] = computeCourseProgressObject(course, []);

      saveEnrollmentAndProgressToStorage();
      refreshDynamicViews();
      showToast("Enrolled in " + course.code + ": " + course.title + ".", "success");
      return true;
    } catch (err) {
      showToast("Failed to enroll in course: " + err.message, "error");
      return false;
    }
  }

  function dropCourseEnrollment(courseId) {
    const course = courseMap[courseId];
    if (!course || !appState.enrollments[courseId]) {
      return;
    }
    delete appState.enrollments[courseId];
    delete appState.progress[courseId];
    saveEnrollmentAndProgressToStorage();
    refreshDynamicViews();
    showToast("Dropped enrollment for " + course.code + ".", "info");
  }

  function toggleModuleCompletion(courseId, moduleId) {
    try {
      const course = courseMap[courseId];
      if (!course) {
        return;
      }
      if (!appState.enrollments[courseId]) {
        showToast("Enroll in " + course.code + " first to track modules.", "warning");
        return;
      }

      const currentProgress = appState.progress[courseId] || computeCourseProgressObject(course, []);
      const nextModules = currentProgress.completedModules.slice();
      const idx = nextModules.indexOf(moduleId);
      const wasCompleted = currentProgress.percentage === 100;

      if (idx === -1) {
        nextModules.push(moduleId);
      } else {
        nextModules.splice(idx, 1);
      }

      const updated = computeCourseProgressObject(course, nextModules);
      appState.progress[courseId] = updated;
      appState.enrollments[courseId].status = updated.completionStatus;

      saveEnrollmentAndProgressToStorage();
      refreshDynamicViews();

      if (idx === -1) {
        if (updated.percentage === 100 && !wasCompleted) {
          showToast(
            "Course completed: " + course.code + " (" + course.credits + " credits earned). Dependent courses unlocked.",
            "success"
          );
        } else {
          showToast(
            "Module marked completed in " + course.code + " (" + updated.percentage + "% complete).",
            "success"
          );
        }
      } else {
        showToast("Module unchecked in " + course.code + " (" + updated.percentage + "% complete).", "info");
      }
    } catch (err) {
      showToast("Could not update module progress: " + err.message, "error");
    }
  }

  function calculateOverallMetrics() {
    let totalCatalogCredits = 0;
    let completedCredits = 0;
    let enrolledCredits = 0;
    let completedCoursesCount = 0;
    let enrolledCoursesCount = 0;
    let totalModulesInEnrolled = 0;
    let completedModulesInEnrolled = 0;

    COURSE_CATALOG.forEach(function (course) {
      totalCatalogCredits += course.credits;
      const status = getCourseStatus(course.id);
      if (status === "completed") {
        completedCredits += course.credits;
        completedCoursesCount += 1;
      }
      if (appState.enrollments[course.id]) {
        enrolledCredits += course.credits;
        enrolledCoursesCount += 1;
        const prog = appState.progress[course.id];
        totalModulesInEnrolled += course.modules.length;
        completedModulesInEnrolled += prog ? prog.completedModules.length : 0;
      }
    });

    const overallCurriculumPct =
      totalCatalogCredits > 0 ? Math.round((completedCredits / totalCatalogCredits) * 100) : 0;

    const activeEnrolledPct =
      totalModulesInEnrolled > 0
        ? Math.round((completedModulesInEnrolled / totalModulesInEnrolled) * 100)
        : 0;

    return {
      totalCatalogCredits: totalCatalogCredits,
      completedCredits: completedCredits,
      enrolledCredits: enrolledCredits,
      remainingCredits: Math.max(0, totalCatalogCredits - completedCredits),
      totalCourses: COURSE_CATALOG.length,
      completedCoursesCount: completedCoursesCount,
      enrolledCoursesCount: enrolledCoursesCount,
      overallCurriculumPct: overallCurriculumPct,
      activeEnrolledPct: activeEnrolledPct,
      totalModulesInEnrolled: totalModulesInEnrolled,
      completedModulesInEnrolled: completedModulesInEnrolled,
    };
  }

  /* ------------------------------------------------------------------------
     8. UI HELPERS: SVG ICONS, PROGRESS RINGS, ESCAPING, TOASTS
     ------------------------------------------------------------------------ */

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderIconSVG(name) {
    switch (name) {
      case "check":
        return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      case "play":
        return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M10 8.5L15.5 12L10 15.5V8.5Z" fill="currentColor"/></svg>';
      case "book":
        return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
      case "unlock":
        return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V7A4 4 0 0 1 15.5 5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      default:
        return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V7A4 4 0 0 1 16 7V11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    }
  }

  function renderStatusTag(status) {
    const meta = getStatusMeta(status);
    return (
      '<span class="status-tag ' +
      meta.className +
      '">' +
      renderIconSVG(meta.icon) +
      "<span>" +
      meta.label +
      "</span></span>"
    );
  }

  function renderProgressRing(percentage, size, strokeWidth, isLarge) {
    const safePct = Math.max(0, Math.min(100, Number(percentage) || 0));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safePct / 100) * circumference;
    const completeClass = safePct === 100 ? " is-complete" : "";
    const labelClass = isLarge ? "progress-ring-label progress-ring-label-lg" : "progress-ring-label";

    return (
      '<div class="progress-ring-wrap" style="width:' +
      size +
      "px;height:" +
      size +
      'px;" role="img" aria-label="' +
      safePct +
      '% complete">' +
      '<svg class="progress-ring-svg" width="' +
      size +
      '" height="' +
      size +
      '">' +
      '<circle class="progress-ring-track" cx="' +
      size / 2 +
      '" cy="' +
      size / 2 +
      '" r="' +
      radius +
      '" stroke-width="' +
      strokeWidth +
      '"></circle>' +
      '<circle class="progress-ring-fill' +
      completeClass +
      '" cx="' +
      size / 2 +
      '" cy="' +
      size / 2 +
      '" r="' +
      radius +
      '" stroke-width="' +
      strokeWidth +
      '" stroke-dasharray="' +
      circumference.toFixed(2) +
      '" stroke-dashoffset="' +
      offset.toFixed(2) +
      '"></circle>' +
      "</svg>" +
      '<span class="' +
      labelClass +
      '">' +
      safePct +
      "%</span>" +
      "</div>"
    );
  }

  function showToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) {
      return;
    }
    const toastType = type || "info";
    const toastEl = document.createElement("div");
    toastEl.className = "toast toast-" + toastType;
    toastEl.setAttribute("role", "status");

    const textSpan = document.createElement("span");
    textSpan.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-ghost";
    closeBtn.style.padding = "2px 6px";
    closeBtn.style.border = "none";
    closeBtn.setAttribute("aria-label", "Dismiss notification");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", function () {
      if (toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }
    });

    toastEl.appendChild(textSpan);
    toastEl.appendChild(closeBtn);
    container.appendChild(toastEl);

    window.setTimeout(function () {
      if (toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }
    }, 4500);
  }

  function openConfirmDialog(title, message, onAccept) {
    const modal = document.getElementById("confirm-modal");
    document.getElementById("confirm-modal-title").textContent = title;
    document.getElementById("confirm-modal-message").textContent = message;
    pendingConfirmCallback = onAccept;
    modal.hidden = false;
  }

  function closeConfirmDialog() {
    const modal = document.getElementById("confirm-modal");
    modal.hidden = true;
    pendingConfirmCallback = null;
  }

  /* ------------------------------------------------------------------------
     9. VIEW 1: OVERVIEW DASHBOARD
     ------------------------------------------------------------------------ */

  function renderOverview() {
    const container = document.getElementById("overview-container");
    const student = appState.student;
    const metrics = calculateOverallMetrics();
    const workload = computeStudyWorkload();

    // Determine next recommended unlocked courses
    const recommendedUnlocked = [];
    if (appState.roadmapResult && !appState.roadmapResult.hasCycle) {
      appState.roadmapResult.semesters.forEach(function (sem) {
        sem.items.forEach(function (item) {
          const st = getCourseStatus(item.course.id);
          if (st === "unlocked" && recommendedUnlocked.length < 5) {
            recommendedUnlocked.push(item);
          }
        });
      });
    }

    const activeEnrollments = Object.keys(appState.enrollments)
      .map(function (id) {
        return {
          course: courseMap[id],
          progress: appState.progress[id],
        };
      })
      .filter(function (entry) {
        return Boolean(entry.course);
      });

    const isBeginner =
      student.programmingExperience === "Complete beginner" ||
      student.knownLanguages.indexOf("None") !== -1;

    let beginnerNoteHTML = "";
    if (isBeginner) {
      beginnerNoteHTML =
        '<div class="alert-banner alert-info" style="margin:0 0 20px;">' +
        "<div><strong>Beginner Cold-Start Track Active:</strong> Foundational courses such as CS101 (Programming Fundamentals), WD101, and MA101 are prioritized first before intermediate systems and frameworks unlock.</div>" +
        "</div>";
    }

    const recListHTML =
      recommendedUnlocked.length > 0
        ? recommendedUnlocked
            .map(function (item) {
              const c = item.course;
              return (
                '<div class="course-row-item">' +
                '<div class="course-row-main">' +
                '<div class="course-row-title">' +
                '<button type="button" class="roadmap-course-name-btn" data-open-course="' +
                c.id +
                '">' +
                escapeHTML(c.code + " — " + c.title) +
                "</button></div>" +
                '<div class="meta-line">' +
                "<span>" +
                c.credits +
                " Credits</span>" +
                '<span aria-hidden="true">·</span><span>' +
                escapeHTML(c.difficulty) +
                "</span>" +
                '<span aria-hidden="true">·</span><span>Sem ' +
                c.semester +
                "</span>" +
                "</div>" +
                '<p class="course-row-reason">' +
                escapeHTML(item.reason) +
                "</p>" +
                "</div>" +
                '<div class="course-row-actions">' +
                '<button type="button" class="btn btn-primary btn-sm" data-enroll-course="' +
                c.id +
                '">Enroll</button>' +
                "</div>" +
                "</div>"
              );
            })
            .join("")
        : '<div class="empty-state"><h3>All recommended unlocked courses are enrolled</h3><p>Complete modules in your enrolled courses to unlock higher-tier subjects.</p><button type="button" class="btn btn-secondary btn-sm" data-nav-jump="catalog">Browse Full Catalog</button></div>';

    const enrolledHTML =
      activeEnrollments.length > 0
        ? activeEnrollments
            .slice(0, 5)
            .map(function (entry) {
              const c = entry.course;
              const prog = entry.progress || { percentage: 0, completedModules: [], totalModules: c.modules.length };
              return (
                '<div class="course-row-item">' +
                '<div class="course-row-main">' +
                '<div class="course-row-title">' +
                '<button type="button" class="roadmap-course-name-btn" data-open-course="' +
                c.id +
                '">' +
                escapeHTML(c.code + " — " + c.title) +
                "</button></div>" +
                '<div class="meta-line">' +
                "<span>" +
                prog.completedModules.length +
                " / " +
                prog.totalModules +
                " modules</span>" +
                '<span aria-hidden="true">·</span><span>' +
                c.credits +
                " Credits</span>" +
                "</div>" +
                "</div>" +
                '<div class="course-row-actions">' +
                renderProgressRing(prog.percentage, 46, 5, false) +
                '<button type="button" class="btn btn-secondary btn-sm" data-open-course="' +
                c.id +
                '">Modules</button>' +
                "</div>" +
                "</div>"
              );
            })
            .join("")
        : '<div class="empty-state"><h3>No courses enrolled yet</h3><p>Start by enrolling in an unlocked foundational course like CS101 on the left.</p><button type="button" class="btn btn-primary btn-sm" data-nav-jump="roadmap">Open My Roadmap</button></div>';

    container.innerHTML =
      '<div class="welcome-banner">' +
      "<div>" +
      '<h2 class="welcome-heading">Welcome back, ' +
      escapeHTML(student.name) +
      "</h2>" +
      '<p class="welcome-meta">' +
      escapeHTML(student.branch) +
      " · Semester " +
      student.semester +
      " · Pathway: <strong>" +
      escapeHTML(student.careerPathway) +
      "</strong></p>" +
      "</div>" +
      '<div class="course-row-actions">' +
      '<button type="button" class="btn btn-secondary btn-sm" data-nav-jump="profile">Edit Profile</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-nav-jump="roadmap">Open Roadmap</button>' +
      "</div>" +
      "</div>" +
      beginnerNoteHTML +
      '<div class="kpi-grid">' +
      '<div class="kpi-card">' +
      "<div>" +
      '<div class="kpi-label">Completed Credits</div>' +
      '<div class="kpi-value tabular-nums">' +
      metrics.completedCredits +
      " / " +
      metrics.totalCatalogCredits +
      "</div>" +
      '<div class="kpi-sub">' +
      metrics.completedCoursesCount +
      " courses completed</div>" +
      "</div>" +
      renderProgressRing(metrics.overallCurriculumPct, 54, 5, false) +
      "</div>" +
      '<div class="kpi-card">' +
      "<div>" +
      '<div class="kpi-label">Active Enrollments</div>' +
      '<div class="kpi-value tabular-nums">' +
      metrics.enrolledCoursesCount +
      "</div>" +
      '<div class="kpi-sub">' +
      metrics.enrolledCredits +
      " enrolled credits</div>" +
      "</div>" +
      renderProgressRing(metrics.activeEnrolledPct, 54, 5, false) +
      "</div>" +
      '<div class="kpi-card">' +
      "<div>" +
      '<div class="kpi-label">Weekly Study Load</div>' +
      '<div class="kpi-value tabular-nums">' +
      workload.totalHours.toFixed(1) +
      "h</div>" +
      '<div class="kpi-sub">Budget: ' +
      student.weeklyStudyHours +
      " hrs/week</div>" +
      "</div>" +
      (workload.exceedsBudget
        ? '<span class="status-tag status-warning">Over Budget</span>'
        : '<span class="status-tag status-completed">Balanced</span>') +
      "</div>" +
      '<div class="kpi-card">' +
      "<div>" +
      '<div class="kpi-label">Unlocked Courses</div>' +
      '<div class="kpi-value tabular-nums">' +
      COURSE_CATALOG.filter(function (c) {
        return getCourseStatus(c.id) === "unlocked";
      }).length +
      "</div>" +
      '<div class="kpi-sub">Ready for enrollment</div>' +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-nav-jump="catalog">Browse</button>' +
      "</div>" +
      "</div>" +
      '<div class="overview-grid">' +
      '<section class="surface-card">' +
      '<div class="surface-header">' +
      '<div><h3 class="surface-title">Recommended Next Courses</h3></div>' +
      '<button type="button" class="text-link-btn" data-nav-jump="roadmap">Full Sequence</button>' +
      "</div>" +
      '<div class="stack-list">' +
      recListHTML +
      "</div>" +
      "</section>" +
      '<section class="surface-card">' +
      '<div class="surface-header">' +
      '<div><h3 class="surface-title">Active Course Progress</h3></div>' +
      '<button type="button" class="text-link-btn" data-nav-jump="enrollments">All Enrollments</button>' +
      "</div>" +
      '<div class="stack-list">' +
      enrolledHTML +
      "</div>" +
      "</section>" +
      "</div>";
  }

  /* ------------------------------------------------------------------------
     10. VIEW 2: INTERACTIVE SEMESTER-BY-SEMESTER ROADMAP
     ------------------------------------------------------------------------ */

  function renderRoadmap() {
    const container = document.getElementById("roadmap-container");
    const result = appState.roadmapResult;
    const student = appState.student;
    const scope = appState.preferences.roadmapScope;

    if (!result) {
      return;
    }

    const toolbarHTML =
      '<div class="section-header">' +
      "<div>" +
      '<h2 class="section-title">Personalized Learning Roadmap</h2>' +
      '<p class="section-subtitle">Prerequisite-validated semester sequence for ' +
      escapeHTML(student.careerPathway) +
      " via Kahn's topological sorting.</p>" +
      "</div>" +
      '<div class="course-row-actions">' +
      '<button type="button" class="btn btn-sm ' +
      (scope === "four-sem" ? "btn-primary" : "btn-secondary") +
      '" id="btn-scope-4sem">Core 4-Semester Path</button>' +
      '<button type="button" class="btn btn-sm ' +
      (scope === "full" ? "btn-primary" : "btn-secondary") +
      '" id="btn-scope-full">Full 8-Semester Plan</button>' +
      '<button type="button" class="btn btn-sm btn-secondary" id="btn-simulate-cycle">' +
      (appState.simulatedCycleEdges ? "Restore Valid DAG" : "Test Cycle Detection") +
      "</button>" +
      "</div>" +
      "</div>";

    if (result.hasCycle) {
      container.innerHTML =
        toolbarHTML +
        '<div class="surface-card">' +
        '<div class="empty-state">' +
        "<h3>Roadmap Halted: Circular Prerequisite Dependency Detected</h3>" +
        "<p>Detected dependency loop: <strong class=\"mono\">" +
        escapeHTML(result.cyclePath.join(" → ")) +
        "</strong>. Affected courses are blocked from unlocking until resolved.</p>" +
        '<button type="button" class="btn btn-primary btn-sm" id="btn-roadmap-restore-dag">Restore Valid Curriculum</button>' +
        "</div>" +
        "</div>";
      return;
    }

    const visibleSemesters =
      scope === "four-sem"
        ? result.semesters.filter(function (s) {
            return s.semesterNumber >= 1 && s.semesterNumber <= 4;
          })
        : result.semesters;

    const topoCodes = result.topoOrder
      .slice(0, 8)
      .map(function (c) {
        return c.code;
      })
      .join(" → ");

    const topoStripHTML =
      '<div class="topo-strip">' +
      "<div><strong>DAG Integrity Verified:</strong> " +
      result.topoOrder.length +
      " courses topologically ordered with 0 cycles.</div>" +
      '<div class="mono" style="color:var(--text-muted);">Order preview: ' +
      escapeHTML(topoCodes) +
      " …</div>" +
      "</div>";

    const cardsHTML = visibleSemesters
      .map(function (sem) {
        const isCurrent = sem.semesterNumber === Number(student.semester);
        const isCollapsed = Boolean(appState.preferences.collapsedSemesters[sem.semesterNumber]);
        const completedInSem = sem.items.filter(function (item) {
          return getCourseStatus(item.course.id) === "completed";
        }).length;

        const rowsHTML = sem.items
          .map(function (item) {
            const c = item.course;
            const status = getCourseStatus(c.id);
            const prereqText =
              c.prerequisites.length > 0 ? "Prereq: " + c.prerequisites.join(", ") : "No prerequisites";

            let actionHTML = "";
            if (status === "unlocked") {
              actionHTML =
                '<button type="button" class="btn btn-primary btn-sm" data-enroll-course="' +
                c.id +
                '">Enroll</button>';
            } else if (status === "enrolled" || status === "in-progress" || status === "completed") {
              const prog = appState.progress[c.id];
              const pct = prog ? prog.percentage : 0;
              actionHTML =
                '<button type="button" class="btn btn-secondary btn-sm" data-open-course="' +
                c.id +
                '">Modules (' +
                pct +
                "%)</button>";
            } else {
              actionHTML =
                '<button type="button" class="btn btn-ghost btn-sm" data-open-course="' +
                c.id +
                '">Details</button>';
            }

            return (
              '<div class="roadmap-course-row">' +
              '<div class="roadmap-course-info">' +
              '<div class="roadmap-course-head">' +
              '<span class="course-code-text">' +
              escapeHTML(c.code) +
              "</span>" +
              renderStatusTag(status) +
              "</div>" +
              '<button type="button" class="roadmap-course-name-btn" data-open-course="' +
              c.id +
              '">' +
              escapeHTML(c.title) +
              "</button>" +
              '<div class="meta-line" style="margin-top:4px;">' +
              "<span>" +
              c.credits +
              " Credits</span>" +
              '<span aria-hidden="true">·</span><span>' +
              escapeHTML(c.difficulty) +
              "</span>" +
              '<span aria-hidden="true">·</span><span>' +
              escapeHTML(prereqText) +
              "</span>" +
              "</div>" +
              '<p class="course-row-reason">' +
              escapeHTML(item.reason) +
              "</p>" +
              "</div>" +
              '<div class="course-row-actions">' +
              actionHTML +
              "</div>" +
              "</div>"
            );
          })
          .join("");

        return (
          '<article class="semester-card' +
          (isCurrent ? " is-current-sem" : "") +
          (isCollapsed ? " is-collapsed" : "") +
          '" data-semester-card="' +
          sem.semesterNumber +
          '">' +
          '<button type="button" class="semester-card-header" data-toggle-semester="' +
          sem.semesterNumber +
          '" aria-expanded="' +
          String(!isCollapsed) +
          '">' +
          '<div class="semester-heading-group">' +
          '<span class="semester-title">Semester ' +
          sem.semesterNumber +
          (isCurrent ? " (Current Semester)" : "") +
          "</span>" +
          '<span class="semester-sub tabular-nums">' +
          sem.items.length +
          " courses · " +
          sem.totalCredits +
          " credits · " +
          completedInSem +
          " completed</span>" +
          "</div>" +
          '<svg class="semester-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          "</button>" +
          '<div class="semester-card-body">' +
          rowsHTML +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    container.innerHTML = toolbarHTML + topoStripHTML + '<div class="roadmap-grid">' + cardsHTML + "</div>";
  }

  /* ------------------------------------------------------------------------
     11. VIEW 3: INTERACTIVE COURSE CATALOG (Debounced Search + 6 Filters)
     ------------------------------------------------------------------------ */

  function getFilteredCatalogCourses() {
    const f = appState.catalogFilters;
    const q = f.query.trim().toLowerCase();

    return COURSE_CATALOG.filter(function (course) {
      if (q) {
        const hay = (course.code + " " + course.title + " " + course.skillTags.join(" ")).toLowerCase();
        if (hay.indexOf(q) === -1) {
          return false;
        }
      }
      if (f.credits !== "all" && course.credits !== Number(f.credits)) {
        return false;
      }
      if (f.difficulty !== "all" && course.difficulty !== f.difficulty) {
        return false;
      }
      if (f.branch !== "all" && course.branches.indexOf(f.branch) === -1) {
        return false;
      }
      if (f.pathway !== "all" && course.careerTags.indexOf(f.pathway) === -1) {
        return false;
      }
      if (f.semester !== "all" && course.semester !== Number(f.semester)) {
        return false;
      }
      if (f.status !== "all") {
        const st = getCourseStatus(course.id);
        if (f.status === "enrolled-any") {
          if (st !== "enrolled" && st !== "in-progress" && st !== "completed") {
            return false;
          }
        } else if (st !== f.status) {
          return false;
        }
      }
      return true;
    });
  }

  function renderCatalogResultsOnly() {
    const resultsWrap = document.getElementById("catalog-results-wrap");
    if (!resultsWrap) {
      return;
    }
    const filtered = getFilteredCatalogCourses();

    const metaHTML =
      '<div class="catalog-results-meta">' +
      "<span>Showing <strong class=\"tabular-nums\">" +
      filtered.length +
      "</strong> of " +
      COURSE_CATALOG.length +
      " courses</span>" +
      "</div>";

    if (filtered.length === 0) {
      resultsWrap.innerHTML =
        metaHTML +
        '<div class="empty-state">' +
        "<h3>No matching courses found</h3>" +
        "<p>Try clearing one or more search or curriculum filters.</p>" +
        '<button type="button" class="btn btn-secondary btn-sm" id="btn-empty-reset-filters">Reset All Filters</button>' +
        "</div>";
      return;
    }

    const cardsHTML = filtered
      .map(function (course) {
        const status = getCourseStatus(course.id);
        const missing = getMissingPrerequisites(course.id);
        const prereqSummary =
          course.prerequisites.length > 0
            ? "Prerequisites: " + course.prerequisites.join(", ")
            : "Prerequisites: None";

        let primaryBtn = "";
        if (status === "unlocked") {
          primaryBtn =
            '<button type="button" class="btn btn-primary btn-sm" data-enroll-course="' +
            course.id +
            '">Enroll</button>';
        } else if (status === "locked") {
          primaryBtn =
            '<button type="button" class="btn btn-secondary btn-sm" data-locked-attempt="' +
            course.id +
            '" title="Requires ' +
            escapeHTML(missing.join(", ")) +
            '">Locked</button>';
        } else {
          const prog = appState.progress[course.id];
          primaryBtn =
            '<button type="button" class="btn btn-secondary btn-sm" data-open-course="' +
            course.id +
            '">Modules (' +
            (prog ? prog.percentage : 0) +
            "%)</button>";
        }

        return (
          '<article class="course-card">' +
          '<div class="course-card-top">' +
          '<div class="course-card-header-row">' +
          '<span class="course-code-text">' +
          escapeHTML(course.code) +
          "</span>" +
          renderStatusTag(status) +
          "</div>" +
          '<h3 class="course-card-title">' +
          escapeHTML(course.title) +
          "</h3>" +
          '<div class="meta-line">' +
          "<span>" +
          course.credits +
          " Credits</span>" +
          '<span aria-hidden="true">·</span><span>' +
          escapeHTML(course.difficulty) +
          "</span>" +
          '<span aria-hidden="true">·</span><span>Sem ' +
          course.semester +
          "</span>" +
          "</div>" +
          '<p class="course-card-desc">' +
          escapeHTML(course.description) +
          "</p>" +
          "</div>" +
          "<div>" +
          '<div class="course-card-prereqs">' +
          escapeHTML(prereqSummary) +
          "</div>" +
          '<div class="course-card-footer">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-open-course="' +
          course.id +
          '">View Details</button>' +
          primaryBtn +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    resultsWrap.innerHTML = metaHTML + '<div class="catalog-grid">' + cardsHTML + "</div>";
  }

  function renderCatalog() {
    const container = document.getElementById("catalog-container");
    const f = appState.catalogFilters;

    const branches = [
      "Computer Science Engineering (CSE)",
      "CSE – Artificial Intelligence and Machine Learning",
      "Information Technology (IT)",
      "Electronics and Communication Engineering (ECE)",
      "Electrical and Electronics Engineering (EEE)",
      "Mechanical Engineering",
      "Civil Engineering",
      "Other",
    ];
    const pathways = [
      "Full-Stack Web Development",
      "Artificial Intelligence and Machine Learning",
      "Data Science",
      "Cybersecurity",
      "Cloud Computing",
      "Software Development",
      "Mobile Application Development",
    ];

    container.innerHTML =
      '<div class="section-header">' +
      "<div>" +
      '<h2 class="section-title">Engineering Course Catalog</h2>' +
      '<p class="section-subtitle">Explore all ' +
      COURSE_CATALOG.length +
      " AICTE/UGC curriculum courses with live prerequisite unlock status.</p>" +
      "</div>" +
      "</div>" +
      '<div class="catalog-filters-bar">' +
      '<div class="search-row">' +
      '<div class="search-input-wrap">' +
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M20 20L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '<input type="search" id="catalog-search-input" placeholder="Search by course code (e.g. CS101) or title..." value="' +
      escapeHTML(f.query) +
      '" aria-label="Search courses by code or title" />' +
      "</div>" +
      '<button type="button" class="btn btn-secondary btn-sm" id="btn-reset-catalog-filters">Reset Filters</button>' +
      "</div>" +
      '<div class="filter-selects-grid">' +
      '<select class="filter-select" id="filter-credits" aria-label="Filter by credits">' +
      '<option value="all">All Credits</option>' +
      [2, 3, 4]
        .map(function (cr) {
          return '<option value="' + cr + '"' + (f.credits === String(cr) ? " selected" : "") + ">" + cr + " Credits</option>";
        })
        .join("") +
      "</select>" +
      '<select class="filter-select" id="filter-difficulty" aria-label="Filter by difficulty">' +
      '<option value="all">All Difficulties</option>' +
      ["Beginner", "Intermediate", "Advanced"]
        .map(function (d) {
          return '<option value="' + d + '"' + (f.difficulty === d ? " selected" : "") + ">" + d + "</option>";
        })
        .join("") +
      "</select>" +
      '<select class="filter-select" id="filter-branch" aria-label="Filter by branch">' +
      '<option value="all">All Branches</option>' +
      branches
        .map(function (b) {
          return '<option value="' + escapeHTML(b) + '"' + (f.branch === b ? " selected" : "") + ">" + escapeHTML(b) + "</option>";
        })
        .join("") +
      "</select>" +
      '<select class="filter-select" id="filter-pathway" aria-label="Filter by career pathway">' +
      '<option value="all">All Pathways</option>' +
      pathways
        .map(function (p) {
          return '<option value="' + escapeHTML(p) + '"' + (f.pathway === p ? " selected" : "") + ">" + escapeHTML(p) + "</option>";
        })
        .join("") +
      "</select>" +
      '<select class="filter-select" id="filter-semester" aria-label="Filter by semester">' +
      '<option value="all">All Semesters</option>' +
      [1, 2, 3, 4, 5, 6, 7, 8]
        .map(function (s) {
          return '<option value="' + s + '"' + (f.semester === String(s) ? " selected" : "") + ">Semester " + s + "</option>";
        })
        .join("") +
      "</select>" +
      '<select class="filter-select" id="filter-status" aria-label="Filter by enrollment status">' +
      '<option value="all"' + (f.status === "all" ? " selected" : "") + ">All Statuses</option>" +
      '<option value="unlocked"' + (f.status === "unlocked" ? " selected" : "") + ">Unlocked</option>" +
      '<option value="enrolled-any"' + (f.status === "enrolled-any" ? " selected" : "") + ">Enrolled / Completed</option>" +
      '<option value="completed"' + (f.status === "completed" ? " selected" : "") + ">Completed</option>" +
      '<option value="locked"' + (f.status === "locked" ? " selected" : "") + ">Locked</option>" +
      "</select>" +
      "</div>" +
      "</div>" +
      '<div id="catalog-results-wrap"></div>';

    renderCatalogResultsOnly();
  }

  /* ------------------------------------------------------------------------
     12. VIEW 4: MY ENROLLMENTS & MODULE COMPLETION
     ------------------------------------------------------------------------ */

  function renderEnrollments() {
    const container = document.getElementById("enrollments-container");
    const enrolledIds = Object.keys(appState.enrollments);

    if (enrolledIds.length === 0) {
      container.innerHTML =
        '<div class="section-header">' +
        '<div><h2 class="section-title">My Enrollments</h2><p class="section-subtitle">Manage your active courses and complete learning modules.</p></div>' +
        "</div>" +
        '<div class="surface-card"><div class="empty-state">' +
        "<h3>You have not enrolled in any courses yet</h3>" +
        "<p>Enroll in an unlocked foundational course like CS101 from your Roadmap or Course Catalog to start tracking learning modules.</p>" +
        '<button type="button" class="btn btn-primary btn-sm" data-nav-jump="catalog">Browse Unlocked Courses</button>' +
        "</div></div>";
      return;
    }

    const cardsHTML = enrolledIds
      .map(function (courseId) {
        const course = courseMap[courseId];
        if (!course) {
          return "";
        }
        const prog = appState.progress[courseId] || computeCourseProgressObject(course, []);
        const status = getCourseStatus(courseId);
        const enrollment = appState.enrollments[courseId];

        const modulesHTML = course.modules
          .map(function (mod) {
            const isDone = prog.completedModules.indexOf(mod.id) !== -1;
            return (
              '<label class="module-item' +
              (isDone ? " is-done" : "") +
              '">' +
              '<input type="checkbox" data-toggle-module="' +
              course.id +
              '" data-module-id="' +
              mod.id +
              '"' +
              (isDone ? " checked" : "") +
              " />" +
              '<span class="module-item-text">' +
              escapeHTML(mod.title) +
              "</span>" +
              '<span class="module-duration">' +
              mod.durationHours +
              "h</span>" +
              "</label>"
            );
          })
          .join("");

        return (
          '<article class="enrollment-card">' +
          '<div class="enrollment-card-head">' +
          "<div>" +
          '<div class="roadmap-course-head">' +
          '<span class="course-code-text">' +
          escapeHTML(course.code) +
          "</span>" +
          renderStatusTag(status) +
          "</div>" +
          '<h3 class="surface-title">' +
          escapeHTML(course.title) +
          "</h3>" +
          '<div class="meta-line" style="margin-top:4px;">' +
          "<span>" +
          course.credits +
          " Credits</span>" +
          '<span aria-hidden="true">·</span><span>' +
          prog.completedModules.length +
          " / " +
          prog.totalModules +
          " modules</span>" +
          '<span aria-hidden="true">·</span><span>Enrolled ' +
          escapeHTML(enrollment.enrollmentDate) +
          "</span>" +
          "</div>" +
          "</div>" +
          renderProgressRing(prog.percentage, 64, 6, false) +
          "</div>" +
          '<div class="module-list">' +
          modulesHTML +
          "</div>" +
          '<div class="course-card-footer">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-open-course="' +
          course.id +
          '">Course Overview</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-drop-course="' +
          course.id +
          '">Drop Course</button>' +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    container.innerHTML =
      '<div class="section-header">' +
      '<div><h2 class="section-title">My Enrollments &amp; Learning Modules</h2>' +
      '<p class="section-subtitle">Check off completed modules to update your circular progress rings and unlock downstream courses.</p></div>' +
      "</div>" +
      '<div class="enrollments-grid">' +
      cardsHTML +
      "</div>";
  }

  /* ------------------------------------------------------------------------
     13. VIEW 5: SEMESTER PROGRESS TRACKER
     ------------------------------------------------------------------------ */

  function renderProgressTracker() {
    const container = document.getElementById("progress-container");
    const metrics = calculateOverallMetrics();

    const semesterRows = [1, 2, 3, 4, 5, 6, 7, 8].map(function (semNum) {
      const semCourses = COURSE_CATALOG.filter(function (c) {
        return c.semester === semNum;
      });
      const totalCr = semCourses.reduce(function (sum, c) {
        return sum + c.credits;
      }, 0);
      const compCr = semCourses.reduce(function (sum, c) {
        return getCourseStatus(c.id) === "completed" ? sum + c.credits : sum;
      }, 0);
      const pct = totalCr > 0 ? Math.round((compCr / totalCr) * 100) : 0;

      return (
        '<div class="sem-bar-row">' +
        "<span><strong>Semester " +
        semNum +
        "</strong></span>" +
        '<div class="bar-track"><div class="bar-fill" style="width:' +
        pct +
        '%"></div></div>' +
        '<span class="mono" style="text-align:right;">' +
        compCr +
        " / " +
        totalCr +
        " cr (" +
        pct +
        "%)</span>" +
        "</div>"
      );
    });

    const enrolledRows = Object.keys(appState.enrollments).map(function (id) {
      const c = courseMap[id];
      const p = appState.progress[id];
      if (!c || !p) {
        return "";
      }
      return (
        "<tr>" +
        '<td class="mono">' +
        escapeHTML(c.code) +
        "</td>" +
        "<td>" +
        escapeHTML(c.title) +
        "</td>" +
        "<td>" +
        renderStatusTag(getCourseStatus(id)) +
        "</td>" +
        '<td class="num">' +
        c.credits +
        "</td>" +
        '<td class="num">' +
        p.completedModules.length +
        " / " +
        p.totalModules +
        "</td>" +
        '<td class="num"><strong>' +
        p.percentage +
        "%</strong></td>" +
        "</tr>"
      );
    });

    container.innerHTML =
      '<div class="section-header">' +
      '<div><h2 class="section-title">Academic Progress Tracker</h2>' +
      '<p class="section-subtitle">Real-time credit completion, active module progress, and semester milestones.</p></div>' +
      "</div>" +
      '<div class="kpi-grid">' +
      '<div class="kpi-card"><div><div class="kpi-label">Total Catalog Credits</div><div class="kpi-value tabular-nums">' +
      metrics.totalCatalogCredits +
      '</div><div class="kpi-sub">' +
      metrics.totalCourses +
      " total courses</div></div></div>" +
      '<div class="kpi-card"><div><div class="kpi-label">Enrolled Credits</div><div class="kpi-value tabular-nums">' +
      metrics.enrolledCredits +
      '</div><div class="kpi-sub">' +
      metrics.enrolledCoursesCount +
      " active courses</div></div></div>" +
      '<div class="kpi-card"><div><div class="kpi-label">Completed Credits</div><div class="kpi-value tabular-nums">' +
      metrics.completedCredits +
      '</div><div class="kpi-sub">' +
      metrics.completedCoursesCount +
      " courses completed</div></div></div>" +
      '<div class="kpi-card"><div><div class="kpi-label">Remaining Credits</div><div class="kpi-value tabular-nums">' +
      metrics.remainingCredits +
      '</div><div class="kpi-sub">To complete full catalog</div></div></div>' +
      "</div>" +
      '<div class="progress-hero-grid">' +
      '<div class="surface-card progress-ring-card">' +
      '<h3 class="surface-title">Active Course Completion</h3>' +
      renderProgressRing(metrics.activeEnrolledPct, 144, 12, true) +
      '<p class="meta-line" style="justify-content:center;">' +
      metrics.completedModulesInEnrolled +
      " of " +
      metrics.totalModulesInEnrolled +
      " enrolled modules completed</p>" +
      "</div>" +
      '<div class="surface-card">' +
      '<div class="surface-header"><h3 class="surface-title">Semester-Wise Credit Completion</h3></div>' +
      '<div class="semester-bars-list">' +
      semesterRows.join("") +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="surface-card">' +
      '<div class="surface-header"><h3 class="surface-title">Enrolled Course Progress Breakdown</h3></div>' +
      (enrolledRows.length > 0
        ? '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Code</th><th>Course Title</th><th>Status</th><th class="num">Credits</th><th class="num">Modules</th><th class="num">Progress</th></tr></thead><tbody>' +
          enrolledRows.join("") +
          "</tbody></table></div>"
        : '<div class="empty-state"><h3>No active course progress yet</h3><p>Enroll in a course and complete modules to populate your academic breakdown.</p></div>') +
      "</div>";
  }

  /* ------------------------------------------------------------------------
     14. VIEW 6: STUDY HOURS ESTIMATOR (Transparent Heuristic Formula)
     ------------------------------------------------------------------------ */

  function computeStudyWorkload() {
    const enrolledIds = Object.keys(appState.enrollments);
    const items = [];
    let totalHours = 0;

    enrolledIds.forEach(function (id) {
      const course = courseMap[id];
      const status = getCourseStatus(id);
      if (!course || status === "completed") {
        return;
      }
      const mult = DIFFICULTY_MULTIPLIERS[course.difficulty] || 1.5;
      const estimatedHours = Number((course.credits * mult).toFixed(2));
      totalHours += estimatedHours;
      items.push({
        course: course,
        multiplier: mult,
        estimatedHours: estimatedHours,
      });
    });

    const budget = Number(appState.student ? appState.student.weeklyStudyHours : 16);
    return {
      items: items,
      totalHours: Number(totalHours.toFixed(2)),
      budget: budget,
      exceedsBudget: totalHours > budget,
      utilizationPct: budget > 0 ? Math.min(100, Math.round((totalHours / budget) * 100)) : 0,
    };
  }

  function renderStudyEstimator() {
    const container = document.getElementById("estimator-container");
    const workload = computeStudyWorkload();
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyWeights = [0.14, 0.14, 0.14, 0.14, 0.14, 0.16, 0.14];

    const breakdownHTML =
      workload.items.length > 0
        ? workload.items
            .map(function (item) {
              const barPct =
                workload.totalHours > 0 ? Math.round((item.estimatedHours / workload.totalHours) * 100) : 0;
              return (
                '<div class="sem-bar-row">' +
                '<span class="mono"><strong>' +
                escapeHTML(item.course.code) +
                "</strong> (" +
                item.course.difficulty.slice(0, 3) +
                ")</span>" +
                '<div class="bar-track"><div class="bar-fill" style="width:' +
                barPct +
                '%"></div></div>' +
                '<span class="mono" style="text-align:right;">' +
                item.estimatedHours.toFixed(1) +
                " hrs/wk</span>" +
                "</div>"
              );
            })
            .join("")
        : '<div class="empty-state"><h3>No active unfinished enrollments</h3><p>Enroll in courses to estimate your weekly study commitment.</p></div>';

    const scheduleHTML = days
      .map(function (day, idx) {
        const hrs = (workload.totalHours * dailyWeights[idx]).toFixed(1);
        return (
          '<div class="day-slot">' +
          '<div class="day-slot-name">' +
          day +
          "</div>" +
          '<div class="day-slot-hours tabular-nums">' +
          hrs +
          "h</div>" +
          "</div>"
        );
      })
      .join("");

    const alertHTML = workload.exceedsBudget
      ? '<div class="alert-banner alert-warning" style="margin:0 0 20px;">' +
        "<div><strong>Workload Warning:</strong> Estimated weekly study load (" +
        workload.totalHours.toFixed(1) +
        " hrs) exceeds your stated budget of " +
        workload.budget +
        " hrs/week. Consider spacing out advanced courses.</div>" +
        "</div>"
      : '<div class="alert-banner alert-info" style="margin:0 0 20px;">' +
        "<div><strong>Balanced Schedule:</strong> Estimated weekly study load (" +
        workload.totalHours.toFixed(1) +
        " hrs) fits comfortably within your " +
        workload.budget +
        " hrs/week availability.</div>" +
        "</div>";

    container.innerHTML =
      '<div class="section-header">' +
      '<div><h2 class="section-title">Study Hours Estimator</h2>' +
      '<p class="section-subtitle">Transparent weekly workload calculation based on your active enrollments and course difficulty.</p></div>' +
      "</div>" +
      alertHTML +
      '<div class="formula-box">' +
      "<strong>Transparent Estimation Formula (Heuristic, not an AI prediction):</strong> " +
      '<span class="mono">Weekly Hours = Course Credits × Difficulty Multiplier</span> ' +
      "(Beginner: 1.25h/credit · Intermediate: 1.75h/credit · Advanced: 2.25h/credit)." +
      "</div>" +
      '<div class="estimator-grid">' +
      '<section class="surface-card">' +
      '<div class="surface-header"><h3 class="surface-title">Course-Wise Estimated Workload</h3><span class="mono">' +
      workload.totalHours.toFixed(1) +
      " / " +
      workload.budget +
      " hrs</span></div>" +
      '<div class="semester-bars-list">' +
      breakdownHTML +
      "</div>" +
      "</section>" +
      '<section class="surface-card">' +
      '<div class="surface-header"><h3 class="surface-title">Suggested Weekly Distribution</h3></div>' +
      '<p class="section-subtitle" style="margin-bottom:16px;font-size:0.875rem;">Evenly paced study blocks across weekdays with slightly deeper Saturday review.</p>' +
      '<div class="schedule-grid">' +
      scheduleHTML +
      "</div>" +
      "</section>" +
      "</div>";
  }

  /* ------------------------------------------------------------------------
     15. VIEW 7: PEER STUDY GROUP RECOMMENDER (Sample Profiles)
     ------------------------------------------------------------------------ */

  function computePeerMatch(peer, student) {
    let score = 35;
    if (peer.careerPathway === student.careerPathway) {
      score += 35;
    }
    if (peer.branch === student.branch) {
      score += 15;
    }
    if (Math.abs(peer.semester - Number(student.semester)) <= 1) {
      score += 10;
    }

    const userEnrolled = Object.keys(appState.enrollments);
    const sharedCourses = peer.enrolledCourses.filter(function (cid) {
      return userEnrolled.indexOf(cid) !== -1;
    });
    score += Math.min(15, sharedCourses.length * 8);

    return {
      score: Math.min(99, score),
      sharedCourses: sharedCourses,
    };
  }

  function renderPeerGroups() {
    const container = document.getElementById("peers-container");
    const student = appState.student;

    const rankedPeers = SAMPLE_PEERS.map(function (peer) {
      const match = computePeerMatch(peer, student);
      return {
        peer: peer,
        score: match.score,
        sharedCourses: match.sharedCourses,
      };
    }).sort(function (a, b) {
      return b.score - a.score;
    });

    const peersHTML = rankedPeers
      .map(function (entry) {
        const p = entry.peer;
        const initials = p.name
          .split(" ")
          .map(function (n) {
            return n[0];
          })
          .join("")
          .slice(0, 2);
        const sharedText =
          entry.sharedCourses.length > 0
            ? "Shared enrolled courses: " + entry.sharedCourses.join(", ")
            : "Enrolled in: " + p.enrolledCourses.join(", ");

        return (
          '<article class="peer-card">' +
          '<div class="peer-card-head">' +
          '<div class="peer-identity">' +
          '<span class="avatar-initials">' +
          escapeHTML(initials) +
          "</span>" +
          "<div>" +
          '<h3 class="course-row-title">' +
          escapeHTML(p.name) +
          "</h3>" +
          '<div class="meta-line"><span>' +
          escapeHTML(p.branch) +
          "</span><span aria-hidden=\"true\">·</span><span>Sem " +
          p.semester +
          "</span></div>" +
          "</div>" +
          "</div>" +
          '<span class="match-score">' +
          entry.score +
          "% match</span>" +
          "</div>" +
          '<div class="meta-line"><span>Pathway: <strong>' +
          escapeHTML(p.careerPathway) +
          "</strong></span></div>" +
          '<div class="meta-line"><span>' +
          escapeHTML(sharedText) +
          "</span></div>" +
          '<div class="meta-line"><span>Interests: ' +
          escapeHTML(p.interests.join(" · ")) +
          "</span></div>" +
          "</article>"
        );
      })
      .join("");

    const groupsHTML = appState.peerGroups
      .map(function (grp) {
        const joined = appState.joinedGroupIds.indexOf(grp.id) !== -1;
        const memberCount = grp.members.length + (joined ? 1 : 0);
        return (
          '<div class="course-row-item">' +
          '<div class="course-row-main">' +
          '<div class="course-row-title">' +
          escapeHTML(grp.name) +
          "</div>" +
          '<div class="meta-line">' +
          '<span class="mono">' +
          escapeHTML(grp.focusCourse) +
          "</span>" +
          '<span aria-hidden="true">·</span><span>' +
          escapeHTML(grp.schedule) +
          "</span>" +
          '<span aria-hidden="true">·</span><span>' +
          memberCount +
          " sample members</span>" +
          "</div>" +
          "</div>" +
          '<div class="course-row-actions">' +
          '<button type="button" class="btn btn-sm ' +
          (joined ? "btn-secondary" : "btn-primary") +
          '" data-toggle-group="' +
          escapeHTML(grp.id) +
          '">' +
          (joined ? "Leave Group" : "Join Group") +
          "</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    container.innerHTML =
      '<div class="section-header">' +
      '<div><h2 class="section-title">Peer Study Group Recommender</h2>' +
      '<p class="section-subtitle">Sample cohort directory demonstrating matching by career pathway, semester, and shared enrollments.</p></div>' +
      '<button type="button" class="btn btn-primary btn-sm" id="btn-open-create-group">Create Sample Study Group</button>' +
      "</div>" +
      '<div class="alert-banner alert-info" style="margin:0 0 20px;">' +
      "<div><strong>Demonstration Notice:</strong> Profiles below are sample cohort records used to demonstrate compatibility matching and group workflows offline.</div>" +
      "</div>" +
      '<div class="peers-grid">' +
      peersHTML +
      "</div>" +
      '<section class="surface-card">' +
      '<div class="surface-header"><h3 class="surface-title">Active Sample Study Groups</h3></div>' +
      '<div class="stack-list">' +
      groupsHTML +
      "</div>" +
      "</section>";
  }

  /* ------------------------------------------------------------------------
     16. VIEW 8: INTERACTIVE SVG PREREQUISITE DEPENDENCY GRAPH
     ------------------------------------------------------------------------ */

  function getGraphCoursesSubset() {
    const filter = appState.graphState.pathwayFilter;
    if (filter === "all") {
      return COURSE_CATALOG;
    }
    const student = appState.student;
    const picked = {};
    COURSE_CATALOG.forEach(function (c) {
      if (
        c.careerTags.indexOf(student.careerPathway) !== -1 ||
        c.semester <= 2
      ) {
        picked[c.id] = true;
      }
    });
    // Ensure prerequisites included
    let changed = true;
    while (changed) {
      changed = false;
      COURSE_CATALOG.forEach(function (c) {
        if (picked[c.id]) {
          c.prerequisites.forEach(function (pid) {
            if (!picked[pid]) {
              picked[pid] = true;
              changed = true;
            }
          });
        }
      });
    }
    return COURSE_CATALOG.filter(function (c) {
      return Boolean(picked[c.id]);
    });
  }

  function renderPrerequisiteGraph() {
    const container = document.getElementById("graph-container");
    const courses = getGraphCoursesSubset();
    const result = appState.roadmapResult;
    const depthMap = result && result.depthMap ? result.depthMap : {};

    // Group courses into topological depth columns
    const columns = {};
    let maxDepth = 0;
    courses.forEach(function (c) {
      const d = typeof depthMap[c.id] === "number" ? depthMap[c.id] : c.semester - 1;
      if (d > maxDepth) {
        maxDepth = d;
      }
      if (!columns[d]) {
        columns[d] = [];
      }
      columns[d].push(c);
    });

    const NODE_W = 166;
    const NODE_H = 56;
    const COL_GAP = 64;
    const ROW_GAP = 22;
    const PAD_X = 30;
    const PAD_Y = 30;

    let maxRows = 1;
    Object.keys(columns).forEach(function (k) {
      if (columns[k].length > maxRows) {
        maxRows = columns[k].length;
      }
    });

    const svgWidth = Math.max(760, PAD_X * 2 + (maxDepth + 1) * NODE_W + maxDepth * COL_GAP);
    const svgHeight = Math.max(420, PAD_Y * 2 + maxRows * NODE_H + (maxRows - 1) * ROW_GAP);

    const pos = {};
    for (let d = 0; d <= maxDepth; d += 1) {
      const colCourses = columns[d] || [];
      colCourses.forEach(function (c, idx) {
        pos[c.id] = {
          x: PAD_X + d * (NODE_W + COL_GAP),
          y: PAD_Y + idx * (NODE_H + ROW_GAP),
        };
      });
    }

    const selectedId = appState.graphState.selectedCourseId;
    const selectedCourse = courseMap[selectedId] || courses[0];
    const selectedPrereqs = selectedCourse ? selectedCourse.prerequisites : [];

    // Draw SVG edges
    let edgesSVG = "";
    courses.forEach(function (c) {
      c.prerequisites.forEach(function (pid) {
        if (!pos[pid] || !pos[c.id]) {
          return;
        }
        const from = pos[pid];
        const to = pos[c.id];
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const mx = (x1 + x2) / 2;

        let edgeClass = "dag-edge";
        if (selectedCourse && c.id === selectedCourse.id) {
          edgeClass += " is-prereq-highlight";
        } else if (selectedCourse && pid === selectedCourse.id) {
          edgeClass += " is-dependent-highlight";
        }

        edgesSVG +=
          '<path class="' +
          edgeClass +
          '" d="M ' +
          x1 +
          " " +
          y1 +
          " C " +
          mx +
          " " +
          y1 +
          ", " +
          mx +
          " " +
          y2 +
          ", " +
          x2 +
          " " +
          y2 +
          '" marker-end="url(#dag-arrow)"></path>';
      });
    });

    // Draw SVG nodes
    let nodesSVG = "";
    courses.forEach(function (c) {
      const p = pos[c.id];
      const status = getCourseStatus(c.id);
      const isSelected = selectedCourse && selectedCourse.id === c.id;
      const isPrereqOfSelected = selectedPrereqs.indexOf(c.id) !== -1;

      let fill = "#f1f5f9";
      let stroke = "#94a3b8";
      let textColor = "#334155";

      if (status === "completed") {
        fill = "#f0fdf4";
        stroke = "#15803d";
        textColor = "#14532d";
      } else if (status === "enrolled" || status === "in-progress") {
        fill = "#f0f9ff";
        stroke = "#0369a1";
        textColor = "#0c4a6e";
      } else if (status === "unlocked") {
        fill = "#f0fdfa";
        stroke = "#0f766e";
        textColor = "#134e4a";
      }

      if (isSelected) {
        stroke = "#0f172a";
      } else if (isPrereqOfSelected) {
        stroke = "#0f766e";
      }

      const shortTitle = c.title.length > 21 ? c.title.slice(0, 19) + "…" : c.title;

      nodesSVG +=
        '<g class="dag-node' +
        (isSelected ? " is-selected" : "") +
        '" data-graph-node="' +
        c.id +
        '" transform="translate(' +
        p.x +
        "," +
        p.y +
        ')">' +
        '<rect width="' +
        NODE_W +
        '" height="' +
        NODE_H +
        '" rx="8" fill="' +
        fill +
        '" stroke="' +
        stroke +
        '" stroke-width="' +
        (isSelected ? "2.5" : "1.5") +
        '"></rect>' +
        '<text x="12" y="21" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="' +
        stroke +
        '">' +
        escapeHTML(c.code) +
        " · " +
        c.credits +
        "cr</text>" +
        '<text x="12" y="40" font-family="DM Sans, sans-serif" font-size="12" font-weight="600" fill="' +
        textColor +
        '">' +
        escapeHTML(shortTitle) +
        "</text>" +
        "</g>";
    });

    const zoom = appState.graphState.zoom;
    const scaledW = Math.round(svgWidth * zoom);
    const scaledH = Math.round(svgHeight * zoom);

    // Build Inspector Sidebar
    const selStatus = selectedCourse ? getCourseStatus(selectedCourse.id) : "locked";
    const dependents = selectedCourse
      ? COURSE_CATALOG.filter(function (c) {
          return c.prerequisites.indexOf(selectedCourse.id) !== -1;
        })
      : [];

    const inspectorHTML = selectedCourse
      ? '<aside class="surface-card">' +
        '<div class="surface-header">' +
        '<div><span class="course-code-text">' +
        escapeHTML(selectedCourse.code) +
        '</span><h3 class="surface-title" style="margin-top:2px;">' +
        escapeHTML(selectedCourse.title) +
        "</h3></div>" +
        renderStatusTag(selStatus) +
        "</div>" +
        '<p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:14px;">' +
        escapeHTML(selectedCourse.description) +
        "</p>" +
        '<div class="meta-line" style="margin-bottom:14px;"><span>' +
        selectedCourse.credits +
        ' Credits</span><span aria-hidden="true">·</span><span>' +
        escapeHTML(selectedCourse.difficulty) +
        '</span><span aria-hidden="true">·</span><span>Sem ' +
        selectedCourse.semester +
        "</span></div>" +
        '<div style="margin-bottom:12px;">' +
        '<strong style="font-size:0.8125rem;display:block;margin-bottom:4px;">Unlocked By (Prerequisites):</strong>' +
        '<div class="meta-line">' +
        (selectedCourse.prerequisites.length > 0
          ? selectedCourse.prerequisites
              .map(function (pid) {
                return (
                  '<button type="button" class="text-link-btn" data-graph-node="' +
                  pid +
                  '">' +
                  escapeHTML(pid) +
                  "</button>"
                );
              })
              .join("")
          : "<span>None (Entry-level course)</span>") +
        "</div></div>" +
        '<div style="margin-bottom:16px;">' +
        '<strong style="font-size:0.8125rem;display:block;margin-bottom:4px;">Unlocks Next:</strong>' +
        '<div class="meta-line">' +
        (dependents.length > 0
          ? dependents
              .map(function (d) {
                return (
                  '<button type="button" class="text-link-btn" data-graph-node="' +
                  d.id +
                  '">' +
                  escapeHTML(d.code) +
                  "</button>"
                );
              })
              .join("")
          : "<span>Terminal / Capstone Course</span>") +
        "</div></div>" +
        '<div class="course-row-actions">' +
        (selStatus === "unlocked"
          ? '<button type="button" class="btn btn-primary btn-sm" data-enroll-course="' +
            selectedCourse.id +
            '">Enroll in ' +
            escapeHTML(selectedCourse.code) +
            "</button>"
          : "") +
        '<button type="button" class="btn btn-secondary btn-sm" data-open-course="' +
        selectedCourse.id +
        '">Open Modules &amp; Info</button>' +
        "</div>" +
        "</aside>"
      : "";

    // Mobile accessible node list
    const mobileListHTML = courses
      .map(function (c) {
        return (
          '<div class="course-row-item">' +
          '<div class="course-row-main">' +
          '<button type="button" class="roadmap-course-name-btn" data-graph-node="' +
          c.id +
          '">' +
          escapeHTML(c.code + " — " + c.title) +
          "</button>" +
          '<div class="meta-line"><span>Prereq: ' +
          (c.prerequisites.length > 0 ? c.prerequisites.join(", ") : "None") +
          "</span></div>" +
          "</div>" +
          renderStatusTag(getCourseStatus(c.id)) +
          "</div>"
        );
      })
      .join("");

    container.innerHTML =
      '<div class="section-header">' +
      '<div><h2 class="section-title">Prerequisite Dependency Graph</h2>' +
      '<p class="section-subtitle">Interactive topological SVG DAG generated directly from course prerequisite relationships.</p></div>' +
      "</div>" +
      '<div class="graph-layout">' +
      '<div class="graph-stage-card">' +
      '<div class="graph-toolbar">' +
      '<div class="graph-legend">' +
      '<span class="legend-item"><span class="legend-swatch swatch-completed"></span>Completed</span>' +
      '<span class="legend-item"><span class="legend-swatch swatch-enrolled"></span>Enrolled</span>' +
      '<span class="legend-item"><span class="legend-swatch swatch-unlocked"></span>Unlocked</span>' +
      '<span class="legend-item"><span class="legend-swatch swatch-locked"></span>Locked</span>' +
      "</div>" +
      '<div class="course-row-actions">' +
      '<button type="button" class="btn btn-sm ' +
      (appState.graphState.pathwayFilter === "recommended" ? "btn-primary" : "btn-secondary") +
      '" id="btn-graph-recommended">My Pathway</button>' +
      '<button type="button" class="btn btn-sm ' +
      (appState.graphState.pathwayFilter === "all" ? "btn-primary" : "btn-secondary") +
      '" id="btn-graph-all">All 43 Courses</button>' +
      '<button type="button" class="btn btn-sm btn-secondary" id="btn-graph-zoom-out" aria-label="Zoom out">-</button>' +
      '<button type="button" class="btn btn-sm btn-secondary" id="btn-graph-zoom-in" aria-label="Zoom in">+</button>' +
      "</div>" +
      "</div>" +
      '<div class="graph-svg-scroll">' +
      '<svg class="dag-svg" width="' +
      scaledW +
      '" height="' +
      scaledH +
      '" viewBox="0 0 ' +
      svgWidth +
      " " +
      svgHeight +
      '" role="img" aria-label="Prerequisite dependency graph">' +
      "<defs>" +
      '<marker id="dag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8"></path>' +
      "</marker>" +
      "</defs>" +
      edgesSVG +
      nodesSVG +
      "</svg>" +
      "</div>" +
      "</div>" +
      inspectorHTML +
      "</div>" +
      '<div class="graph-mobile-list surface-card">' +
      '<div class="surface-header"><h3 class="surface-title">Quick Node Selector</h3></div>' +
      '<div class="stack-list">' +
      mobileListHTML +
      "</div>" +
      "</div>";
  }

  /* ------------------------------------------------------------------------
     17. VIEW 9: MY PROFILE & DIAGNOSTIC EDITOR
     ------------------------------------------------------------------------ */

  function renderProfileView() {
    const container = document.getElementById("profile-container");
    const s = appState.student;
    const languages = ["None", "C", "C++", "Python", "Java", "JavaScript", "Other"];
    const branches = [
      "Computer Science Engineering (CSE)",
      "CSE – Artificial Intelligence and Machine Learning",
      "Information Technology (IT)",
      "Electronics and Communication Engineering (ECE)",
      "Electrical and Electronics Engineering (EEE)",
      "Mechanical Engineering",
      "Civil Engineering",
      "Other",
    ];
    const pathways = [
      "Full-Stack Web Development",
      "Artificial Intelligence and Machine Learning",
      "Data Science",
      "Cybersecurity",
      "Cloud Computing",
      "Software Development",
      "Mobile Application Development",
    ];
    const experiences = [
      "Complete beginner",
      "Basic programming knowledge",
      "Intermediate programming knowledge",
      "Advanced programming knowledge",
    ];

    container.innerHTML =
      '<div class="section-header">' +
      '<div><h2 class="section-title">Student Diagnostic Profile</h2>' +
      '<p class="section-subtitle">Update your academic details to dynamically recompute your personalized roadmap.</p></div>' +
      '<div class="course-row-actions">' +
      '<button type="button" class="btn btn-secondary btn-sm" id="btn-load-demo-profile">Reset to Sample CSE Demo</button>' +
      '<button type="button" class="btn btn-danger btn-sm" id="btn-reset-all-data">Clear All Data</button>' +
      "</div>" +
      "</div>" +
      '<div class="surface-card" style="max-width:780px;">' +
      '<form id="profile-edit-form" class="diagnostic-form" novalidate>' +
      '<div class="form-grid">' +
      '<div class="form-field form-field-full">' +
      '<label for="prof-name">Student Full Name</label>' +
      '<input id="prof-name" name="name" type="text" value="' +
      escapeHTML(s.name) +
      '" required />' +
      "</div>" +
      '<div class="form-field">' +
      '<label for="prof-branch">Engineering Branch</label>' +
      '<select id="prof-branch" name="branch" required>' +
      branches
        .map(function (b) {
          return '<option value="' + escapeHTML(b) + '"' + (s.branch === b ? " selected" : "") + ">" + escapeHTML(b) + "</option>";
        })
        .join("") +
      "</select>" +
      "</div>" +
      '<div class="form-field">' +
      '<label for="prof-semester">Current Semester</label>' +
      '<select id="prof-semester" name="semester" required>' +
      [1, 2, 3, 4, 5, 6, 7, 8]
        .map(function (sem) {
          return '<option value="' + sem + '"' + (Number(s.semester) === sem ? " selected" : "") + ">Semester " + sem + "</option>";
        })
        .join("") +
      "</select>" +
      "</div>" +
      '<div class="form-field">' +
      '<label for="prof-experience">Programming Experience</label>' +
      '<select id="prof-experience" name="programmingExperience" required>' +
      experiences
        .map(function (exp) {
          return '<option value="' + escapeHTML(exp) + '"' + (s.programmingExperience === exp ? " selected" : "") + ">" + escapeHTML(exp) + "</option>";
        })
        .join("") +
      "</select>" +
      "</div>" +
      '<div class="form-field">' +
      '<label for="prof-pathway">Target Career Pathway</label>' +
      '<select id="prof-pathway" name="careerPathway" required>' +
      pathways
        .map(function (pw) {
          return '<option value="' + escapeHTML(pw) + '"' + (s.careerPathway === pw ? " selected" : "") + ">" + escapeHTML(pw) + "</option>";
        })
        .join("") +
      "</select>" +
      "</div>" +
      '<div class="form-field form-field-full">' +
      '<span class="field-label">Programming Languages Known</span>' +
      '<div class="checkbox-cluster" id="prof-languages-group">' +
      languages
        .map(function (lang) {
          const checked = s.knownLanguages.indexOf(lang) !== -1 ? " checked" : "";
          return '<label class="check-tile"><input type="checkbox" name="knownLanguages" value="' + lang + '"' + checked + " /><span>" + lang + "</span></label>";
        })
        .join("") +
      "</div>" +
      "</div>" +
      '<div class="form-field form-field-full">' +
      '<label for="prof-hours">Weekly Available Study Hours</label>' +
      '<div class="range-input-row">' +
      '<input id="prof-hours" name="weeklyStudyHours" type="number" min="4" max="60" value="' +
      s.weeklyStudyHours +
      '" required />' +
      '<span class="input-unit">hours / week</span>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="course-row-actions">' +
      '<button type="submit" class="btn btn-primary">Save Profile &amp; Recompute Roadmap</button>' +
      "</div>" +
      "</form>" +
      "</div>";
  }

  /* ------------------------------------------------------------------------
     18. VIEW 10: PDF ROADMAP EXPORT (Advisor Sign-Off Sheet)
     ------------------------------------------------------------------------ */

  function renderExportView() {
    const container = document.getElementById("export-container");
    const s = appState.student;
    const metrics = calculateOverallMetrics();
    const result = appState.roadmapResult;
    const generatedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const roadmapTablesHTML =
      result && !result.hasCycle
        ? result.semesters
            .map(function (sem) {
              const rows = sem.items
                .map(function (item) {
                  const c = item.course;
                  const status = getCourseStatus(c.id);
                  const prog = appState.progress[c.id];
                  const pctText = prog ? " (" + prog.percentage + "%)" : "";
                  return (
                    "<tr>" +
                    '<td class="mono">' +
                    escapeHTML(c.code) +
                    "</td>" +
                    "<td>" +
                    escapeHTML(c.title) +
                    "</td>" +
                    '<td class="num">' +
                    c.credits +
                    "</td>" +
                    "<td>" +
                    (c.prerequisites.length > 0 ? escapeHTML(c.prerequisites.join(", ")) : "None") +
                    "</td>" +
                    "<td>" +
                    escapeHTML(getStatusMeta(status).label + pctText) +
                    "</td>" +
                    "</tr>"
                  );
                })
                .join("");

              return (
                '<div style="margin-bottom:22px;">' +
                '<h3 style="font-size:1rem;margin-bottom:8px;">Semester ' +
                sem.semesterNumber +
                " (" +
                sem.totalCredits +
                " Credits)</h3>" +
                '<table class="data-table">' +
                '<thead><tr><th>Code</th><th>Course Title</th><th class="num">Credits</th><th>Prerequisites</th><th>Status</th></tr></thead>' +
                "<tbody>" +
                rows +
                "</tbody></table></div>"
              );
            })
            .join("")
        : "<p>Roadmap unavailable while a circular dependency exists.</p>";

    container.innerHTML =
      '<div class="section-header no-print">' +
      '<div><h2 class="section-title">Advisor-Ready PDF Roadmap Export</h2>' +
      '<p class="section-subtitle">Print or save this formatted academic plan as a PDF for faculty advisor sign-off.</p></div>' +
      '<button type="button" class="btn btn-primary" id="btn-export-pdf">Print / Export PDF</button>' +
      "</div>" +
      '<article class="export-sheet">' +
      '<div class="export-header">' +
      "<div>" +
      '<div class="brand-wordmark" style="font-size:1.375rem;">SkillSprout: LearnLoop</div>' +
      '<p style="color:var(--text-secondary);font-size:0.875rem;margin-top:4px;">Academic Curriculum &amp; Prerequisite Roadmap Plan</p>' +
      "</div>" +
      '<div style="text-align:right;font-size:0.8125rem;color:var(--text-secondary);">' +
      "<div><strong>Generated Date:</strong> " +
      escapeHTML(generatedDate) +
      "</div>" +
      "<div><strong>Progress:</strong> " +
      metrics.completedCredits +
      " / " +
      metrics.totalCatalogCredits +
      " Credits (" +
      metrics.activeEnrolledPct +
      "% active modules)</div>" +
      "</div>" +
      "</div>" +
      '<div class="export-meta-grid">' +
      '<div><div class="export-meta-label">Student Name</div><div class="export-meta-val">' +
      escapeHTML(s.name) +
      "</div></div>" +
      '<div><div class="export-meta-label">Engineering Branch</div><div class="export-meta-val">' +
      escapeHTML(s.branch) +
      "</div></div>" +
      '<div><div class="export-meta-label">Current Semester</div><div class="export-meta-val">Semester ' +
      s.semester +
      "</div></div>" +
      '<div><div class="export-meta-label">Programming Experience</div><div class="export-meta-val">' +
      escapeHTML(s.programmingExperience) +
      "</div></div>" +
      '<div><div class="export-meta-label">Target Career Pathway</div><div class="export-meta-val">' +
      escapeHTML(s.careerPathway) +
      "</div></div>" +
      '<div><div class="export-meta-label">Weekly Study Budget</div><div class="export-meta-val">' +
      s.weeklyStudyHours +
      " hrs / week</div></div>" +
      "</div>" +
      roadmapTablesHTML +
      '<div class="signature-grid">' +
      '<div><div class="signature-line">Student Signature &amp; Date</div></div>' +
      '<div><div class="signature-line">Faculty Academic Advisor Signature &amp; Date</div></div>' +
      "</div>" +
      "</article>";
  }

  function triggerPrintPDF() {
    switchView("export");
    showToast("Opening print-to-PDF dialog for your advisor roadmap.", "success");
    window.setTimeout(function () {
      window.print();
    }, 150);
  }

  /* ------------------------------------------------------------------------
     19. COURSE DETAIL MODAL
     ------------------------------------------------------------------------ */

  function openCourseDetailModal(courseId) {
    const course = courseMap[courseId];
    if (!course) {
      return;
    }
    const modal = document.getElementById("course-modal");
    const status = getCourseStatus(courseId);
    const missing = getMissingPrerequisites(courseId);
    const prog = appState.progress[courseId] || computeCourseProgressObject(course, []);
    const isEnrolled = Boolean(appState.enrollments[courseId]);

    document.getElementById("course-modal-kicker").textContent =
      course.code + " · " + course.credits + " Credits · " + course.difficulty + " · Semester " + course.semester;
    document.getElementById("course-modal-title").textContent = course.title;

    const prereqItemsHTML =
      course.prerequisites.length > 0
        ? course.prerequisites
            .map(function (pid) {
              const pCourse = courseMap[pid];
              const pStatus = getCourseStatus(pid);
              return (
                '<div class="course-row-item">' +
                '<div><strong>' +
                escapeHTML(pid + (pCourse ? " — " + pCourse.title : "")) +
                "</strong></div>" +
                renderStatusTag(pStatus) +
                "</div>"
              );
            })
            .join("")
        : '<p style="font-size:0.875rem;color:var(--text-secondary);">No prerequisites required. Open for immediate enrollment.</p>';

    const modulesHTML = course.modules
      .map(function (mod) {
        const done = prog.completedModules.indexOf(mod.id) !== -1;
        return (
          '<label class="module-item' +
          (done ? " is-done" : "") +
          '">' +
          '<input type="checkbox" data-toggle-module="' +
          course.id +
          '" data-module-id="' +
          mod.id +
          '"' +
          (done ? " checked" : "") +
          (isEnrolled ? "" : " disabled") +
          " />" +
          '<span class="module-item-text">' +
          escapeHTML(mod.title) +
          "</span>" +
          '<span class="module-duration">' +
          mod.durationHours +
          "h</span>" +
          "</label>"
        );
      })
      .join("");

    document.getElementById("course-modal-body").innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">' +
      renderStatusTag(status) +
      (isEnrolled ? renderProgressRing(prog.percentage, 54, 5, false) : "") +
      "</div>" +
      '<p style="font-size:0.9375rem;color:var(--text-secondary);">' +
      escapeHTML(course.description) +
      "</p>" +
      '<div class="meta-line"><span><strong>Skills:</strong> ' +
      escapeHTML(course.skillTags.join(" · ")) +
      "</span></div>" +
      '<div class="meta-line"><span><strong>Career Pathways:</strong> ' +
      escapeHTML(course.careerTags.join(" · ")) +
      "</span></div>" +
      "<div>" +
      '<h3 style="font-size:0.9375rem;margin-bottom:8px;">Prerequisites</h3>' +
      prereqItemsHTML +
      "</div>" +
      "<div>" +
      '<h3 style="font-size:0.9375rem;margin-bottom:8px;">Learning Modules (' +
      course.modules.length +
      " Modules)" +
      (isEnrolled ? "" : " — Enroll to unlock module tracking") +
      "</h3>" +
      '<div class="module-list" style="border-top:none;padding-top:0;">' +
      modulesHTML +
      "</div>" +
      "</div>";

    const footerEl = document.getElementById("course-modal-footer");
    if (status === "unlocked") {
      footerEl.innerHTML =
        '<button type="button" class="btn btn-secondary" id="btn-modal-close-action">Close</button>' +
        '<button type="button" class="btn btn-primary" data-enroll-course="' +
        course.id +
        '">Enroll in ' +
        escapeHTML(course.code) +
        "</button>";
    } else if (isEnrolled) {
      footerEl.innerHTML =
        '<button type="button" class="btn btn-secondary" data-drop-course="' +
        course.id +
        '">Drop Course</button>' +
        '<button type="button" class="btn btn-primary" id="btn-modal-close-action">Done</button>';
    } else {
      footerEl.innerHTML =
        '<span style="font-size:0.8125rem;color:var(--status-danger);margin-right:auto;">Complete ' +
        escapeHTML(missing.join(", ")) +
        " first</span>" +
        '<button type="button" class="btn btn-secondary" id="btn-modal-close-action">Close</button>';
    }

    modal.dataset.activeCourseId = courseId;
    modal.hidden = false;
  }

  function closeCourseDetailModal() {
    const modal = document.getElementById("course-modal");
    modal.hidden = true;
    delete modal.dataset.activeCourseId;
  }

  /* ------------------------------------------------------------------------
     20. NAVIGATION, SHELL SYNC & GLOBAL EVENT DELEGATION
     ------------------------------------------------------------------------ */

  function recomputeRoadmapAndCycleBanner() {
    if (!appState.student) {
      return;
    }
    const activeCatalog = getActiveCatalogWithSimulation();
    appState.roadmapResult = generateRoadmapWithKahn(activeCatalog, appState.student);

    const banner = document.getElementById("cycle-alert-banner");
    const msg = document.getElementById("cycle-alert-message");
    if (appState.roadmapResult.hasCycle) {
      msg.textContent =
        "Cycle path: " +
        appState.roadmapResult.cyclePath.join(" → ") +
        ". Affected courses cannot be unlocked.";
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }

  function updateSidebarStudentSummary() {
    const s = appState.student;
    if (!s) {
      return;
    }
    const initials = s.name
      .trim()
      .split(/\s+/)
      .map(function (part) {
        return part[0] || "";
      })
      .join("")
      .toUpperCase()
      .slice(0, 2);

    document.getElementById("sidebar-avatar").textContent = initials || "ST";
    document.getElementById("sidebar-student-name").textContent = s.name;
    document.getElementById("sidebar-student-meta").textContent =
      "Sem " + s.semester + " · " + s.careerPathway.split(" ")[0];
  }

  function renderActiveView() {
    switch (appState.activeView) {
      case "overview":
        renderOverview();
        break;
      case "roadmap":
        renderRoadmap();
        break;
      case "catalog":
        renderCatalog();
        break;
      case "enrollments":
        renderEnrollments();
        break;
      case "progress":
        renderProgressTracker();
        break;
      case "estimator":
        renderStudyEstimator();
        break;
      case "peers":
        renderPeerGroups();
        break;
      case "graph":
        renderPrerequisiteGraph();
        break;
      case "profile":
        renderProfileView();
        break;
      case "export":
        renderExportView();
        break;
      default:
        renderOverview();
    }
  }

  function refreshDynamicViews() {
    recomputeRoadmapAndCycleBanner();
    updateSidebarStudentSummary();
    renderActiveView();

    const modal = document.getElementById("course-modal");
    if (!modal.hidden && modal.dataset.activeCourseId) {
      openCourseDetailModal(modal.dataset.activeCourseId);
    }
  }

  function switchView(viewName) {
    if (!VIEW_META[viewName]) {
      return;
    }
    appState.activeView = viewName;

    const sections = document.querySelectorAll(".view-section");
    sections.forEach(function (sec) {
      sec.hidden = sec.id !== "view-" + viewName;
    });

    const navBtns = document.querySelectorAll("#sidebar-nav .nav-item");
    navBtns.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    const meta = VIEW_META[viewName];
    document.getElementById("topbar-title").textContent = meta.title;
    const ctaBtn = document.getElementById("topbar-primary-action");
    ctaBtn.textContent = meta.ctaLabel;
    ctaBtn.dataset.ctaView = meta.ctaView || "";
    ctaBtn.dataset.ctaAction = meta.ctaAction || "";

    closeMobileSidebar();
    renderActiveView();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function openMobileSidebar() {
    document.getElementById("sidebar").classList.add("is-open");
    document.getElementById("sidebar-backdrop").hidden = false;
  }

  function closeMobileSidebar() {
    document.getElementById("sidebar").classList.remove("is-open");
    document.getElementById("sidebar-backdrop").hidden = true;
  }

  function showOnboardingOrDashboard() {
    const onboardingEl = document.getElementById("onboarding-view");
    const appShellEl = document.getElementById("app-shell");

    if (appState.student) {
      onboardingEl.hidden = true;
      appShellEl.hidden = false;
      recomputeRoadmapAndCycleBanner();
      updateSidebarStudentSummary();
      switchView(appState.activeView || "overview");
    } else {
      appShellEl.hidden = true;
      onboardingEl.hidden = false;
    }
  }

  /* ------------------------------------------------------------------------
     21. FORM VALIDATION, SAMPLE PROFILE & GROUP CREATION
     ------------------------------------------------------------------------ */

  function createSampleCSEStudent() {
    return {
      id: "student-" + Date.now(),
      name: "Aarav Sharma",
      branch: "Computer Science Engineering (CSE)",
      semester: 1,
      programmingExperience: "Complete beginner",
      knownLanguages: ["None"],
      careerPathway: "Full-Stack Web Development",
      weeklyStudyHours: 18,
    };
  }

  function fillOnboardingWithSample() {
    const sample = createSampleCSEStudent();
    document.getElementById("onboard-name").value = sample.name;
    document.getElementById("onboard-branch").value = sample.branch;
    document.getElementById("onboard-semester").value = String(sample.semester);
    document.getElementById("onboard-experience").value = sample.programmingExperience;
    document.getElementById("onboard-pathway").value = sample.careerPathway;
    document.getElementById("onboard-hours").value = String(sample.weeklyStudyHours);

    const checkboxes = document.querySelectorAll('#onboard-languages-group input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
      cb.checked = sample.knownLanguages.indexOf(cb.value) !== -1;
    });
    showToast("Sample first-year CSE student details populated.", "info");
  }

  function handleLanguageCheckboxExclusivity(groupContainer, changedInput) {
    const allInputs = groupContainer.querySelectorAll('input[type="checkbox"]');
    if (changedInput.value === "None" && changedInput.checked) {
      allInputs.forEach(function (cb) {
        if (cb.value !== "None") {
          cb.checked = false;
        }
      });
    } else if (changedInput.value !== "None" && changedInput.checked) {
      allInputs.forEach(function (cb) {
        if (cb.value === "None") {
          cb.checked = false;
        }
      });
    }
  }

  function handleOnboardingSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const name = form.name.value.trim();
    const branch = form.branch.value;
    const semester = Number(form.semester.value);
    const programmingExperience = form.programmingExperience.value;
    const careerPathway = form.careerPathway.value;
    const weeklyStudyHours = Number(form.weeklyStudyHours.value);

    const langNodes = form.querySelectorAll('input[name="knownLanguages"]:checked');
    const knownLanguages = Array.prototype.map.call(langNodes, function (n) {
      return n.value;
    });

    // Clear previous field errors
    ["name", "branch", "semester", "experience", "pathway", "languages", "hours"].forEach(function (k) {
      const el = document.getElementById("err-onboard-" + k);
      if (el) {
        el.textContent = "";
      }
    });

    let valid = true;
    if (!name) {
      document.getElementById("err-onboard-name").textContent = "Please enter your full name.";
      valid = false;
    }
    if (!branch) {
      document.getElementById("err-onboard-branch").textContent = "Please select your branch.";
      valid = false;
    }
    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
      document.getElementById("err-onboard-semester").textContent = "Select a semester (1–8).";
      valid = false;
    }
    if (!programmingExperience) {
      document.getElementById("err-onboard-experience").textContent = "Select programming experience.";
      valid = false;
    }
    if (!careerPathway) {
      document.getElementById("err-onboard-pathway").textContent = "Select target career pathway.";
      valid = false;
    }
    if (knownLanguages.length === 0) {
      document.getElementById("err-onboard-languages").textContent = "Select at least one option (or None).";
      valid = false;
    }
    if (!Number.isFinite(weeklyStudyHours) || weeklyStudyHours < 4 || weeklyStudyHours > 60) {
      document.getElementById("err-onboard-hours").textContent = "Enter between 4 and 60 hours/week.";
      valid = false;
    }

    if (!valid) {
      showToast("Please complete all required diagnostic intake fields.", "error");
      return;
    }

    appState.student = {
      id: "student-" + Date.now(),
      name: name,
      branch: branch,
      semester: semester,
      programmingExperience: programmingExperience,
      knownLanguages: knownLanguages,
      careerPathway: careerPathway,
      weeklyStudyHours: weeklyStudyHours,
    };

    saveProfileToStorage();
    appState.activeView = "overview";
    showOnboardingOrDashboard();
    showToast("Diagnostic profile saved and personalized roadmap generated.", "success");
  }

  function handleProfileEditSubmit(form) {
    const name = form.name.value.trim();
    const branch = form.branch.value;
    const semester = Number(form.semester.value);
    const programmingExperience = form.programmingExperience.value;
    const careerPathway = form.careerPathway.value;
    const weeklyStudyHours = Number(form.weeklyStudyHours.value);

    const langNodes = form.querySelectorAll('input[name="knownLanguages"]:checked');
    const knownLanguages = Array.prototype.map.call(langNodes, function (n) {
      return n.value;
    });

    if (!name || knownLanguages.length === 0 || !Number.isFinite(weeklyStudyHours) || weeklyStudyHours < 4) {
      showToast("Please provide valid profile name, languages, and weekly hours (4–60).", "error");
      return;
    }

    appState.student = Object.assign({}, appState.student, {
      name: name,
      branch: branch,
      semester: semester,
      programmingExperience: programmingExperience,
      knownLanguages: knownLanguages,
      careerPathway: careerPathway,
      weeklyStudyHours: weeklyStudyHours,
    });

    saveProfileToStorage();
    refreshDynamicViews();
    showToast("Student profile updated and roadmap recomputed.", "success");
  }

  function openCreateGroupModal() {
    const modal = document.getElementById("group-modal");
    const select = document.getElementById("group-course");
    select.innerHTML = COURSE_CATALOG.slice(0, 20)
      .map(function (c) {
        return '<option value="' + c.code + '">' + escapeHTML(c.code + " — " + c.title) + "</option>";
      })
      .join("");
    modal.hidden = false;
  }

  function closeCreateGroupModal() {
    document.getElementById("group-modal").hidden = true;
    document.getElementById("create-group-form").reset();
  }

  /* ------------------------------------------------------------------------
     22. EVENT LISTENERS & INITIALIZATION
     ------------------------------------------------------------------------ */

  function bindEvents() {
    // Onboarding form
    document.getElementById("onboarding-form").addEventListener("submit", handleOnboardingSubmit);
    document.getElementById("btn-onboarding-demo").addEventListener("click", fillOnboardingWithSample);
    document.getElementById("onboard-languages-group").addEventListener("change", function (e) {
      if (e.target && e.target.type === "checkbox") {
        handleLanguageCheckboxExclusivity(e.currentTarget, e.target);
      }
    });

    // Sidebar & topbar navigation
    document.getElementById("sidebar-nav").addEventListener("click", function (e) {
      const btn = e.target.closest(".nav-item");
      if (btn && btn.dataset.view) {
        switchView(btn.dataset.view);
      }
    });

    document.getElementById("btn-sidebar-profile").addEventListener("click", function () {
      switchView("profile");
    });

    document.getElementById("btn-open-sidebar").addEventListener("click", openMobileSidebar);
    document.getElementById("btn-close-sidebar").addEventListener("click", closeMobileSidebar);
    document.getElementById("sidebar-backdrop").addEventListener("click", closeMobileSidebar);

    document.getElementById("topbar-primary-action").addEventListener("click", function (e) {
      const btn = e.currentTarget;
      if (btn.dataset.ctaAction === "print-pdf") {
        triggerPrintPDF();
      } else if (btn.dataset.ctaAction === "open-group-modal") {
        openCreateGroupModal();
      } else if (btn.dataset.ctaView) {
        switchView(btn.dataset.ctaView);
      }
    });

    document.getElementById("btn-restore-dag").addEventListener("click", function () {
      appState.simulatedCycleEdges = null;
      refreshDynamicViews();
      showToast("Valid acyclic curriculum restored.", "success");
    });

    // Course Detail Modal & Confirm Modal & Group Modal
    document.getElementById("btn-close-course-modal").addEventListener("click", closeCourseDetailModal);
    document.getElementById("course-modal").addEventListener("click", function (e) {
      if (e.target === e.currentTarget || e.target.id === "btn-modal-close-action") {
        closeCourseDetailModal();
      }
    });

    document.getElementById("btn-close-confirm-modal").addEventListener("click", closeConfirmDialog);
    document.getElementById("btn-confirm-cancel").addEventListener("click", closeConfirmDialog);
    document.getElementById("btn-confirm-accept").addEventListener("click", function () {
      if (typeof pendingConfirmCallback === "function") {
        pendingConfirmCallback();
      }
      closeConfirmDialog();
    });

    document.getElementById("btn-close-group-modal").addEventListener("click", closeCreateGroupModal);
    document.getElementById("btn-cancel-group").addEventListener("click", closeCreateGroupModal);
    document.getElementById("create-group-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const form = e.target;
      const groupName = form.groupName.value.trim();
      const focusCourse = form.focusCourse.value;
      const schedule = form.schedule.value.trim();
      if (!groupName || !focusCourse || !schedule) {
        showToast("Please complete all study group fields.", "error");
        return;
      }
      const newGroup = {
        id: "grp-" + Date.now(),
        name: groupName,
        focusCourse: focusCourse,
        schedule: schedule,
        members: [],
        pathway: appState.student.careerPathway,
      };
      appState.peerGroups.unshift(newGroup);
      appState.joinedGroupIds.push(newGroup.id);
      savePeerGroupsToStorage();
      closeCreateGroupModal();
      renderPeerGroups();
      showToast("Created and joined sample study group: " + groupName, "success");
    });

    // Delegated click & change handlers inside main workspace + course modal
    document.addEventListener("click", function (e) {
      const target = e.target;
      if (!(target instanceof Element)) {
        return;
      }

      const navJump = target.closest("[data-nav-jump]");
      if (navJump) {
        switchView(navJump.getAttribute("data-nav-jump"));
        return;
      }

      const openCourseBtn = target.closest("[data-open-course]");
      if (openCourseBtn) {
        openCourseDetailModal(openCourseBtn.getAttribute("data-open-course"));
        return;
      }

      const enrollBtn = target.closest("[data-enroll-course]");
      if (enrollBtn) {
        enrollInCourse(enrollBtn.getAttribute("data-enroll-course"));
        return;
      }

      const lockedBtn = target.closest("[data-locked-attempt]");
      if (lockedBtn) {
        const cid = lockedBtn.getAttribute("data-locked-attempt");
        const missing = getMissingPrerequisites(cid);
        showToast(
          "Locked: Complete prerequisites (" + missing.join(", ") + ") before enrolling in " + cid + ".",
          "error"
        );
        return;
      }

      const dropBtn = target.closest("[data-drop-course]");
      if (dropBtn) {
        const cid = dropBtn.getAttribute("data-drop-course");
        openConfirmDialog(
          "Drop Course Enrollment?",
          "Dropping " + cid + " will remove your module completion progress for this course.",
          function () {
            dropCourseEnrollment(cid);
            closeCourseDetailModal();
          }
        );
        return;
      }

      const toggleSemBtn = target.closest("[data-toggle-semester]");
      if (toggleSemBtn) {
        const semNum = toggleSemBtn.getAttribute("data-toggle-semester");
        const card = document.querySelector('[data-semester-card="' + semNum + '"]');
        if (card) {
          const collapsed = card.classList.toggle("is-collapsed");
          toggleSemBtn.setAttribute("aria-expanded", String(!collapsed));
          appState.preferences.collapsedSemesters[semNum] = collapsed;
          savePreferencesToStorage();
        }
        return;
      }

      const graphNode = target.closest("[data-graph-node]");
      if (graphNode) {
        appState.graphState.selectedCourseId = graphNode.getAttribute("data-graph-node");
        renderPrerequisiteGraph();
        return;
      }

      const toggleGroupBtn = target.closest("[data-toggle-group]");
      if (toggleGroupBtn) {
        const gid = toggleGroupBtn.getAttribute("data-toggle-group");
        const idx = appState.joinedGroupIds.indexOf(gid);
        if (idx === -1) {
          appState.joinedGroupIds.push(gid);
          showToast("Joined sample study group.", "success");
        } else {
          appState.joinedGroupIds.splice(idx, 1);
          showToast("Left sample study group.", "info");
        }
        savePeerGroupsToStorage();
        renderPeerGroups();
        return;
      }

      if (target.id === "btn-scope-4sem") {
        appState.preferences.roadmapScope = "four-sem";
        savePreferencesToStorage();
        renderRoadmap();
      } else if (target.id === "btn-scope-full") {
        appState.preferences.roadmapScope = "full";
        savePreferencesToStorage();
        renderRoadmap();
      } else if (target.id === "btn-simulate-cycle" || target.id === "btn-roadmap-restore-dag") {
        if (appState.simulatedCycleEdges || target.id === "btn-roadmap-restore-dag") {
          appState.simulatedCycleEdges = null;
          refreshDynamicViews();
          showToast("Valid acyclic curriculum restored.", "success");
        } else {
          // Inject temporary cycle CS101 -> CS102 -> CS202 -> CS101 to test Kahn's detector
          appState.simulatedCycleEdges = {
            CS101: ["CS202"],
          };
          refreshDynamicViews();
          showToast(
            "Circular prerequisite dependency detected: " + appState.roadmapResult.cyclePath.join(" → "),
            "error"
          );
        }
      } else if (target.id === "btn-reset-catalog-filters" || target.id === "btn-empty-reset-filters") {
        appState.catalogFilters = {
          query: "",
          credits: "all",
          difficulty: "all",
          branch: "all",
          pathway: "all",
          semester: "all",
          status: "all",
        };
        renderCatalog();
      } else if (target.id === "btn-open-create-group") {
        openCreateGroupModal();
      } else if (target.id === "btn-graph-recommended") {
        appState.graphState.pathwayFilter = "recommended";
        renderPrerequisiteGraph();
      } else if (target.id === "btn-graph-all") {
        appState.graphState.pathwayFilter = "all";
        renderPrerequisiteGraph();
      } else if (target.id === "btn-graph-zoom-in") {
        appState.graphState.zoom = Math.min(1.4, Number((appState.graphState.zoom + 0.15).toFixed(2)));
        renderPrerequisiteGraph();
      } else if (target.id === "btn-graph-zoom-out") {
        appState.graphState.zoom = Math.max(0.65, Number((appState.graphState.zoom - 0.15).toFixed(2)));
        renderPrerequisiteGraph();
      } else if (target.id === "btn-export-pdf") {
        triggerPrintPDF();
      } else if (target.id === "btn-load-demo-profile") {
        appState.student = createSampleCSEStudent();
        saveProfileToStorage();
        refreshDynamicViews();
        showToast("Loaded sample first-year CSE student profile.", "success");
      } else if (target.id === "btn-reset-all-data") {
        openConfirmDialog(
          "Reset All Student Data?",
          "This will clear your profile, enrollments, and module progress from browser storage and return to onboarding.",
          function () {
            Object.keys(STORAGE_KEYS).forEach(function (k) {
              localStorage.removeItem(STORAGE_KEYS[k]);
            });
            appState.student = null;
            appState.enrollments = {};
            appState.progress = {};
            appState.joinedGroupIds = [];
            appState.peerGroups = DEFAULT_PEER_GROUPS.slice();
            appState.simulatedCycleEdges = null;
            showOnboardingOrDashboard();
            showToast("All stored data cleared.", "info");
          }
        );
      }
    });

    // Delegated module checkbox & catalog filter changes
    document.addEventListener("change", function (e) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.dataset && target.dataset.toggleModule) {
        toggleModuleCompletion(target.dataset.toggleModule, target.dataset.moduleId);
        return;
      }

      if (target.closest && target.closest("#prof-languages-group") && target.type === "checkbox") {
        handleLanguageCheckboxExclusivity(document.getElementById("prof-languages-group"), target);
        return;
      }

      if (target.id === "filter-credits") {
        appState.catalogFilters.credits = target.value;
        renderCatalogResultsOnly();
      } else if (target.id === "filter-difficulty") {
        appState.catalogFilters.difficulty = target.value;
        renderCatalogResultsOnly();
      } else if (target.id === "filter-branch") {
        appState.catalogFilters.branch = target.value;
        renderCatalogResultsOnly();
      } else if (target.id === "filter-pathway") {
        appState.catalogFilters.pathway = target.value;
        renderCatalogResultsOnly();
      } else if (target.id === "filter-semester") {
        appState.catalogFilters.semester = target.value;
        renderCatalogResultsOnly();
      } else if (target.id === "filter-status") {
        appState.catalogFilters.status = target.value;
        renderCatalogResultsOnly();
      }
    });

    // Debounced catalog search (200ms)
    document.addEventListener("input", function (e) {
      const target = e.target;
      if (target && target.id === "catalog-search-input") {
        const val = target.value;
        window.clearTimeout(searchDebounceTimer);
        searchDebounceTimer = window.setTimeout(function () {
          appState.catalogFilters.query = val;
          renderCatalogResultsOnly();
        }, 200);
      }
    });

    // Profile edit form submission
    document.addEventListener("submit", function (e) {
      if (e.target && e.target.id === "profile-edit-form") {
        e.preventDefault();
        handleProfileEditSubmit(e.target);
      }
    });

    // Keyboard Escape closes open modals/drawer
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeCourseDetailModal();
        closeConfirmDialog();
        closeCreateGroupModal();
        closeMobileSidebar();
      }
    });
  }

  function init() {
    COURSE_CATALOG.forEach(function (course) {
      courseMap[course.id] = course;
    });

    loadAllStateFromStorage();
    bindEvents();
    showOnboardingOrDashboard();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
