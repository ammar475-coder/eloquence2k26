const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const SPONSORS_FILE = path.join(__dirname, '../data/sponsors.json');

const base15Sponsors = [
  {
    id: 'sponsor-elite-01',
    name: 'APEX DYNAMICS',
    companyName: 'Apex Dynamics Pvt Ltd',
    logo: '',
    description: 'A product engineering firm backing next-gen student innovation across South India.',
    website: 'https://example.com/apex-dynamics',
    contactName: 'Rajesh Kumar',
    contactEmail: 'partnerships@apexdynamics.in',
    contactPhone: '9876543210',
    category: 'Elite',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'sponsor-elite-02',
    name: 'NOVA SYSTEMS',
    companyName: 'Nova Cloud Systems Inc',
    logo: '',
    description: 'Cloud infrastructure partner providing compute credits and mentorship to every team.',
    website: 'https://example.com/nova-systems',
    contactName: 'Priya Sharma',
    contactEmail: 'contact@novasystems.io',
    contactPhone: '9876543211',
    category: 'Elite',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'sponsor-elite-03',
    name: 'ORION LABS',
    companyName: 'Orion AI & Robotics Labs',
    logo: '',
    description: 'R&D lab focused on AI and robotics, sponsoring the flagship hackathon track.',
    website: 'https://example.com/orion-labs',
    contactName: 'Dr. Anand Verma',
    contactEmail: 'sponsor@orionlabs.ai',
    contactPhone: '9876543212',
    category: 'Elite',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'sponsor-elite-04',
    name: 'VERTEX CAPITAL',
    companyName: 'Vertex Ventures Fund',
    logo: '',
    description: 'Early-stage venture fund supporting campus founders and student startups.',
    website: 'https://example.com/vertex-capital',
    contactName: 'Vikram Seth',
    contactEmail: 'invest@vertexcap.com',
    contactPhone: '9876543213',
    category: 'Elite',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'sponsor-premium-01',
    name: 'PULSE ELECTRONICS',
    companyName: 'Pulse Electronics India',
    logo: '',
    description: 'Consumer electronics brand fueling the gadget zone and tech expo.',
    website: 'https://example.com/pulse-electronics',
    contactName: 'Ananya Roy',
    contactEmail: 'marketing@pulseelectronics.in',
    contactPhone: '9876543214',
    category: 'Premium',
    displayOrder: 5,
    isActive: true
  },
  {
    id: 'sponsor-premium-02',
    name: 'STRATUS CLOUD',
    companyName: 'Stratus Cloud Hosting',
    logo: '',
    description: 'Cloud hosting partner keeping every registration and live stream online.',
    website: 'https://example.com/stratus-cloud',
    contactName: 'Deepak Nair',
    contactEmail: 'events@stratuscloud.net',
    contactPhone: '9876543215',
    category: 'Premium',
    displayOrder: 6,
    isActive: true
  },
  {
    id: 'sponsor-premium-03',
    name: 'IGNITE FOODS',
    companyName: 'Ignite Campus Dining',
    logo: '',
    description: 'Campus catering partner serving the food court all three days.',
    website: 'https://example.com/ignite-foods',
    contactName: 'Meera Patel',
    contactEmail: 'ops@ignitefoods.in',
    contactPhone: '9876543216',
    category: 'Premium',
    displayOrder: 7,
    isActive: true
  },
  {
    id: 'sponsor-premium-04',
    name: 'BYTEWORKS',
    companyName: 'ByteWorks Consulting',
    logo: '',
    description: 'Software consultancy running the coding and debugging arenas.',
    website: 'https://example.com/byteworks',
    contactName: 'Karthik R.',
    contactEmail: 'contact@byteworks.dev',
    contactPhone: '9876543217',
    category: 'Premium',
    displayOrder: 8,
    isActive: true
  },
  {
    id: 'sponsor-premium-05',
    name: 'LUMEN MEDIA',
    companyName: 'Lumen Digital Media',
    logo: '',
    description: 'Broadcast and media partner covering the event across social platforms.',
    website: 'https://example.com/lumen-media',
    contactName: 'Sneha Menon',
    contactEmail: 'press@lumenmedia.in',
    contactPhone: '9876543218',
    category: 'Premium',
    displayOrder: 9,
    isActive: true
  },
  {
    id: 'sponsor-standard-01',
    name: 'CRAFT PRINTS',
    companyName: 'Craft Prints & Merch Co.',
    logo: '',
    description: 'Local print shop behind the banners, badges and merchandise.',
    website: 'https://example.com/craft-prints',
    contactName: 'Sanjay Dutt',
    contactEmail: 'orders@craftprints.co',
    contactPhone: '9876543219',
    category: 'Standard',
    displayOrder: 10,
    isActive: true
  },
  {
    id: 'sponsor-standard-02',
    name: 'ZENTRA FITNESS',
    companyName: 'Zentra Gym & Health',
    logo: '',
    description: 'Campus gym partner supporting the sports and e-sports side events.',
    website: 'https://example.com/zentra-fitness',
    contactName: 'Harish K.',
    contactEmail: 'contact@zentrafitness.com',
    contactPhone: '9876543220',
    category: 'Standard',
    displayOrder: 11,
    isActive: true
  },
  {
    id: 'sponsor-standard-03',
    name: 'BREWHOUSE CAFE',
    companyName: 'The Brewhouse Cafe',
    logo: '',
    description: 'Coffee and snacks partner keeping participants fueled between events.',
    website: 'https://example.com/brewhouse-cafe',
    contactName: 'Tanya Joseph',
    contactEmail: 'hello@brewhousecafe.com',
    contactPhone: '9876543221',
    category: 'Standard',
    displayOrder: 12,
    isActive: true
  },
  {
    id: 'sponsor-standard-04',
    name: 'SWIFT TRAVELS',
    companyName: 'Swift City & Intercity Travels',
    logo: '',
    description: 'Local travel operator arranging pickups for outstation teams.',
    website: 'https://example.com/swift-travels',
    contactName: 'Arjun Das',
    contactEmail: 'bookings@swifttravels.in',
    contactPhone: '9876543222',
    category: 'Standard',
    displayOrder: 13,
    isActive: true
  },
  {
    id: 'sponsor-standard-05',
    name: 'GRIDLINE STUDIOS',
    companyName: 'Gridline Creative Studios',
    logo: '',
    description: 'Design studio that helped shape this year’s event branding.',
    website: 'https://example.com/gridline-studios',
    contactName: 'Rohan Joshi',
    contactEmail: 'studio@gridline.design',
    contactPhone: '9876543223',
    category: 'Standard',
    displayOrder: 14,
    isActive: true
  },
  {
    id: 'sponsor-standard-06',
    name: 'HORIZON BOOKS',
    companyName: 'Horizon Campus Bookstore',
    logo: '',
    description: 'Campus bookstore sponsoring the quiz and literary events.',
    website: 'https://example.com/horizon-books',
    contactName: 'Geetha Rao',
    contactEmail: 'help@horizonbooks.com',
    contactPhone: '9876543224',
    category: 'Standard',
    displayOrder: 15,
    isActive: true
  }
];

