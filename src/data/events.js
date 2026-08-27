const events = [
  /* ───── TECHNICAL EVENTS ───── */
  {
    id: 'tech-01',
    number: '01',
    name: 'PPT PRESENTATION',
    subtitle: 'PowerPoint Presentation',
    category: 'technical',
    teamSize: 'Max of 3 members',
    minMembers: 1,
    maxMembers: 3,
    fee: '₹100 per head',
    feePerHead: 100,
    feeType: 'per_head',
    isTeam: true,
    tag: 'Technical Presentation',
    venue: 'Seminar Hall & Audio Visual Hall',
    timing: '10:00 AM – 1:00 PM',
    coordinators: [
      { name: 'Syed Subhan', phone: '9876543210' },
      { name: 'Farhan Ali', phone: '9840123456' }
    ],
    description: 'Present your groundbreaking ideas with clarity, innovation, and impactful slide decks before an expert jury.',
    highlights: ['5 mins Presentation', '2 mins Q&A', '< 7 Slides Total'],
    rules: [
      'Teams are highly recommended to submit/send their PPT before the event starts.',
      'Each team will have 5 minutes for presentation.',
      '2 minutes will be allotted for Q&A.',
      'The presentation should contain fewer than 7 slides.',
      'Maximum of 3 members per team.',
      'Registration fee: ₹100 per participant / head.',
      'Topics must be relevant to emerging technologies, AI, computer science, or engineering innovations.',
      'The jury’s decision regarding evaluation and scores will be final.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Slide Deck Presentation',
        duration: '5 Minutes',
        desc: 'Present your core problem statement, architecture, methodology, and outcome with fewer than 7 slides.'
      },
      {
        round: 'Round 2',
        title: 'Jury Q&A & Evaluation',
        duration: '2 Minutes',
        desc: 'Defend your technical concepts, answer jury inquiries, and showcase domain mastery.'
      }
    ]
  },
  {
    id: 'tech-02',
    number: '02',
    name: 'CODING & DEBUGGING',
    subtitle: 'Code Craft & Bug Hunter',
    category: 'technical',
    teamSize: 'Individual',
    minMembers: 1,
    maxMembers: 1,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: false,
    tag: 'Competitive Coding',
    venue: 'Lab 1 & 2',
    timing: '10:40 AM – 12:40 PM',
    coordinators: [
      { name: 'Mohammed Raiyan. A', phone: '9585790805' },
      { name: 'Abdul Hameed', phone: '9176543210' }
    ],
    description: 'Speed rounds in logic and code. Put your programming logic, analytical problem solving, and debugging precision to the ultimate test.',
    highlights: ['No Built-in Libraries', 'Round 1: Written Test', 'Round 2: Coding & Debugging'],
    rules: [
      'Built-in libraries are not allowed.',
      'Round 1 is a written test consisting of technical questions and code analysis.',
      'Round 2 consists of hands-on coding and debugging questions on a provided system.',
      'Allowed languages for the coding/debugging round are C, C++, Java, and Python.',
      'This is an individual event; any form of malpractice leads to immediate disqualification.',
      'Registration fee: ₹50 per head.',
      'The organizers’ and judges’ decisions on code execution and results are final.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Technical Written Test',
        duration: '25 Minutes',
        desc: 'Written test on core data structures, algorithms, and logic output prediction.'
      },
      {
        round: 'Round 2',
        title: 'Coding & Debugging Challenge',
        duration: '45 Minutes',
        desc: 'Solve algorithmic challenges from scratch without built-in libraries and fix tricky code bugs.'
      }
    ]
  },
  {
    id: 'tech-03',
    number: '03',
    name: 'POSTER DESIGN (CHART)',
    subtitle: 'Physical Chart & Visual Art',
    category: 'technical',
    teamSize: 'Team (Max 3 members)',
    minMembers: 1,
    maxMembers: 3,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: true,
    tag: 'Creative Chart Design',
    venue: 'Drawing Hall / CSE Block',
    timing: '11:00 AM – 1:00 PM',
    coordinators: [
      { name: 'Irfan Khan', phone: '9789012345' },
      { name: 'Sameer Basha', phone: '9654321098' }
    ],
    description: 'Express complex scientific and technical concepts on canvas charts with bold visuals, clear diagrams, and compelling storytelling.',
    highlights: ['On-The-Spot Topic', '1 Hour Designing', '5 Mins Presentation'],
    rules: [
      'Topics will be provided on the spot.',
      'Participants should bring the required drawing and stationery materials.',
      '5 minutes will be given for the explanation and presentation.',
      '1 hour will be provided for designing.',
      'The poster must be designed strictly within the given theme.',
      'Team participation: 1 to 3 members per team.',
      'Registration fee: ₹50 per head.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Chart Designing',
        duration: '1 Hour',
        desc: 'Create and sketch your visual technical diagram based on the on-the-spot announced theme.'
      },
      {
        round: 'Round 2',
        title: 'Presentation & Explanation',
        duration: '5 Minutes',
        desc: 'Present the key concepts, technical relevance, and visual flow to the judging panel.'
      }
    ]
  },
  {
    id: 'tech-04',
    number: '04',
    name: 'TECH QUIZ (ONLINE)',
    subtitle: 'Brain Bytes & Trivia Arena',
    category: 'technical',
    teamSize: 'Individual',
    minMembers: 1,
    maxMembers: 1,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: false,
    tag: 'Online Trivia Battle',
    venue: 'IT Lab 3',
    timing: '11:30 AM – 12:45 PM',
    coordinators: [
      { name: 'Danish Ahmed', phone: '9845012345' },
      { name: 'Zaheer Abbas', phone: '9786543210' }
    ],
    description: 'Battle through 3 high-intensity rounds of digital technical trivia, computing history, hardware, algorithms, and AI.',
    highlights: ['Screen Changing Restricted', '3 Total Rounds', '15 Mins / Round'],
    rules: [
      'Screen sharing or changing screens/tabs is strictly restricted.',
      'There will be 3 rounds.',
      'Total time: 45 minutes.',
      '15 minutes per round.',
      'Individual participation only.',
      'Registration fee: ₹50 per head.',
      'Switching browser tabs or using external search will trigger automatic disqualification.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Prelims: Fundamental CS & IT',
        duration: '15 Minutes',
        desc: 'Core computer science, basic logic, and programming concepts.'
      },
      {
        round: 'Round 2',
        title: 'Intermediate: Advanced Tech & OS',
        duration: '15 Minutes',
        desc: 'Operating systems, cloud, AI trends, and architecture questions.'
      },
      {
        round: 'Round 3',
        title: 'Grand Finale: Speed Decider',
        duration: '15 Minutes',
        desc: 'High-speed rapid-fire decider round for top finalists.'
      }
    ]
  },
  {
    id: 'tech-05',
    number: '05',
    name: 'WEB / PROMPT',
    subtitle: 'Web Craft & AI Prompt Engineering',
    category: 'technical',
    teamSize: 'Individual / Team of 2',
    minMembers: 1,
    maxMembers: 2,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: true,
    tag: 'Web & Generative AI',
    venue: 'Web Tech Lab',
    timing: '1:30 PM – 3:30 PM',
    coordinators: [
      { name: 'Salman Farsi', phone: '9894012345' },
      { name: 'Wasim Akram', phone: '9788123456' }
    ],
    description: 'Build responsive web interfaces and engineer precision prompts to construct functional, aesthetic digital experiences.',
    highlights: ['Round 1: Landing Page', 'Round 2: Overall Website', 'Systems Provided'],
    rules: [
      'Round 1: Landing page.',
      'Round 2: Overall website.',
      'Systems will be provided for the competition.',
      'Participate individually or in a team of 2 members.',
      'Registration fee: ₹50 per head.',
      'Evaluation is based on aesthetics, responsiveness, prompt efficiency, and code cleanliness.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Landing Page Creation',
        duration: '40 Minutes',
        desc: 'Design and build a responsive landing page for the assigned domain theme.'
      },
      {
        round: 'Round 2',
        title: 'Overall Website Expansion',
        duration: '50 Minutes',
        desc: 'Expand into a full multi-section website with interactive components.'
      }
    ]
  },
  {
    id: 'tech-06',
    number: '06',
    name: 'POSTER DESIGN – UI/UX',
    subtitle: 'Digital UI Prototyping & Layouts',
    category: 'technical',
    teamSize: 'Individual',
    minMembers: 1,
    maxMembers: 1,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: false,
    tag: 'UI/UX Product Design',
    venue: 'Multimedia Lab',
    timing: '1:45 PM – 3:45 PM',
    coordinators: [
      { name: 'Nawaz Sharif', phone: '9870123456' },
      { name: 'Adnan Sami', phone: '9765432109' }
    ],
    description: 'Craft intuitive, aesthetic digital user interfaces, interaction flows, and high-fidelity prototype layouts.',
    highlights: ['Tools: Figma & Canva', 'AI Usage Strictly Restricted', 'Round 1: Login | Round 2: Dashboard'],
    rules: [
      'Topics will be given on the spot.',
      'Tools allowed: Figma, Canva.',
      'AI usage is strictly restricted.',
      'There will be 2 rounds: Round 1: Login page, Round 2: Dashboard.',
      'Individual participation only.',
      'Registration fee: ₹50 per head.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Login Page Design',
        duration: '35 Minutes',
        desc: 'Design a sleek, accessible, modern login/sign-up screen fitting the on-the-spot product brief.'
      },
      {
        round: 'Round 2',
        title: 'Dashboard Design',
        duration: '45 Minutes',
        desc: 'Create an intuitive, feature-rich web/mobile dashboard with charts and navigation.'
      }
    ]
  },

  /* ───── NON-TECHNICAL EVENTS ───── */
  {
    id: 'nontech-01',
    number: '01',
    name: 'E-SPORTS',
    subtitle: 'Battle of Champion',
    category: 'non-technical',
    teamSize: 'Only Squad Match (4 Members)',
    minMembers: 4,
    maxMembers: 4,
    fee: '₹200 per squad',
    feePerHead: 50,
    feeType: 'per_squad',
    isTeam: true,
    tag: 'Battle Royale Esports',
    venue: 'Auditorium Hall',
    timing: '10:30 AM – 2:30 PM',
    coordinators: [
      { name: 'Fayaz Ahmed', phone: '9840987654' },
      { name: 'Haris Khan', phone: '9789123400' }
    ],
    description: 'Drop into the battlegrounds, coordinate tactical maneuvers with your 4-player squad, and claim the championship trophy.',
    highlights: ['Emotes Strictly Restricted', '4-Player Squad Only', '₹200 / Squad Flat'],
    rules: [
      'Emotes are strictly restricted.',
      'Only 4-player squad match allowed.',
      'Registration fee: ₹200 per squad flat.',
      'Mobile devices only; emulators, triggers, or third-party software are strictly prohibited.',
      'All players must have the game updated to the latest version before reporting.',
      'Unsportsmanlike conduct or toxic behavior will result in instant disqualification.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Qualifiers Lobby',
        duration: 'Custom Match',
        desc: 'Group stage custom room lobbies with top-placing squads advancing.'
      },
      {
        round: 'Round 2',
        title: 'Grand Finals',
        duration: 'Custom Match',
        desc: 'High-stakes championship lobby to determine podium winners by kills and placement.'
      }
    ]
  },
  {
    id: 'nontech-02',
    number: '02',
    name: 'REELS & PHOTOGRAPHY',
    subtitle: 'Cinematic Frames & Campus Stories',
    category: 'non-technical',
    teamSize: 'Individual',
    minMembers: 1,
    maxMembers: 1,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: false,
    tag: 'Visual Media',
    venue: 'Campus-Wide',
    timing: '10:00 AM – 2:30 PM',
    coordinators: [
      { name: 'Tariq Anwar', phone: '9841234567' },
      { name: 'Bilal Khan', phone: '9786123456' }
    ],
    description: 'Capture the pulse, aesthetics, and memorable moments of ELOQUENCE 26 through cinematic lens and short-form video reels.',
    highlights: ['Live Campus Footage', '30-60 Seconds Reel', 'Original Audio/Edit'],
    rules: [
      'Individual participation only.',
      'Registration fee: ₹50 per head.',
      'Submissions must be original footage captured on campus during the fest day.',
      'Reels must be between 30 to 60 seconds with appropriate background audio and editing.',
      'DSLR, mirrorless cameras, and smartphones are all permitted.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Campus Shooting & Capture',
        duration: 'Fest Hours',
        desc: 'Capture the vibrant symposium atmosphere, events, and crowds.'
      },
      {
        round: 'Round 2',
        title: 'Editing & Submission',
        duration: 'Before 2:30 PM',
        desc: 'Submit your rendered MP4 reel to the event coordinators for jury assessment.'
      }
    ]
  },
  {
    id: 'nontech-03',
    number: '03',
    name: 'CONNECTION',
    subtitle: 'Decode Visual Links & Associations',
    category: 'non-technical',
    teamSize: 'Max 3 members',
    minMembers: 1,
    maxMembers: 3,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: true,
    tag: 'Mind & Logic Game',
    venue: 'Seminar Hall B',
    timing: '11:00 AM – 1:00 PM',
    coordinators: [
      { name: 'Zeeshan Ali', phone: '9840345678' },
      { name: 'Faizan Malik', phone: '9789456123' }
    ],
    description: 'Decode cryptic picture clues, bridge seemingly unrelated visual hints, and identify movie titles, logos, and idioms.',
    highlights: ['Visual Clues', 'Buzzer Rounds', 'Team Strategy'],
    rules: [
      'Team event (Max 3 members per team).',
      'Registration fee: ₹50 per head.',
      'Rounds include pop culture, movie connections, technical logos, and famous proverbs.',
      'Fastest correct buzz wins maximum points; negative points for incorrect answers during buzzers.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Preliminary Visual Connect',
        duration: '20 Minutes',
        desc: 'Written clue sheet connecting 4 images to a single keyword.'
      },
      {
        round: 'Round 2',
        title: 'Buzzer Showdown',
        duration: '30 Minutes',
        desc: 'On-stage rapid buzzer round with incremental clue reveals.'
      }
    ]
  },
  {
    id: 'nontech-04',
    number: '04',
    name: 'TREASURE HUNT',
    subtitle: 'Quest of The Campus Vault',
    category: 'non-technical',
    teamSize: 'Max 4 members',
    minMembers: 1,
    maxMembers: 4,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: true,
    tag: 'Campus Adventure',
    venue: 'Main Ground & Campus Arena',
    timing: '1:30 PM – 3:30 PM',
    coordinators: [
      { name: 'Shahid Afridi', phone: '9840678901' },
      { name: 'Imran Basha', phone: '9789789012' }
    ],
    description: 'Decode mysterious riddles, navigate hidden clues across college landmarks, and race against time to unearth the treasure.',
    highlights: ['Campus-Wide Trail', 'Timed Checkpoints', 'Grand Mystery Prize'],
    rules: [
      'Team event (Max 4 members per team).',
      'Registration fee: ₹50 per head.',
      'Campus-wide timed trail with sequentially unlocked clue checkpoints.',
      'Teams must not disrupt other ongoing events or enter restricted zones.',
      'First team to locate and return the final vault token wins.'
    ],
    rounds: [
      {
        round: 'Stage 1',
        title: 'Riddle Decryption',
        duration: 'Checkpoint Based',
        desc: 'Solve the initial riddle at the main arena to receive the first coordinate clue.'
      },
      {
        round: 'Stage 2',
        title: 'Checkpoint Run & Vault Unlock',
        duration: 'Sprint',
        desc: 'Collect all physical checkpoint tokens across campus to reach the final prize destination.'
      }
    ]
  },
  {
    id: 'nontech-05',
    number: '05',
    name: 'CHESS',
    subtitle: 'Grandmaster Tactics & Speed Battle',
    category: 'non-technical',
    teamSize: 'Individual only',
    minMembers: 1,
    maxMembers: 1,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: false,
    tag: 'Board Strategy',
    venue: 'Indoor Sports Hall',
    timing: '10:30 AM – 1:30 PM',
    coordinators: [
      { name: 'Shoaib Akhtar', phone: '9840234567' },
      { name: 'Mujahid Khan', phone: '9789123890' }
    ],
    description: 'Outthink, outmaneuver, and deliver the checkmate on the 64-square battlefield under rapid blitz time controls.',
    highlights: ['Rapid Time Control', 'FIDE Standard Rules', 'Knockout Brackets'],
    rules: [
      'Individual participation only.',
      'Registration fee: ₹50 per head.',
      'Time control: 10 minutes + 2 seconds increment per move.',
      'Standard FIDE tournament and touch-move rules apply.',
      'Knockout tournament bracket; winner of each board advances.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Knockout Qualifiers',
        duration: '10 min/game',
        desc: 'Direct elimination bracket matches.'
      },
      {
        round: 'Finals',
        title: 'Championship Match',
        duration: '15 min/game',
        desc: 'Top players compete for 1st, 2nd, and 3rd place podium spots.'
      }
    ]
  },
  {
    id: 'nontech-06',
    number: '06',
    name: 'MEHANDI',
    subtitle: 'Henna Art & Aesthetic Elegance',
    category: 'non-technical',
    teamSize: 'Individual only',
    minMembers: 1,
    maxMembers: 1,
    fee: '₹50 per head',
    feePerHead: 50,
    feeType: 'per_head',
    isTeam: false,
    tag: 'Traditional Art',
    venue: 'CSE Seminar Room',
    timing: '11:00 AM – 12:30 PM',
    coordinators: [
      { name: 'Ayesha Siddiqua', phone: '9840901234' },
      { name: 'Tasneem Kausar', phone: '9789014567' }
    ],
    description: 'Showcase fine artistic precision and cultural aesthetics with intricate, breathtaking traditional and contemporary henna designs.',
    highlights: ['1 Hour Duration', 'Traditional & Arabic Patterns', 'On-Site Application'],
    rules: [
      'Individual participation only.',
      'Registration fee: ₹50 per head.',
      'Time duration: 1 hour maximum.',
      'Participants must bring their own standard henna / mehandi cones and accompany their own hand model.',
      'Judged on neatness, intricacy, symmetry, design originality, and presentation.'
    ],
    rounds: [
      {
        round: 'Round 1',
        title: 'Henna Application Session',
        duration: '1 Hour',
        desc: 'Complete full palm and wrist design on one hand within the allotted hour.'
      },
      {
        round: 'Round 2',
        title: 'Jury Review & Scoring',
        duration: '15 Minutes',
        desc: 'Jury inspection of line precision, shading, floral/geometric motifs, and cleanliness.'
      }
    ]
  }
];

export default events;
