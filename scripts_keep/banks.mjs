// Shared deterministic PRNG (mulberry32) + name/org/topic/bio banks + the 40
// hand-authored "signature" people who anchor the dataset's best stories.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const NAMES = {
  first: [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Kabir",
    "Ishaan", "Reyansh", "Krishna", "Shaurya", "Ananya", "Aadhya", "Ira",
    "Saanvi", "Diya", "Myra", "Riya", "Anika", "Navya", "Paridhi", "Aishwarya",
    "Prisha", "Avni", "Meera", "Kiara", "Tanvi", "Ishita", "Ritika", "Kavya",
    "Pranav", "Aryan", "Dhruv", "Rohan", "Raghav", "Dev", "Yash", "Om",
    "Kartik", "Manav", "Siddharth", "Rahul", "Rajat", "Nikhil", "Shubham",
    "Harsh", "Abhishek", "Sachin", "Mohan", "Raj", "Vikram", "Karan", "Suresh",
    "Ramesh", "Deepak", "Sunil", "Anil", "Mahesh", "Gaurav", "Varun", "Sanjay",
  ],
  last: [
    "Sharma", "Verma", "Gupta", "Mehta", "Agarwal", "Jain", "Chopra", "Khanna",
    "Malhotra", "Kapoor", "Saxena", "Bhatia", "Mathur", "Nair", "Menon",
    "Iyer", "Rao", "Reddy", "Patel", "Shah", "Desai", "Joshi", "Kulkarni",
    "Chaturvedi", "Mishra", "Srivastava", "Tiwari", "Pandey", "Dixit", "Bajpai",
    "Singh", "Chauhan", "Rathore", "Shekhawat", "Rajput", "Tanwar", "Sisodia",
    "Pareek", "Bhandari", "Vyas", "Shrimali", "Lakhani", "Bothra", "Chhabra",
    "Khandelwal", "Rathi", "Soni", "Goyal", "Mittal", "Bansal", "Goel", "Arora",
    "Batra", "Sachdeva", "Gill", "Dhillon", "Bedi", "Ahuja", "Garg", "Tandon",
    "Kohli", "Bhat", "Dar", "Wani", "Malik", "Bakshi", "Gulati", "Sethi",
  ],
};

export const ORGS = [
  "Rajasthan Startup Studio", "Jaipur AI Collective", "BlockPrint House",
  "Marwari Ventures", "Blue City Labs", "Desert Fables Media",
  "Thar Renewables", "Pink City Designs", "Hawa Mahal Consulting",
  "NCR Robotics Guild", "Charkha Textiles", "Bishnoi Foundation",
  "Aravalli Bio Labs", "Sanganeri Studio", "Khatu Agro", "Ghoomar Records",
  "Phad Canvas", "Shekhawati Energy", "Jantar Mantar Obs", "Kota Coaching 2.0",
  "Sambhar Saltworks", "Chambal Cleanup Trust", "Mehrangarh Crafts",
  "Lal Kot Ventures", "Ajmeri Kirana", "Leheriya Society", "Bandhani Lab",
  "Rann of Kutch Expeditions", "Dhundhar Robotics", "Matsya Marine Research",
  "Girnar EdTech", "Abhaneri Water Trust", "Bairat Archaeology", "Tigona Films",
  "Pushkar Fusion", "Amer Ghatt Trust", "Bamanvad Solar", "Ranthambore Reads",
];