function normalizeCategory(cat) {
  if (!cat) return 'Elite';
  const c = cat.toLowerCase();
  if (c === 'title sponsor' || c === 'title' || c === 'elite') return 'Elite';
  if (c === 'gold sponsor' || c === 'silver sponsor' || c === 'gold' || c === 'silver' || c === 'premium') return 'Premium';
  if (c === 'bronze sponsor' || c === 'bronze' || c === 'other' || c === 'standard') return 'Standard';
  return 'Elite';
}

function camelToSnakeKey(key) {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function toDbObject(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[camelToSnakeKey(k)] = v;
  }
  return out;
}

async function updateAllSponsors() {
  console.log('--- Updating local sponsors.json ---');
  let existing = [];
  try {
    const raw = fs.readFileSync(SPONSORS_FILE, 'utf-8');
    existing = JSON.parse(raw || '[]');
  } catch (err) {
    console.warn('Could not read existing sponsors.json:', err.message);
  }

  const map = new Map();
  base15Sponsors.forEach(s => map.set(s.id, { ...s }));

  existing.forEach(s => {
    const normalizedCat = normalizeCategory(s.category);
    if (map.has(s.id)) {
      const base = map.get(s.id);
      map.set(s.id, {
        ...base,
        ...s,
        category: normalizedCat,
        logo: s.logo || base.logo || ''
      });
    } else {
      map.set(s.id, {
        ...s,
        category: normalizedCat
      });
    }
  });

  const merged = Array.from(map.values());
  merged.sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));

  fs.writeFileSync(SPONSORS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`Saved ${merged.length} sponsors to ${SPONSORS_FILE}`);

  console.log('\n--- Syncing sponsors with Supabase ---');
  try {
    const { data: dbData, error: dbError } = await supabase.from('sponsors').select('*');
    if (dbError) {
      console.error('Supabase query error:', dbError.message);
    } else {
      console.log(`Found ${dbData.length} records in Supabase sponsors table.`);
      for (const row of dbData) {
        const newCat = normalizeCategory(row.category);
        if (newCat !== row.category) {
          console.log(`Updating Supabase sponsor ${row.id} (${row.name}) category from '${row.category}' to '${newCat}'`);
          await supabase.from('sponsors').update({ category: newCat }).eq('id', row.id);
        }
      }

      // Upsert merged list into Supabase
      for (const sponsor of merged) {
        const dbObj = toDbObject(sponsor);
        const { error: upsertErr } = await supabase.from('sponsors').upsert([dbObj], { onConflict: 'id' });
        if (upsertErr) {
          console.warn(`Warning upserting ${sponsor.id}:`, upsertErr.message);
        }
      }
      console.log('✅ Supabase sponsors sync complete.');
    }
  } catch (err) {
    console.error('Supabase error:', err.message);
  }
}

updateAllSponsors().then(() => {
  console.log('\nAll sponsor levels updated successfully!');
  process.exit(0);
});
