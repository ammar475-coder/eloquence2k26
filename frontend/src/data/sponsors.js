/* ─────────────────────────────────────────────────────────────
   SAMPLE PATRON / SPONSOR DATA
   Replace these placeholder entries with your real sponsors.
   Fields:
     id          - unique string
     name        - business/sponsor name shown on the card
     tag         - short category label (e.g. "TECH PARTNER")
     initials    - 2-3 letters used as the placeholder logo mark
     description - short blurb shown on the back of the card
     website     - URL the "LOCATION" button opens
   ───────────────────────────────────────────────────────────── */

const sponsors = {
  elite: [
    {
      id: 'elite-01',
      name: 'APEX DYNAMICS',
      tag: 'ELITE',
      initials: 'AD',
      description: 'A product engineering firm backing next-gen student innovation across South India.',
      website: 'https://example.com/apex-dynamics',
    },
    {
      id: 'elite-02',
      name: 'NOVA SYSTEMS',
      tag: 'ELITE',
      initials: 'NS',
      description: 'Cloud infrastructure partner providing compute credits and mentorship to every team.',
      website: 'https://example.com/nova-systems',
    },
    {
      id: 'elite-03',
      name: 'ORION LABS',
      tag: 'ELITE',
      initials: 'OL',
      description: 'R&D lab focused on AI and robotics, sponsoring the flagship hackathon track.',
      website: 'https://example.com/orion-labs',
    },
    {
      id: 'elite-04',
      name: 'VERTEX CAPITAL',
      tag: 'ELITE',
      initials: 'VC',
      description: 'Early-stage venture fund supporting campus founders and student startups.',
      website: 'https://example.com/vertex-capital',
    },
  ],
  premium: [
    {
      id: 'premium-01',
      name: 'PULSE ELECTRONICS',
      tag: 'PREMIUM',
      initials: 'PE',
      description: 'Consumer electronics brand fueling the gadget zone and tech expo.',
      website: 'https://example.com/pulse-electronics',
    },
    {
      id: 'premium-02',
      name: 'STRATUS CLOUD',
      tag: 'PREMIUM',
      initials: 'SC',
      description: 'Cloud hosting partner keeping every registration and live stream online.',
      website: 'https://example.com/stratus-cloud',
    },
    {
      id: 'premium-03',
      name: 'IGNITE FOODS',
      tag: 'PREMIUM',
      initials: 'IF',
      description: 'Campus catering partner serving the food court all three days.',
      website: 'https://example.com/ignite-foods',
    },
    {
      id: 'premium-04',
      name: 'BYTEWORKS',
      tag: 'PREMIUM',
      initials: 'BW',
      description: 'Software consultancy running the coding and debugging arenas.',
      website: 'https://example.com/byteworks',
    },
    {
      id: 'premium-05',
      name: 'LUMEN MEDIA',
      tag: 'PREMIUM',
      initials: 'LM',
      description: 'Broadcast and media partner covering the event across social platforms.',
      website: 'https://example.com/lumen-media',
    },
  ],
  standard: [
    {
      id: 'standard-01',
      name: 'CRAFT PRINTS',
      tag: 'STANDARD',
      initials: 'CP',
      description: 'Local print shop behind the banners, badges and merchandise.',
      website: 'https://example.com/craft-prints',
    },
    {
      id: 'standard-02',
      name: 'ZENTRA FITNESS',
      tag: 'STANDARD',
      initials: 'ZF',
      description: 'Campus gym partner supporting the sports and e-sports side events.',
      website: 'https://example.com/zentra-fitness',
    },
    {
      id: 'standard-03',
      name: 'BREWHOUSE CAFE',
      tag: 'STANDARD',
      initials: 'BC',
      description: 'Coffee and snacks partner keeping participants fueled between events.',
      website: 'https://example.com/brewhouse-cafe',
    },
    {
      id: 'standard-04',
      name: 'SWIFT TRAVELS',
      tag: 'STANDARD',
      initials: 'ST',
      description: 'Local travel operator arranging pickups for outstation teams.',
      website: 'https://example.com/swift-travels',
    },
    {
      id: 'standard-05',
      name: 'GRIDLINE STUDIOS',
      tag: 'STANDARD',
      initials: 'GS',
      description: 'Design studio that helped shape this year’s event branding.',
      website: 'https://example.com/gridline-studios',
    },
    {
      id: 'standard-06',
      name: 'HORIZON BOOKS',
      tag: 'STANDARD',
      initials: 'HB',
      description: 'Campus bookstore sponsoring the quiz and literary events.',
      website: 'https://example.com/horizon-books',
    },
  ],
};

export default sponsors;