export const TOPICS = {
  ai: ["large language models", "machine learning", "agents", "deep learning", "inference", "prompting", "alignment", "computer vision"],
  startup: ["founder journey", "bootstrapping", "unit economics", "pivots", "marketplaces", "funding", "D2C", "SaaS"],
  design: ["design thinking", "typography", "product design", "branding", "interface", "craft in design", "vernacular design"],
  psychology: ["cognitive bias", "behavior change", "attention", "motivation", "habit", "decision making", "grit"],
  "public-health": ["vaccination", "community health", "sanitation", "maternal health", "public policy", "health equity"],
  education: ["learning science", "edtech", "vocational training", "curriculum", "teacher training", "digital literacy"],
  climate: ["renewables", "water", "drought", "carbon", "afforestation", "waste", "climate adaptation"],
  space: ["satellites", "ISRO", "Chandrayaan", "Gaganyaan", "space tech", "astronomy", "observatories"],
  entrepreneurship: ["startups", "founders", "scale", "resilience", "Indian innovation", "MSME"],
  leadership: ["teams", "decision making", "vision", "coaching", "organizational culture"],
  innovation: ["frugal innovation", "Jugaad", "R&D", "intrapreneurship", "patents", "technology transfer"],
  sustainability: ["circular economy", "zero waste", "ESG", "sustainable fashion", "green manufacturing"],
  "creative-arts": ["painting", "sculpture", "public art", "mural", "mixed media", "art therapy"],
  music: ["classical", "folk", "fusion", "music tech", "sound design", "composition"],
  sports: ["athletes", "Olympics", "sports science", "Paralympics", "mindset", "sports media"],
  "social-impact": ["NGO", "nonprofits", "volunteering", "community", "field work", "philanthropy"],
  economics: ["macroeconomics", "behavioral econ", "policy", "financial inclusion", "informal economy"],
  politics: ["governance", "policy", "elections", "public discourse", "youth politics"],
  history: ["Rajasthan history", "Mughal era", "independence", "archaeology", "oral history"],
  culture: ["heritage", "Rajasthani culture", "traditions", "identity", "preservation"],
  technology: ["cloud", "open source", "software", "hardware", "IoT", "5G", "edge computing"],
  "data-science": ["analytics", "ML ops", "statistics", "data viz", "big data"],
  "mental-health": ["anxiety", "burnout", "therapy", "self care", "student stress", "mindfulness"],
  energy: ["solar", "wind", "batteries", "grid", "energy access", "green hydrogen"],
  agriculture: ["agritech", "drip irrigation", "organic farming", "crop science", "farmers"],
  craft: ["block printing", "blue pottery", "handloom", "puppetry", "artisan economy", "kathputli"],
  media: ["journalism", "fact checking", "news", "influencers", "podcasting"],
  law: ["legal tech", "constitution", "rights", "litigation", "ADR"],
  urbanism: ["cities", "public space", "transit", "heritage urbanism", "smart cities"],
  biotech: ["biotech", "lab research", "pharma", "biosensors", "synbio"],
  robotics: ["robots", "automation", "drones", "mechanisms", "swarm"],
  marine: ["ocean", "coastline", "fisheries", "coral", "ocean plastic"],
  astronomy: ["stars", "telescopes", "galaxies", "exoplanets", "amateur astronomy"],
  quantum: ["quantum computing", "qubits", "cryptography", "simulation"],
  crypto: ["blockchain", "defi", "tokens", "NFT", "web3"],
  finance: ["personal finance", "investing", "banking", "fintech", "microcredit"],
  marketing: ["brand", "growth", "content", "SEO", "community marketing"],
  communication: ["public speaking", "narrative", "body language", "persuasion", "listening"],
  storytelling: ["oral tradition", "folktales", "scriptwriting", "brand story", "documentary"],
  philosophy: ["ethics", "stoicism", "meaning", "existence", "eastern thought"],
  neuroscience: ["brain", "neuroplasticity", "sleep", "memory", "consciousness"],
  genomics: ["genome", "CRISPR", "precision medicine", "genetic ancestry"],
  nanotech: ["nanomaterials", "nanomedicine", "nanotech", "materials science"],
  transport: ["EV", "electric mobility", "metro", "public transport", "last mile"],
  textile: ["block print", "sanganeri", "handloom", "dyeing", "textile tech"],
  folk: ["puppetry", "kathputli", "folk music", "folk dance", "kavad"],
  gaming: ["game design", "indie games", "esports", "game development"],
  wellness: ["yoga", "ayurveda", "breathwork", "holistic health"],
  food: ["cuisine", "street food", "food tech", "gastronomy", "farm to table"],
  beauty: ["skincare", "cosmetics", "clean beauty", "herbal beauty"],
  tourism: ["heritage tourism", "rural tourism", "travel tech", "sustainable tourism"],
  geopolitics: ["geopolitics", "foreign policy", "diplomacy", "Indo-Pacific", "supply chains"],
  defense: ["defense", "aerospace", "defense tech", "veterans"],
  governance: ["bureaucracy", "policy making", "digital governance", "IAS", "administration"],
  philanthropy: ["giving", "foundations", "social capital", "impact investing"],
  cinema: ["independent cinema", "filmmaking", "acting", "screenwriting"],
  literature: ["writing", "poetry", "fiction", "Hindi literature", "Rajasthani literature"],
};

// Domain → a few "extra concept" words that let the concept-bridge and
// embedding layers catch semantic queries (incl. misspellings / slang).
export const DOMAIN_TERMS = {
  ai: ["llm", "chatgpt", "gpt", "ai", "machine learning", "deep learning", "neural", "model", "intelligence"],
  startup: ["founder", "startup", "venture", "pitch", "scale", "business"],
  geopolitics: ["donald trump", "trump", "china", "russia", "india", "war", "trade war", "diplomacy", "border", "foreign policy"],
  psychology: ["mind", "brain", "behavior", "mental", "emotion", "grit", "habit"],
  space: ["isro", "chandrayaan", "gaganyaan", "satellite", "rocket", "nasa", "orbit", "moon", "mars"],
  "mental-health": ["stress", "anxiety", "depression", "burnout", "therapy", "student", "exam"],
  education: ["school", "college", "learning", "teacher", "student", "upsc", "exam", "coaching"],
  politics: ["upsc", "ias", "policy", "election", "minister", "government"],
  craft: ["kathputli", "puppet", "block print", "blue pottery", "handloom", "textile", "jaipur"],
  textile: ["block print", "sanganeri", "bagru", "bandhani", "leheriya", "jaipur"],
  geopolitics: ["geopolitics", "global power", "supply chain", "semiconductor"],
  transport: ["ev", "electric vehicle", "auto", "car", "mobility", "bike"],
  agriculture: ["farmer", "crop", "drought", "water", "irrigation", "organic"],
  "public-health": ["doctor", "health", "vaccine", "asha", "hospital", "hygiene"],
  entrepreneurship: ["founder", "business", "million", "revenue", "scale"],
  energy: ["solar", "renewable", "power", "electricity", "green"],
  governance: ["ias", "bureaucrat", "district", "administration", "policy"],
  literature: ["writer", "author", "poet", "book", "novel"],
  cinema: ["film", "director", "actor", "movie", "cinema"],
  "social-impact": ["ngo", "foundation", "volunteer", "community", "slum"],
  "defense": ["army", "airforce", "navy", "veteran", "defense"],
  folk: ["folk", "music", "dance", "ghoomar", "kathputli", "puppet"],
};

export const BIO_FRAGMENTS = [
  "grew up in a small Rajasthani town",
  "started with nothing but a single desk",
  "taught herself from public library books",
  "quit a corporate job to build something real",
  "has spent a decade in the field, not the boardroom",
  "turned a family craft into a modern brand",
  "works at the messy intersection of people and technology",
  "believes ideas only matter when they leave the stage",
  "runs experiments the way others run meetings",
  "collects failure stories as carefully as wins",
  "was told it would never work; did it anyway",
  "builds tools that outlive the moment",
  "studied in a government school and never stopped asking why",
  "crosses disciplines the way others cross roads",
  "thinks in systems and acts in small steps",
  "has never taken the easy yes",
  "turned a setback into a second career",
  "gives talks that change how people see the ordinary",
  "documents what others overlook",
  "measures success in lives changed, not likes",
];

export const RISK_FLAGS = [
  "Booked through peak season; confirm 10+ weeks out",
  "Prefers evening slots after work",
  "Sensitive to last-minute schedule changes",
  "Requests recorded-before-live option",
  "Honorarium non-negotiable",
  "Needs accessible green room",
  "Prefer virtual for first contact",
  "Travel from NCR adds ₹; bundle 2+ talks",
  "History of rescheduling (verify cadence)",
  "High demand during exam season",
];

export const APPROACH = [
  "Lead with their craft, then the audience draw.",
  "Reference their recorded talk in the opener.",
  "Invite via their warm intro path (see bitConnection).",
  "Offer virtual-first to de-risk.",
  "Bundle with a peer speaker to cut travel.",
  "Send the plate + a concrete talk angle, not a generic ask.",
  "Give the specific date window early.",
  "Mention the ₹5,000 budget framing as 'we keep it lean, but impactful'.",
];

// 40 hand-authored signature people. These anchor the best stories. Fields are
// a subset; generate-dataset.mjs expands them to the full Speaker schema.
export const SIGNATURES = [
  { name: "Mangilal Bhat", role: "Puppeteer & Kathputli Reviver", city: "Jaipur", domain: "folk", yoe: 38, line: "The 6th generation of a kathputli family, he has put the dying string-puppet form on YouTube and on world stages." },
  { name: "Meera Rathore", role: "Rally Driver", city: "Jodhpur", domain: "sports", yoe: 12, line: "One of the only women in Rajasthan's rally circuit, she races desert terrain and teaches girls to drive." },
  { name: "Parvati Kumari", role: "Para-Badminton Player", city: "Jaipur", domain: "sports", yoe: 9, line: "A Paralympic hopeful who turned a roadside accident into a national medal and a movement for accessible sport." },
  { name: "Sunita Devi", role: "ASHA Health Worker", city: "Tonk", domain: "public-health", yoe: 14, line: "Vaccinated a thousand villages; her doorstep ledger rewrote maternal health in the district." },
  { name: "Dr. Rohit Chaturvedi", role: "IAS Officer", city: "Jaipur", domain: "governance", yoe: 16, line: "A bureaucrat who digitised the district's grievance system and calls governance 'customer service at scale'." },
  { name: "Amrita Soni", role: "Commercial Beekeeper", city: "Kota", domain: "agriculture", yoe: 11, line: "Turned bee colonies into both honey and a pollinator-credit model for farmers." },
  { name: "Bhavesh Menon", role: "Cave Diver & Hydrogeologist", city: "Udaipur", domain: "marine", yoe: 15, line: "Maps hidden aquifers by diving into them; his finds have saved villages from drought." },
  { name: "Priyanka Garg", role: "Forensic Accountant", city: "Jaipur", domain: "finance", yoe: 13, line: "Catches fraud with spreadsheets; believes 'the truth is always in the numbers'." },
  { name: "Col. Rajeev Bakshi", role: "Defense Veteran & Skydiver", city: "Jaipur", domain: "defense", yoe: 24, line: "A para-commando who now trains teams on decision-making under impossible pressure." },
  { name: "Zoya Khan", role: "Documentary Filmmaker", city: "Jaipur", domain: "cinema", yoe: 10, line: "Her 40-minute film on street kids of the Walled City won three national awards." },
  { name: "Devraj Sisodia", role: "Blue Pottery Master", city: "Jaipur", domain: "craft", yoe: 30, line: "Kept the 300-year-old blue pottery glazes alive by teaching 2,000 apprentices." },
  { name: "Ankit Lakhani", role: "EV Conversion Engineer", city: "Jaipur", domain: "transport", yoe: 8, line: "Converts old petrol scooters into EVs in his garage; 500 on the road so far." },
  { name: "Dr. Neelam Vyas", role: "Neuroscientist", city: "Jaipur", domain: "neuroscience", yoe: 18, line: "Studies sleep and memory; her lab shows why teenagers shouldn't study at 4am." },
  { name: "Faisal Qureshi", role: "Community Journalist", city: "Jaipur", domain: "media", yoe: 12, line: "Runs a hyperlocal fact-check unit that has debunked 800+ fake videos." },
  { name: "Ganga Devi Kumawat", role: "Drought-Resilient Farmer", city: "Barmer", domain: "agriculture", yoe: 20, line: "Cultivates a grain that survives 8 months without rain; 'drought is a design problem'." },
  { name: "Tarun Malhotra", role: "Satellite Startup Founder", city: "Delhi", domain: "space", yoe: 7, line: "His 40-person team builds student-built satellites that cost less than a car." },
  { name: "Ishita Bhandari", role: "Sign-Language Interpreter & Deaf Advocate", city: "Jaipur", domain: "communication", yoe: 9, line: "Brought sign language into classrooms and to national news debates." },
  { name: "Rahul Rathore", role: "Blockchain for Land Records", city: "Jaipur", domain: "crypto", yoe: 6, line: "Piloted a ledger that ends disputes over who owns what in Rajasthan." },
  { name: "Suman Kanwar", role: "Handloom Weavers' Collective Lead", city: "Pali", domain: "textile", yoe: 22, line: "She pays 400 weavers a living wage and ships direct, cutting five middlemen." },
  { name: "Dr. Arjun Pareek", role: "Frugal Innovator", city: "Jaipur", domain: "innovation", yoe: 17, line: "Invented a ₹2,000 infant warmer after losing a cousin to hypothermia." },
  { name: "Kavita Sharma", role: "Street Theatre Director", city: "Jaipur", domain: "creative-arts", yoe: 15, line: "Her plays perform the constitution on bus stands and in villages." },
  { name: "Nikhil Bajpai", role: "AI Safety Researcher", city: "Delhi", domain: "ai", yoe: 9, line: "Warns that the biggest AI risk isn't robots, it's who gets to decide." },
  { name: "Meghna Chaturvedi", role: "Sports Psychologist", city: "Jaipur", domain: "psychology", yoe: 11, line: "Coaches national athletes on choking, focus, and the yips." },
  { name: "Vijay Singh Shekhawat", role: "Astronomer", city: "Bikaner", domain: "astronomy", yoe: 21, line: "Runs Rajasthan's largest amateur observatory; kids queue to see Saturn." },
  { name: "Ritu Chhabra", role: "Block Print Artisan turned CEO", city: "Sanganer", domain: "craft", yoe: 19, line: "Took her grandmother's hand-block process and made it a global export brand." },
  { name: "Dr. Prateek Gupta", role: "Emergency Physician", city: "Jaipur", domain: "public-health", yoe: 13, line: "Runs a free 24/7 ambulance that treats the uninsured like family." },
  { name: "Sara Khan", role: "Chef & Food Historian", city: "Jaipur", domain: "food", yoe: 12, line: "Recreates recipes from 200-year-old Mughal manuscripts." },
  { name: "Bhoomi Vyas", role: "Data Journalist", city: "Delhi", domain: "data-science", yoe: 8, line: "Turns government spreadsheets into stories that get laws changed." },
  { name: "Anirudh Rathore", role: "Gaming Studio Co-founder", city: "Jaipur", domain: "gaming", yoe: 7, line: "Built an indie game about the Thar that won a global award." },
  { name: "Dr. Sangeeta Nair", role: "Genomics Researcher", city: "Delhi", domain: "genomics", yoe: 16, line: "Studies why some families beat the diseases their genes predict." },
  { name: "Vikram Chauhan", role: "Veteran & Rural Coach", city: "Jaipur", domain: "leadership", yoe: 20, line: "Trains village youth like soldiers: discipline, team, and a mission." },
  { name: "Laxmi Rathore", role: "Kavad Artist", city: "Bassan", domain: "folk", yoe: 28, line: "Paints foldable 5-foot story temples; 'the first app was a kavad'." },
  { name: "Harsh Malhotra", role: "Renewable Microgrid Founder", city: "Bikaner", domain: "energy", yoe: 10, line: "Lights villages the grid forgot, one solar hut at a time." },
  { name: "Dr. Ananya Bhatt", role: "Yoga & Breath Researcher", city: "Rishikesh", domain: "wellness", yoe: 14, line: "Put the 3,000-year-old breath practice under an fMRI scanner." },
  { name: "Rohit Chauhan", role: "Urbanist", city: "Delhi", domain: "urbanism", yoe: 15, line: "Counts how many minutes people lose to traffic and what that costs a city." },
  { name: "Meenakshi Iyer", role: "Kuchipudi & Kathak Fusion Dancer", city: "Jaipur", domain: "music", yoe: 18, line: "Fuses two classical forms into a single grammar of movement." },
  { name: "Capt. Ashok Dar", role: "Aviator & Gaganyaan Aspirant Mentor", city: "Jaipur", domain: "defense", yoe: 19, line: "Has 3,000 flying hours and mentors kids who dream of the astronaut seat." },
  { name: "Divya Sood", role: "Mental Health Startup Founder", city: "Delhi", domain: "mental-health", yoe: 8, line: "Built a free therapy text-line for college students during exams." },
  { name: "Rakesh Jangid", role: "Education Lab Founder", city: "Jaipur", domain: "education", yoe: 12, line: "Runs science labs in 200 government schools using ₹50 kits." },
  { name: "Tanvi Agarwal", role: "Climate Tech Analyst", city: "Delhi", domain: "climate", yoe: 9, line: "Models how Rajasthan's heat will change farming by 2040." },
];

export function seededName(rnd, gender) {
  const f = NAMES.first[rnd() * NAMES.first.length | 0];
  const l = NAMES.last[rnd() * NAMES.last.length | 0];
  return `${f} ${l}`;
}
