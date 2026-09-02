// WanderWise mock data (v0 — no backend, per PRD §5)

const img = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const PHOTOS = {
  jaipur: img('1477587458883-47145ed94245'),
  delhi: img('1587474260584-136574528ed5'),
  mumbai: img('1529253355930-ddbe423a2ac7'),
  goa: img('1512343879784-a960bf40e7f2'),
  udaipur: '/cities/udaipur.jpg',
  varanasi: '/cities/varanasi.jpg',
  allahabad: '/cities/allahabad.jpg',
  agra: img('1564507592333-c60657eea523'),
  kolkata: img('1558431382-27e303142255'),
  kerala: img('1602216056096-3b40cc0c9944'),
  kashmir: '/cities/kashmir.jpg',
  chennai: img('1582510003544-4d00b7f74220'),
  mysuru: '/cities/mysuru.jpg',
  pushkar: '/cities/pushkar.jpg',
  ahmedabad: img('1584551246679-0daf3d275d0f'),
  puri: '/cities/puri.jpg',
  pune: '/cities/pune.jpg',
  hyderabad: '/cities/hyderabad.jpg',
  darjeeling: '/cities/darjeeling.jpg',
  shimla: '/cities/shimla.jpg',
  leh: img('1581793745862-99fde7fa73d2'),
  kochi: img('1593693411515-c20261bcad6e'),
  bangkok: img('1508009603885-50cf7c579365'),
  hongkong: img('1536599018102-9f803c140fc1'),
  london: img('1513635269975-59663e0ac1ad'),
  istanbul: img('1541432901042-2d8bd64b4a9b'),
  dubai: img('1512453979798-5ea266f8880c'),
  makkah: img('1591604129939-f1efa4d9f7fa'),
  antalya: img('1602898568500-2e0b1f8b1a4f'),
  paris: img('1502602898657-3e91760cbb34'),
  kl: img('1596422846543-75c6fc197f07'),
  la: img('1580655653885-65763b2597d0'),
  nyc: img('1496442226666-8d4d0e62e6e9'),
  melbourne: img('1514395462725-fb4566210144'),
  tokyo: img('1540959733332-eab4deabeeaf'),
  toronto: img('1517935706615-2717063c2225'),
  sydney: img('1506973035872-a4ec16b8e8d9'),
  chicago: img('1494522855154-9297ac14b55f'),
  birmingham: img('1596394516093-501ba68a0ba6'),
  goldenTriangle: img('1564507592333-c60657eea523'),
  rajasthan: img('1524492412937-b28074a5d7da'),
  spiritual: img('1561361513-2d000a50f0dc'),
  beaches: img('1602216056096-3b40cc0c9944'),
  hills: img('1544735716-392fe2489ffa'),
};

const c = (o) => ({ tags: [], isInternational: false, isComingSoon: false, ...o });

export const CITIES = [
  c({ id: 'jaipur', name: 'Jaipur', country: 'India', hero: PHOTOS.jaipur,
    description: 'The Pink City — palaces, bazaars and royal heritage',
    bestTime: 'October to March', languages: ['Hindi', 'English'],
    pricePerDay: { budget: 2500, mid: 6500, luxury: 18000 },
    culture: 'Founded in 1727 by Maharaja Sawai Jai Singh II, Jaipur was India\'s first planned city, laid out on a nine-block Vastu grid. Its terracotta-pink wash was painted in 1876 to welcome the Prince of Wales and has stayed ever since. The city remains a living workshop of block printing, blue pottery, kundan jewellery and Kathputli puppetry.' }),
  c({ id: 'delhi', name: 'Delhi', country: 'India', hero: PHOTOS.delhi,
    description: 'Millennia of empires layered inside one restless capital',
    bestTime: 'October to March', languages: ['Hindi', 'English', 'Punjabi'],
    pricePerDay: { budget: 2200, mid: 6000, luxury: 16000 },
    culture: 'Seven historic cities stack beneath modern Delhi, from Tughlaqabad to Shahjahanabad. Mughal domes, colonial boulevards and Partition-era refugee colonies sit within a few kilometres of each other, producing a food and music culture that is unapologetically mixed.' }),
  c({ id: 'mumbai', name: 'Mumbai', country: 'India', hero: PHOTOS.mumbai,
    description: 'Seven islands turned into India\'s restless dream factory',
    bestTime: 'November to February', languages: ['Marathi', 'Hindi', 'English'],
    pricePerDay: { budget: 2800, mid: 7500, luxury: 22000 },
    culture: 'From Koli fishing villages to Art Deco Marine Drive to Bollywood, Mumbai runs on migration and hustle. Its Gothic-Revival and Deco ensembles are UNESCO-listed.' }),
  c({ id: 'goa', name: 'Goa', country: 'India', hero: PHOTOS.goa,
    description: 'Beaches, Portuguese churches and long lazy lunches',
    bestTime: 'November to February', languages: ['Konkani', 'English', 'Hindi'],
    pricePerDay: { budget: 1800, mid: 5500, luxury: 20000 },
    culture: '451 years of Portuguese rule left baroque churches, azulejo tiles, feni distilling and a Indo-Latin cuisine found nowhere else in India.' }),
  c({ id: 'udaipur', name: 'Udaipur', country: 'India', hero: PHOTOS.udaipur,
    description: 'The City of Lakes — marble palaces on still water',
    bestTime: 'September to March', languages: ['Hindi', 'Mewari', 'English'],
    pricePerDay: { budget: 2400, mid: 7000, luxury: 25000 },
    culture: 'Capital of Mewar since 1559 and home to the world\'s longest-serving royal dynasty. Miniature painting in the Mewar school still thrives in the old city lanes.' }),
  c({ id: 'varanasi', name: 'Varanasi', country: 'India', hero: PHOTOS.varanasi,
    description: 'The oldest living city — ghats, aarti and Ganga at dawn',
    bestTime: 'October to March', languages: ['Hindi', 'Bhojpuri'],
    pricePerDay: { budget: 1600, mid: 4500, luxury: 14000 },
    culture: 'Continuously inhabited for over 3,000 years, Kashi is the seat of Banarasi silk weaving, Hindustani classical music and the nightly Ganga Aarti at Dashashwamedh Ghat.' }),
  c({ id: 'allahabad', name: 'Allahabad', country: 'India', hero: PHOTOS.allahabad,
    description: 'Triveni Sangam, Kumbh Mela, and ancient literary heritage',
    bestTime: 'October to March', languages: ['Hindi', 'Urdu', 'English'],
    pricePerDay: { budget: 1400, mid: 4000, luxury: 12000 },
    culture: 'Sacred confluence of the Ganga, Yamuna and mythical Saraswati rivers. Home of the Maha Kumbh Mela, Akbar\'s Allahabad Fort, Anand Bhavan, and Khusro Bagh.' }),
  c({ id: 'agra', name: 'Agra', country: 'India', hero: PHOTOS.agra,
    description: 'The Taj, a red fort, and Mughal marble at its peak',
    bestTime: 'October to March', languages: ['Hindi', 'Urdu', 'English'],
    pricePerDay: { budget: 1600, mid: 4800, luxury: 15000 },
    culture: 'Mughal capital under Akbar, Jahangir and Shah Jahan. Its pietra dura marble inlay workshops are staffed by descendants of the Taj\'s original artisans.' }),
  c({ id: 'kolkata', name: 'Kolkata', country: 'India', hero: PHOTOS.kolkata,
    description: 'Coffee-house debates, colonial bones and Durga Puja',
    bestTime: 'October to March', languages: ['Bengali', 'Hindi', 'English'],
    pricePerDay: { budget: 1800, mid: 5000, luxury: 14000 },
    culture: 'Capital of British India until 1911 and the engine of the Bengal Renaissance — Tagore, Ray, adda culture and the UNESCO-listed Durga Puja.' }),
  c({ id: 'kerala', name: 'Kerala', country: 'India', hero: PHOTOS.kerala,
    description: 'Backwaters, houseboats and coconut-green calm',
    bestTime: 'September to March', languages: ['Malayalam', 'English'],
    pricePerDay: { budget: 2200, mid: 6000, luxury: 19000 },
    culture: 'Spice-trade coastline with 2,000 years of Roman, Arab and Chinese contact. Kathakali, Theyyam and Ayurveda are living traditions here, not performances.' }),
  c({ id: 'kashmir', name: 'Kashmir', country: 'India', hero: PHOTOS.kashmir,
    description: 'Shikaras, saffron fields and Himalayan meadows',
    bestTime: 'April to October', languages: ['Kashmiri', 'Urdu', 'English'],
    pricePerDay: { budget: 2600, mid: 7000, luxury: 21000 },
    culture: 'Mughal pleasure gardens, Sufi shrines and a craft economy of pashmina, papier-mâché and walnut wood carving.' }),
  c({ id: 'chennai', name: 'Chennai', country: 'India', hero: PHOTOS.chennai,
    description: 'Carnatic music, filter coffee and a very long beach',
    bestTime: 'November to February', languages: ['Tamil', 'English'],
    pricePerDay: { budget: 1800, mid: 5000, luxury: 15000 },
    culture: 'Home of Bharatanatyam and the December Margazhi music season, with Dravidian temple architecture at nearby Mahabalipuram.' }),
  c({ id: 'mysuru', name: 'Mysuru', country: 'India', hero: PHOTOS.mysuru,
    description: 'Palace lights, sandalwood and silk',
    bestTime: 'October to February', languages: ['Kannada', 'English'],
    pricePerDay: { budget: 1700, mid: 4800, luxury: 14000 },
    culture: 'Seat of the Wadiyar dynasty. Dasara here is a ten-day state festival with a caparisoned-elephant procession.' }),
  c({ id: 'pushkar', name: 'Pushkar', country: 'India', hero: PHOTOS.pushkar,
    description: 'A holy lake, 500 temples and the camel fair',
    bestTime: 'October to March', languages: ['Hindi', 'Marwari'],
    pricePerDay: { budget: 1400, mid: 4000, luxury: 12000 },
    culture: 'One of the only Brahma temples on earth sits by a lake said to have formed where a lotus fell. The November camel fair draws 200,000 people.' }),
  c({ id: 'ahmedabad', name: 'Ahmedabad', country: 'India', hero: PHOTOS.ahmedabad,
    description: 'India\'s first UNESCO World Heritage City',
    bestTime: 'November to February', languages: ['Gujarati', 'Hindi', 'English'],
    pricePerDay: { budget: 1600, mid: 4500, luxury: 13000 },
    culture: 'Pol houses, Indo-Islamic stone jaalis, Gandhi\'s Sabarmati Ashram and a textile industry that earned it "Manchester of the East".' }),
  c({ id: 'puri', name: 'Jagannath Puri', country: 'India', hero: PHOTOS.puri,
    description: 'Temple town on the Bay of Bengal',
    bestTime: 'October to February', languages: ['Odia', 'Hindi'],
    pricePerDay: { budget: 1300, mid: 3800, luxury: 11000 },
    culture: 'The 12th-century Jagannath Temple and its Rath Yatra — the chariot festival that gave English the word "juggernaut".' }),
  c({ id: 'pune', name: 'Pune', country: 'India', hero: PHOTOS.pune,
    description: 'Maratha history with a young, green campus feel',
    bestTime: 'October to February', languages: ['Marathi', 'Hindi', 'English'],
    pricePerDay: { budget: 1700, mid: 4800, luxury: 13000 },
    culture: 'Peshwa capital of the Maratha Empire and today a university and tech city with a strong theatre and food scene.' }),
  c({ id: 'hyderabad', name: 'Hyderabad', country: 'India', hero: PHOTOS.hyderabad,
    description: 'Nizami grandeur, biryani and pearls',
    bestTime: 'October to February', languages: ['Telugu', 'Urdu', 'English'],
    pricePerDay: { budget: 1800, mid: 5200, luxury: 16000 },
    culture: 'Qutb Shahi and Asaf Jahi rule produced the Charminar, Golconda\'s diamonds, Deccani miniature painting and Hyderabadi dum biryani.' }),
  c({ id: 'darjeeling', name: 'Darjeeling', country: 'India', hero: PHOTOS.darjeeling,
    description: 'Tea gardens, toy trains and Kanchenjunga at sunrise',
    bestTime: 'March to May, October to November', languages: ['Nepali', 'Bengali', 'English'],
    pricePerDay: { budget: 1900, mid: 5000, luxury: 15000 },
    culture: 'A Raj-era hill station whose Himalayan Railway is a UNESCO site and whose first-flush tea is auctioned worldwide.' }),
  c({ id: 'shimla', name: 'Shimla', country: 'India', hero: PHOTOS.shimla,
    description: 'The summer capital of the Raj on a pine ridge',
    bestTime: 'March to June, December to January', languages: ['Hindi', 'Pahari', 'English'],
    pricePerDay: { budget: 1800, mid: 5000, luxury: 15000 },
    culture: 'Mock-Tudor architecture on the Mall Road, the Kalka–Shimla toy train and Himachali temple woodcraft.' }),
  c({ id: 'leh', name: 'Leh (Ladakh)', country: 'India', hero: PHOTOS.leh,
    description: 'High-desert monasteries above 3,500 m',
    bestTime: 'June to September', languages: ['Ladakhi', 'Hindi', 'English'],
    pricePerDay: { budget: 2400, mid: 6500, luxury: 20000 },
    culture: 'Tibetan Buddhist gompas, Hemis festival masked dance, and the trans-Himalayan trade route that ran to Yarkand.' }),
  c({ id: 'kochi', name: 'Kochi (Alleppey)', country: 'India', hero: PHOTOS.kochi,
    description: 'Chinese nets, spice godowns and canal towns',
    bestTime: 'October to March', languages: ['Malayalam', 'English'],
    pricePerDay: { budget: 2000, mid: 5500, luxury: 17000 },
    culture: 'Fort Kochi layers Portuguese, Dutch, Jewish and British history into a few walkable blocks; Alleppey adds the backwater houseboats.' }),

  // International
  c({ id: 'bangkok', name: 'Bangkok', country: 'Thailand', hero: PHOTOS.bangkok, isInternational: true,
    description: 'Golden temples, canal markets and street food till 3am',
    bestTime: 'November to February', languages: ['Thai', 'English'], currency: '฿',
    pricePerDay: { budget: 1200, mid: 3200, luxury: 9000 },
    culture: 'Rattanakosin-era temples and the Chao Phraya\'s klongs sit under a skyline of BTS lines and rooftop bars.' }),
  c({ id: 'hongkong', name: 'Hong Kong', country: 'China', hero: PHOTOS.hongkong, isInternational: true,
    description: 'Neon harbour city where dim sum meets skyscrapers',
    bestTime: 'October to December', languages: ['Cantonese', 'English'], currency: 'HK$',
    pricePerDay: { budget: 2600, mid: 7000, luxury: 90 * 260 },
    culture: 'A treaty port turned finance capital, with tea houses, temple markets and 200 outlying islands.' }),
  c({ id: 'london', name: 'London', country: 'UK', hero: PHOTOS.london, isInternational: true,
    description: 'Museums, markets and two thousand years of layers',
    bestTime: 'May to September', languages: ['English'], currency: '£',
    pricePerDay: { budget: 6000, mid: 14000, luxury: 40000 },
    culture: 'Roman Londinium to the Southbank — free national museums, West End theatre and a genuinely global food map.' }),
  c({ id: 'istanbul', name: 'Istanbul', country: 'Turkey', hero: PHOTOS.istanbul, isInternational: true,
    description: 'Two continents, one skyline of domes and minarets',
    bestTime: 'April to June, September to November', languages: ['Turkish', 'English'], currency: '₺',
    pricePerDay: { budget: 2200, mid: 6000, luxury: 18000 },
    culture: 'Byzantine Constantinople and Ottoman Istanbul overlap at Hagia Sophia, the Grand Bazaar and the Bosphorus ferries.' }),
  c({ id: 'dubai', name: 'Dubai', country: 'UAE', hero: PHOTOS.dubai, isInternational: true,
    description: 'Desert futurism, souks and record-breaking towers',
    bestTime: 'November to March', languages: ['Arabic', 'English'], currency: 'AED',
    pricePerDay: { budget: 4000, mid: 11000, luxury: 35000 },
    culture: 'A pearling creek town that became a global hub in fifty years; Al Fahidi\'s wind towers still show the old city.' }),
  c({ id: 'makkah', name: 'Makkah', country: 'Saudi Arabia', hero: PHOTOS.makkah, isInternational: true,
    description: 'The holiest city in Islam, open year-round for Umrah',
    bestTime: 'November to February', languages: ['Arabic', 'Urdu', 'English'], currency: 'SAR',
    pricePerDay: { budget: 3500, mid: 9000, luxury: 28000 },
    culture: 'The Masjid al-Haram surrounds the Kaaba; the Hajj draws over two million pilgrims each year.' }),
  c({ id: 'antalya', name: 'Antalya', country: 'Turkey', hero: PHOTOS.antalya, isInternational: true,
    description: 'Turquoise coast, Roman ruins and old-town harbours',
    bestTime: 'April to October', languages: ['Turkish', 'English'], currency: '₺',
    pricePerDay: { budget: 2000, mid: 5500, luxury: 16000 },
    culture: 'Kaleiçi\'s Ottoman houses sit above a Roman harbour, with Lycian and Pamphylian ruins along the coast.' }),
  c({ id: 'paris', name: 'Paris', country: 'France', hero: PHOTOS.paris, isInternational: true,
    description: 'Boulevards, brasseries and the world\'s best museums',
    bestTime: 'April to June, September to October', languages: ['French', 'English'], currency: '€',
    pricePerDay: { budget: 5500, mid: 13000, luxury: 38000 },
    culture: 'Haussmann\'s boulevards, the Left Bank\'s cafés and a museum density unmatched anywhere.' }),
  c({ id: 'kl', name: 'Kuala Lumpur', country: 'Malaysia', hero: PHOTOS.kl, isInternational: true,
    description: 'Towers, temples and a three-cuisine food scene',
    bestTime: 'May to July, December to February', languages: ['Malay', 'English'], currency: 'RM',
    pricePerDay: { budget: 1500, mid: 4000, luxury: 12000 },
    culture: 'A tin-mining confluence town that grew into a Malay-Chinese-Indian capital, with Batu Caves on its edge.' }),

  // Coming soon
  c({ id: 'la', name: 'Los Angeles', country: 'USA', hero: PHOTOS.la, isInternational: true, isComingSoon: true, description: 'Sunset boulevards and studio backlots', bestTime: 'March to May', languages: ['English'], pricePerDay: { budget: 7000, mid: 16000, luxury: 45000 } }),
  c({ id: 'nyc', name: 'New York City', country: 'USA', hero: PHOTOS.nyc, isInternational: true, isComingSoon: true, description: 'Five boroughs that never stop', bestTime: 'April to June', languages: ['English'], pricePerDay: { budget: 8000, mid: 18000, luxury: 50000 } }),
  c({ id: 'melbourne', name: 'Melbourne', country: 'Australia', hero: PHOTOS.melbourne, isInternational: true, isComingSoon: true, description: 'Laneway coffee and street art', bestTime: 'March to May', languages: ['English'], pricePerDay: { budget: 5000, mid: 12000, luxury: 32000 } }),
  c({ id: 'tokyo', name: 'Tokyo', country: 'Japan', hero: PHOTOS.tokyo, isInternational: true, isComingSoon: true, description: 'Precision, neon and 200,000 restaurants', bestTime: 'March to May', languages: ['Japanese'], currency: '¥', pricePerDay: { budget: 8000, mid: 18000, luxury: 48000 } }),
  c({ id: 'toronto', name: 'Toronto', country: 'Canada', hero: PHOTOS.toronto, isInternational: true, isComingSoon: true, description: 'Lakeside and genuinely multicultural', bestTime: 'May to September', languages: ['English', 'French'], pricePerDay: { budget: 5500, mid: 13000, luxury: 34000 } }),
  c({ id: 'sydney', name: 'Sydney', country: 'Australia', hero: PHOTOS.sydney, isInternational: true, isComingSoon: true, description: 'Harbour, headlands and surf beaches', bestTime: 'September to November', languages: ['English'], pricePerDay: { budget: 5500, mid: 13000, luxury: 36000 } }),
  c({ id: 'chicago', name: 'Chicago', country: 'USA', hero: PHOTOS.chicago, isInternational: true, isComingSoon: true, description: 'Architecture, blues and deep dish', bestTime: 'June to September', languages: ['English'], pricePerDay: { budget: 6000, mid: 14000, luxury: 38000 } }),
  c({ id: 'birmingham', name: 'Birmingham', country: 'UK', hero: PHOTOS.birmingham, isInternational: true, isComingSoon: true, description: 'Canals, curry houses and Peaky lore', bestTime: 'May to September', languages: ['English'], pricePerDay: { budget: 4500, mid: 10000, luxury: 26000 } }),
];

export const cityById = (id) => CITIES.find((x) => x.id === id);

export const CURATED_TOURS = [
  { id: 'golden-triangle', name: 'Golden Triangle', region: 'North India', cityIds: ['delhi', 'agra', 'jaipur'], durationDays: 5, cover: PHOTOS.goldenTriangle },
  { id: 'rajasthan-royals', name: 'Rajasthan Royals', region: 'North India', cityIds: ['jaipur', 'udaipur', 'pushkar'], durationDays: 5, cover: PHOTOS.rajasthan },
  { id: 'spiritual-north', name: 'Spiritual North', region: 'North India', cityIds: ['delhi', 'varanasi', 'kashmir'], durationDays: 7, cover: PHOTOS.spiritual },
  { id: 'beaches-backwaters', name: 'Beaches & Backwaters', region: 'South & West', cityIds: ['kerala', 'goa'], durationDays: 6, cover: PHOTOS.beaches },
  { id: 'hills-nature', name: 'Hill Stations & Nature', region: 'Himalayas', cityIds: ['kashmir', 'shimla', 'leh', 'darjeeling'], durationDays: 10, cover: PHOTOS.hills },
];

export const SEASONAL = [
  { cityId: 'leh', season: 'Peak season now', line: 'Passes are open and the Nubra road is clear — go before October snow.' },
  { cityId: 'kerala', season: 'Post-monsoon green', line: 'Backwaters are full and rates are still low until mid-October.' },
  { cityId: 'jaipur', season: 'Coming into season', line: 'Cool mornings from late October — the best light for Amber Fort.' },
  { cityId: 'goa', season: 'Shoulder season', line: 'Beach shacks reopen from November; book before Christmas rates hit.' },
  { cityId: 'varanasi', season: 'Festival window', line: 'Dev Deepawali in November lights every ghat with a million lamps.' },
];

// ---- POIs, restaurants, stays, transport, markets -------------------------
const P = (cityId, name, category, description, price, rating) => ({ cityId, name, category, description, price, rating });

export const POIS = [
  P('jaipur', 'Amber Fort', 'Heritage', 'Massive hilltop fort with courtyards, palaces and sweeping views over the Aravalli hills.', 100, 4.6),
  P('jaipur', 'City Palace', 'Heritage', 'Royal complex in the old city combining Rajput and Mughal architecture with museums and ornate courtyards.', 300, 4.5),
  P('jaipur', 'Hawa Mahal', 'Landmark', 'Iconic pink sandstone facade built with hundreds of small windows overlooking the old city streets.', 50, 4.5),
  P('jaipur', 'Jantar Mantar', 'Heritage', 'UNESCO-listed astronomical observatory filled with enormous precision instruments from the 18th century.', 50, 4.5),
  P('jaipur', 'Nahargarh Fort', 'Viewpoint', 'Hilltop fort famous for sunset views across Jaipur and the surrounding Aravallis.', 50, 4.5),

  P('delhi', 'India Gate', 'Landmark', "Monumental war memorial and one of Delhi's best-known evening landmarks.", 0, 4.6),
  P('delhi', 'Red Fort', 'Heritage', 'Mughal-era fortress and UNESCO World Heritage Site in Old Delhi.', 35, 4.5),
  P('delhi', 'Qutub Minar', 'Heritage', 'UNESCO-listed 12th-century minaret surrounded by historic monuments.', 40, 4.6),
  P('delhi', "Humayun's Tomb", 'Heritage', 'Grand Mughal garden tomb and architectural precursor to the Taj Mahal.', 50, 4.6),
  P('delhi', 'Lotus Temple', 'Spiritual', 'Distinctive lotus-shaped Baháʼí House of Worship surrounded by landscaped gardens.', 0, 4.5),

  P('agra', 'Taj Mahal', 'Heritage', 'The marble mausoleum Shah Jahan built for Mumtaz Mahal.', 1100, 4.9),
  P('agra', 'Agra Fort', 'Heritage', 'Red sandstone fortress where Shah Jahan was imprisoned in view of the Taj.', 650, 4.6),
  P('agra', 'Mehtab Bagh', 'Viewpoint', 'Riverside garden with the classic sunset Taj view.', 300, 4.4),
  P('agra', 'Fatehpur Sikri', 'Heritage', "Akbar's abandoned capital, 40 km out — Buland Darwaza and all.", 610, 4.5),
  P('agra', "Itmad-ud-Daulah", 'Heritage', "The 'Baby Taj' — first Mughal tomb in white marble inlay.", 310, 4.4),

  P('udaipur', 'City Palace Udaipur', 'Heritage', 'Rajasthan\'s largest palace, stacked above Lake Pichola.', 300, 4.7),
  P('udaipur', 'Lake Pichola Boat Ride', 'Experience', 'Sunset shikara past Jag Mandir and the Lake Palace.', 400, 4.8),
  P('udaipur', 'Saheliyon ki Bari', 'Garden', 'Fountain garden built for the maids of honour.', 100, 4.3),

  P('varanasi', 'Dashashwamedh Ghat', 'Spiritual', 'The nightly Ganga Aarti with fire lamps and conches.', 0, 4.8),
  P('varanasi', 'Sarnath', 'Heritage', 'Where the Buddha gave his first sermon; Dhamek Stupa stands here.', 300, 4.6),
  P('varanasi', 'Sunrise Boat Ride', 'Experience', 'Row past 84 ghats as the city wakes.', 500, 4.9),

  P('allahabad', 'Triveni Sangam', 'Spiritual', 'Sacred confluence of the Ganga, Yamuna and Saraswati; site of the Kumbh Mela.', 0, 4.8),
  P('allahabad', 'Allahabad Fort & Akshayavat', 'Heritage', '1583 fort built by Akbar overlooking the Sangam with the immortal banyan tree.', 50, 4.5),
  P('allahabad', 'Anand Bhavan', 'Heritage', 'Historic ancestral home of the Nehru family and epicenter of the independence movement.', 70, 4.6),
  P('allahabad', 'Khusro Bagh', 'Heritage', 'Mughal walled garden containing intricate sandstone mausoleums of Prince Khusrau.', 0, 4.4),

  P('goa', 'Basilica of Bom Jesus', 'Heritage', 'Baroque church holding the relics of St Francis Xavier.', 0, 4.6),
  P('goa', 'Palolem Beach', 'Beach', 'Crescent bay of calm water and kayaks in the south.', 0, 4.5),
  P('goa', 'Dudhsagar Falls', 'Nature', 'Four-tier waterfall reached by jeep through the Bhagwan Mahavir sanctuary.', 800, 4.6),

  P('kerala', 'Alleppey Backwaters', 'Experience', 'Houseboat through paddy polders and coir villages.', 6000, 4.8),
  P('kerala', 'Fort Kochi', 'Heritage', 'Chinese fishing nets, Dutch cemetery and Jew Town spice lanes.', 0, 4.5),
  P('kerala', 'Munnar Tea Estates', 'Nature', 'Rolling Kannan Devan hills at 1,600 m.', 0, 4.7),

  P('mumbai', 'Gateway of India', 'Monument', 'The 1924 arch on the Apollo Bunder waterfront.', 0, 4.5),
  P('mumbai', 'Elephanta Caves', 'Heritage', 'Rock-cut Shiva cave temples on an island an hour offshore.', 600, 4.5),
  P('mumbai', 'Marine Drive', 'Experience', 'The Queen\'s Necklace curve, best at dusk.', 0, 4.7),

  P('kashmir', 'Dal Lake Shikara', 'Experience', 'Floating gardens, houseboats and the Zabarwan backdrop.', 800, 4.8),
  P('kashmir', 'Gulmarg Gondola', 'Nature', 'One of the world\'s highest cable cars to 3,980 m.', 1600, 4.7),

  P('leh', 'Pangong Tso', 'Nature', 'Colour-shifting lake at 4,350 m on the Tibetan plateau.', 0, 4.9),
  P('leh', 'Thiksey Monastery', 'Spiritual', 'Twelve-storey gompa with a 15 m Maitreya Buddha.', 100, 4.7),

  P('kolkata', 'Victoria Memorial', 'Heritage', 'Grand white-marble monument surrounded by gardens and a museum documenting colonial-era Kolkata.', 30, 4.6),
  P('kolkata', 'Howrah Bridge', 'Landmark', "Iconic cantilever bridge over the Hooghly River and one of Kolkata's defining city views.", 0, 4.5),
  P('kolkata', 'Dakshineswar Kali Temple', 'Spiritual', 'Riverside Kali temple associated with Ramakrishna Paramahansa and a major pilgrimage site.', 0, 4.6),
  P('kolkata', 'Indian Museum', 'Heritage', "India's oldest major museum, with archaeology, art, fossils and natural-history collections.", 50, 4.3),
  P('kolkata', 'College Street', 'Market', 'Legendary book district packed with old bookstores, publishers and the historic Coffee House.', 0, 4.4),

  P('chennai', 'Kapaleeshwarar Temple', 'Spiritual', 'Dravidian-style temple in Mylapore with a towering colourful gopuram and centuries of history.', 0, 4.7),
  P('chennai', 'Marina Beach', 'Beach', 'Long urban beachfront popular for sunrise walks, evening snacks and local street life.', 0, 4.4),
  P('chennai', 'Fort St. George', 'Heritage', 'Historic British fort established in 1644 and home to important colonial-era buildings.', 30, 4.3),
  P('chennai', 'Government Museum', 'Heritage', 'Major museum complex known for Chola bronzes, archaeology and South Indian art.', 20, 4.5),
  P('chennai', 'Mahabalipuram Shore Temple', 'Heritage', 'UNESCO-listed Pallava-era stone temple dramatically positioned beside the Bay of Bengal.', 40, 4.6),

  P('mysuru', 'Mysore Palace', 'Heritage', 'Indo-Saracenic royal palace famous for its grand interiors and spectacular illumination.', 70, 4.8),
  P('mysuru', 'Chamundi Hill', 'Viewpoint', 'Hilltop temple and panoramic viewpoint overlooking Mysuru, reached by road or a long stone staircase.', 0, 4.5),
  P('mysuru', 'Devaraja Market', 'Market', 'Historic market filled with flowers, fruits, spices, incense and traditional goods.', 0, 4.4),
  P('mysuru', "St. Philomena's Cathedral", 'Heritage', 'Neo-Gothic cathedral with dramatic twin towers inspired by European church architecture.', 0, 4.5),
  P('mysuru', 'Brindavan Gardens', 'Garden', 'Famous landscaped gardens below the Krishnaraja Sagar Dam with evening musical fountains.', 50, 4.4),

  P('pushkar', 'Pushkar Lake', 'Spiritual', 'Sacred lake surrounded by bathing ghats, temples and colourful old-town streets.', 0, 4.6),
  P('pushkar', 'Brahma Temple', 'Spiritual', "One of the world's few major temples dedicated to Lord Brahma.", 0, 4.5),
  P('pushkar', 'Savitri Temple Viewpoint', 'Viewpoint', 'Hilltop temple offering sweeping views over Pushkar Lake and the surrounding desert landscape.', 100, 4.5),
  P('pushkar', 'Varaha Temple', 'Spiritual', "Historic temple dedicated to Varaha, an incarnation of Vishnu, in Pushkar's old town.", 0, 4.3),
  P('pushkar', 'Pushkar Bazaar', 'Market', 'Colourful lanes filled with textiles, jewellery, leather goods, handicrafts and souvenirs.', 0, 4.4),

  P('ahmedabad', 'Sabarmati Ashram', 'Heritage', "Gandhi's riverside home and an important site connected with India's independence movement.", 0, 4.7),
  P('ahmedabad', 'Adalaj Stepwell', 'Heritage', 'Five-storey carved stepwell built in the late 15th century with remarkable stone architecture.', 0, 4.6),
  P('ahmedabad', 'Sidi Saiyyed Mosque', 'Heritage', 'Historic mosque famous for its delicate stone jaali depicting the Tree of Life.', 0, 4.5),
  P('ahmedabad', 'Manek Chowk', 'Market', 'Jewellery market by day that transforms into a legendary street-food destination after dark.', 0, 4.5),
  P('ahmedabad', 'Kankaria Lake', 'Leisure', 'Large recreational lake surrounded by gardens, rides, food stalls and evening activities.', 10, 4.4),
];

const R = (cityId, name, area, description, mustTry, priceForTwo) => ({ cityId, name, area, description, mustTry, priceForTwo });

export const RESTAURANTS = [
  R('jaipur', 'Laxmi Misthan Bhandar (LMB)', 'Johari Bazaar', 'Iconic 1727 sweet shop and thali joint.', 'Dal Baati Churma', 800),
  R('jaipur', 'Rawat Misthan Bhandar', 'Station Road', 'Cash-only institution, always packed with locals.', 'Pyaaz Kachori', 400),
  R('jaipur', 'Suvarna Mahal', 'Rambagh Palace', "Royal Rajasthani dining in a maharaja's former dining hall.", 'Laal Maas', 7000),
  R('jaipur', 'Handi Restaurant', 'MI Road', 'Smoky tandoor and handi meats served in a lively local setting.', 'Laal Maas', 900),

  R('delhi', "Karim's", 'Jama Masjid', 'Mughlai kitchen run by the same family since 1913.', 'Mutton Burra', 900),
  R('delhi', 'Bukhara', 'ITC Maurya', 'North-West Frontier grills; a long-running luxury dining institution.', 'Dal Bukhara', 8000),
  R('delhi', 'Paranthe Wali Gali', 'Chandni Chowk', 'A lane of fried-paratha stalls with a long Old Delhi food tradition.', 'Rabri Paratha', 300),
  R('delhi', 'Moti Mahal', 'Daryaganj', 'Historic restaurant associated with the popularisation of butter chicken.', 'Butter Chicken', 1000),

  R('agra', 'Pinch of Spice', 'Fatehabad Road', 'Reliable upscale Mughlai — great after a long Taj morning.', 'Mughlai thali', 1800),
  R('agra', 'Panchhi Petha Store', 'Sadar Bazaar', "The original 100-year-old petha shop — Agra's iconic ash-gourd sweet.", 'Kesar petha', 300),
  R('agra', 'Esphahan (Oberoi Amarvilas)', 'Taj East Gate', 'Fine-dining Mughlai with a Taj view — the most romantic table in India.', 'Awadhi tasting menu', 12000),
  R('agra', "Joney's Place", 'Taj Ganj', 'Traveler-favorite tiny cafe — everything under ₹200.', 'Banana lassi', 400),

  R('udaipur', 'Ambrai', 'Amet Haveli', 'Lakeside table facing the City Palace lit up at night.', 'Laal maas', 3000),
  R('varanasi', 'Kashi Chat Bhandar', 'Godowlia', 'Legendary tamatar chaat and palak patta chaat.', 'Tamatar chaat', 250),

  R('allahabad', 'Netram Mulchand & Sons', 'Katra', 'Famous for authentic poori-sabzi, jalebi and rabri since 1854.', 'Poori Sabzi & Jalebi', 250),
  R('allahabad', 'Loknath Chaat Corner', 'Loknath, Old City', 'Famous street chaat and dahi bhalla hub in old Allahabad.', 'Dahi Bhalla', 200),
  R('allahabad', 'El Chico Restaurant', 'Civil Lines', 'Historic dining spot in Civil Lines serving Mughlai and continental dishes since 1964.', 'Roasted Murgh & Biryani', 900),

  R('mumbai', 'Britannia & Co.', 'Ballard Estate', 'Parsi cafe from 1923 with a famous berry pulao.', 'Berry pulao', 1400),

  R('kolkata', 'Peter Cat', 'Park Street', 'Old-school Kolkata institution famous for its smoky Chelo Kebab and sizzlers.', 'Chelo Kebab', 900),
  R('kolkata', '6 Ballygunge Place', 'Ballygunge', 'Popular Bengali restaurant serving a broad spread of traditional home-style dishes.', 'Kosha Mangsho', 1000),
  R('kolkata', 'Kasturi', 'New Market', 'Casual Bengali favourite known for fish, prawns and mustard-heavy curries.', 'Daab Chingri', 700),
  R('kolkata', 'Balaram Mullick & Radharaman Mullick', 'Bhowanipore', 'Legendary sweet shop known for sandesh, mishti doi and seasonal Bengali sweets.', 'Baked Rasgulla', 500),

  R('chennai', 'Murugan Idli Shop', 'T. Nagar', 'Popular South Indian institution known for soft idlis, podi and generous chutneys.', 'Podi Idli', 400),
  R('chennai', 'Saravana Bhavan', 'T. Nagar', 'Reliable vegetarian option for classic Tamil breakfast, dosa and filter coffee.', 'Masala Dosa', 350),
  R('chennai', 'Buhari Hotel', 'Mount Road', 'Historic Chennai restaurant associated with the popular Chicken 65 dish.', 'Chicken 65', 700),
  R('chennai', 'Ratna Cafe', 'Triplicane', 'Old-school vegetarian favourite famous for sambar poured generously over idlis.', 'Sambar Idli', 350),

  R('mysuru', 'Vinayaka Mylari', 'Nazarbad', 'Beloved local institution known for soft, buttery dosa and distinctive chutney.', 'Mysore Masala Dosa', 250),
  R('mysuru', 'Mysore Mylari Hotel', 'Nazarbad', 'Classic Mysuru breakfast spot serving fluffy dosas and traditional South Indian dishes.', 'Mysore Dosa', 250),
  R('mysuru', 'RRR Restaurant', 'Nazarbad', 'Popular non-vegetarian restaurant known for Andhra-style meals and biryani.', 'Chicken Biryani', 500),
  R('mysuru', 'Hotel Hanumanthu', 'Nazarbad', 'Old Mysuru favourite famous for spicy local-style mutton and biryani dishes.', 'Mutton Biryani', 500),

  R('pushkar', 'Sixth Sense Rooftop', 'Near Brahma Temple', 'Rooftop cafe overlooking the lake and ghats with a relaxed traveller atmosphere.', 'Rajasthani Thali', 500),
  R('pushkar', 'La Pizzeria', 'Main Market', 'Popular casual restaurant known for pizzas, pasta and rooftop seating.', 'Wood-fired Pizza', 600),
  R('pushkar', 'Honey Dew Cafe', 'Main Market', 'Relaxed cafe serving Indian and international vegetarian food near the lake.', 'Falafel Plate', 500),
  R('pushkar', 'Out Of The Blue', 'Main Market', 'Rooftop restaurant with lake views and a broad vegetarian menu.', 'Paneer Tikka', 600),

  R('ahmedabad', 'Agashiye', 'Old City', 'Rooftop heritage haveli restaurant serving an elaborate traditional Gujarati thali.', 'Gujarati Thali', 1200),
  R('ahmedabad', 'Manek Chowk Food Street', 'Manek Chowk', 'Night-time street-food hub packed with local snacks, sandwiches, sweets and desserts.', 'Chocolate Sandwich', 300),
  R('ahmedabad', 'Das Khaman', 'Navrangpura', 'Popular local snack shop known for soft khaman, dhokla and Gujarati farsan.', 'Khaman', 250),
  R('ahmedabad', 'Gordhan Thal', 'SG Highway', 'Popular Gujarati restaurant serving a large traditional thali with rotating dishes.', 'Gujarati Thali', 700),

  R('goa', 'Gunpowder', 'Assagao', 'South Indian coastal cooking in a garden shack.', 'Kerala fish curry', 2000),
  R('kerala', 'Kayees Rahmathulla', 'Mattancherry', 'Biryani counter Anthony Bourdain queued at.', 'Mutton biryani', 500),
  R('hyderabad', 'Paradise', 'Secunderabad', 'The benchmark Hyderabadi dum biryani since 1953.', 'Mutton dum biryani', 900),
  R('bangkok', 'Jay Fai', 'Phra Nakhon', 'Michelin-starred street wok cooked over charcoal.', 'Crab omelette', 4000),
];

const S = (cityId, name, tier, type, area, pricePerNight) => ({ cityId, name, tier, type, area, pricePerNight });

export const STAYS = [
  S('jaipur', 'Zostel Jaipur', 'budget', 'Hostel', 'Bani Park', 700),
  S('jaipur', 'Hotel Pearl Palace', 'mid', 'Boutique', 'Hathroi Fort', 3500),
  S('jaipur', 'Rambagh Palace', 'luxury', 'Heritage Palace', 'Bhawani Singh Rd', 45000),

  S('delhi', 'Madpackers Hostel', 'budget', 'Hostel', 'Hauz Khas', 900),
  S('delhi', 'Bloomrooms @ New Delhi', 'mid', 'Boutique', 'Paharganj', 3800),
  S('delhi', 'The Imperial', 'luxury', 'Heritage', 'Janpath', 32000),

  S('kolkata', 'Gostops Kolkata', 'budget', 'Hostel', 'Park Street', 900),
  S('kolkata', 'The Lindsay', 'mid', 'Boutique', 'New Market', 3500),
  S('kolkata', 'The Oberoi Grand', 'luxury', 'Heritage', 'Esplanade', 18000),

  S('chennai', 'Zostel Chennai', 'budget', 'Hostel', 'Nungambakkam', 900),
  S('chennai', 'The Residency Towers', 'mid', 'Boutique', 'T. Nagar', 5500),
  S('chennai', 'ITC Grand Chola', 'luxury', 'Palace Hotel', 'Guindy', 18000),

  S('mysuru', 'Roambay Hostel', 'budget', 'Hostel', 'Vijayanagar', 800),
  S('mysuru', 'Radisson Blu Plaza Hotel Mysore', 'mid', 'Boutique', 'MG Road', 6000),
  S('mysuru', 'The Windflower Resorts & Spa', 'luxury', 'Resort', 'Mysuru', 10000),

  S('pushkar', 'Madpackers Pushkar', 'budget', 'Hostel', 'Brahma Temple Area', 800),
  S('pushkar', 'Hotel Pushkar Palace', 'mid', 'Heritage', 'Lake Road', 4500),
  S('pushkar', 'Ananta Spa & Resort', 'luxury', 'Resort', 'Pushkar Bypass', 9000),

  S('ahmedabad', 'The Hosteller Ahmedabad', 'budget', 'Hostel', 'Navrangpura', 800),
  S('ahmedabad', 'The House of MG', 'mid', 'Heritage', 'Old City', 6000),
  S('ahmedabad', 'Hyatt Regency Ahmedabad', 'luxury', 'Business', 'Ashram Road', 9000),

  S('agra', 'Joey\'s Hostel', 'budget', 'Hostel', 'Taj Ganj', 650),
  S('agra', 'Hotel Taj Resorts', 'mid', 'Hotel', 'Taj South Gate', 3200),
  S('agra', 'Oberoi Amarvilas', 'luxury', 'Resort', 'Taj East Gate', 70000),

  S('udaipur', 'Bunkyard Hostel', 'budget', 'Hostel', 'Hanuman Ghat', 800),
  S('udaipur', 'Jagat Niwas Palace', 'mid', 'Haveli', 'Lal Ghat', 6000),
  S('udaipur', 'Taj Lake Palace', 'luxury', 'Island Palace', 'Lake Pichola', 85000),

  S('goa', 'The Hosteller', 'budget', 'Hostel', 'Anjuna', 800),
  S('goa', 'Coconut Creek', 'mid', 'Resort', 'Bogmalo', 6500),

  S('kerala', 'Zostel Alleppey', 'budget', 'Hostel', 'Alleppey', 750),
  S('kerala', 'Xandari Riverscapes', 'mid', 'Houseboat', 'Backwaters', 9000),

  S('allahabad', 'Kumbh Riverside Camp', 'budget', 'Camp/Hostel', 'Sangam Area', 700),
  S('allahabad', 'Hotel Kanha Shyam', 'mid', 'Hotel', 'Civil Lines', 3800),
  S('allahabad', 'The Legend Hotel', 'luxury', 'Boutique Hotel', 'Civil Lines', 8500),
];

const T = (cityId, mode, costRange, timeEstimate, note) => ({ cityId, mode, costRange, timeEstimate, note });

export const TRANSPORT = [
  T('jaipur', 'Auto-rickshaw', '₹50–150 per hop', '10–25 min', 'Agree the fare before starting; meters are rare.'),
  T('jaipur', 'App cab (Uber/Ola)', '₹120–400', '15–30 min', 'Reliable option for Amber Fort and longer cross-city trips.'),
  T('jaipur', 'Full-day taxi', '₹1,800–2,500/day', '8 hours', 'Best value if doing Amber + Nahargarh + city sights in one day.'),
  T('jaipur', 'Metro (Pink Line)', '₹6–20', '5–15 min', 'Useful along the Mansarovar–Chandpole corridor.'),

  T('delhi', 'Delhi Metro', '₹10–60', '15–45 min', 'Fastest way across the city; avoid the busiest peak periods when possible.'),
  T('delhi', 'Auto-rickshaw', '₹40–200', '10–30 min', 'Insist on the meter or use an app.'),
  T('delhi', 'App cab', '₹150–600', '20–50 min', 'Traffic-dependent; metro usually wins for central city trips.'),
  T('delhi', 'Airport Express', '₹60–80', '20 min', 'Fast connection between New Delhi and Terminal 3.'),

  T('kolkata', 'Kolkata Metro', '₹5–30', '15–40 min', 'Fast, cheap way across the city and useful for avoiding heavy road traffic.'),
  T('kolkata', 'Yellow Taxi', '₹100–300', '20–45 min', 'Iconic yellow cabs; confirm the fare or ask for the meter before leaving.'),
  T('kolkata', 'App cab', '₹150–600', '20–50 min', 'Convenient for airport transfers and longer cross-city journeys.'),
  T('kolkata', 'Tram', '₹10–30', '20–60 min', "Slow but atmospheric way to experience one of India's surviving tram networks."),

  T('chennai', 'Chennai Metro', '₹10–60', '15–40 min', 'Fast option for major parts of the city and useful for avoiding peak-hour traffic.'),
  T('chennai', 'MTC Bus', '₹10–40', '20–60 min', 'Large city bus network covering areas beyond the metro lines.'),
  T('chennai', 'App cab', '₹150–450', '15–40 min', 'Convenient for airport trips and longer journeys.'),
  T('chennai', 'Auto-rickshaw', '₹50–250', '10–30 min', 'Useful for short distances; confirm the fare or use an app before starting.'),

  T('mysuru', 'App cab', '₹100–350', '10–30 min', 'Convenient and reliable for getting between the palace, markets and Chamundi Hill.'),
  T('mysuru', 'Auto-rickshaw', '₹50–200', '10–25 min', 'Good for short city trips; agree on the fare before starting.'),
  T('mysuru', 'City Bus', '₹10–40', '20–60 min', 'Budget-friendly network connecting the main city areas and tourist stops.'),
  T('mysuru', 'Rental scooter', '₹400–700/day', 'flexible', 'Useful for independent sightseeing if you are comfortable riding in city traffic.'),

  T('pushkar', 'Cycle rental', '₹100–200/day', 'flexible', 'The town is compact and easy to explore by bicycle without relying on cabs.'),
  T('pushkar', 'Auto-rickshaw', '₹50–200', '10–20 min', 'Useful for the bus stand, nearby Ajmer and places outside the old town.'),
  T('pushkar', 'App cab', '₹200–500', '20–40 min', 'Useful mainly for airport, railway station and Ajmer transfers.'),
  T('pushkar', 'Walking', 'Free', 'flexible', 'Best way to explore the ghats, temples, bazaars and narrow old-town lanes.'),

  T('ahmedabad', 'Janmarg BRTS', '₹10–30', '15–40 min', 'Dedicated bus corridors connect many important tourist and commercial areas.'),
  T('ahmedabad', 'Ahmedabad Metro', '₹10–50', '15–45 min', 'Useful for avoiding road traffic on major north-south and east-west corridors.'),
  T('ahmedabad', 'Auto-rickshaw', '₹50–250', '10–30 min', 'Good for short trips; confirm the fare or use a metered/app option.'),
  T('ahmedabad', 'App cab', '₹150–600', '15–50 min', 'Convenient for longer city journeys and trips to the airport or Adalaj.'),

  T('agra', 'Battery bus / e-rickshaw', '₹10–50', '5–15 min', 'Mandatory for the last 500 m to the Taj gates.'),
  T('agra', 'Gatimaan Express (from Delhi)', '₹800–1,600', '100 min', 'India\'s fastest train; ideal for a day trip.'),
  T('agra', 'Full-day taxi', '₹2,000', '8 hours', 'Covers Taj, Fort and Fatehpur Sikri comfortably.'),

  T('udaipur', 'Auto-rickshaw', '₹60–200', '10–20 min', 'Old city lanes are walkable — use autos for Sajjangarh.'),
  T('goa', 'Scooter rental', '₹400–600/day', 'anywhere', 'The only sensible way to move; carry your licence.'),
  T('kerala', 'Ferry (Kochi)', '₹4–40', '20–30 min', 'Fort Kochi to Ernakulam beats the road every time.'),

  T('allahabad', 'E-Rickshaw', '₹10–40', '10–25 min', 'Best way to navigate Civil Lines and Old City lanes.'),
  T('allahabad', 'Sangam Boat Ride', '₹150–500', '30–60 min', 'Hand-rowed wooden boats to reach the confluence point.'),
  T('allahabad', 'App cab (Ola/Uber)', '₹100–350', '15–35 min', 'Fastest way from Prayagraj Junction to hotels or airport.'),
];

const M = (cityId, name, specialty, bestFor, haggle = true) => ({ cityId, name, specialty, bestFor, haggle });

export const MARKETS = [
  M('jaipur', 'Johari Bazaar', 'Gems & Traditional Jewellery', 'Best for Kundan, meenakari and loose stones.'),
  M('jaipur', 'Bapu Bazaar', 'Textiles & Juttis', 'Best for block prints, mojris and traditional textiles.'),
  M('jaipur', 'Tripolia Bazaar', 'Lac Bangles & Ironware', 'Best for lac bangles and traditional household goods.'),

  M('delhi', 'Chandni Chowk', 'Wedding Wear & Spices', 'Best for silk sarees, spices, silver jewellery and Indian sweets.'),
  M('delhi', 'Dilli Haat (INA)', 'Pan-India Crafts', 'Best for state-wise handicrafts, textiles and regional products.'),
  M('delhi', 'Sarojini Nagar', 'Export-Surplus Fashion', 'Best for budget fashion, accessories and bargain hunting.'),

  M('kolkata', 'New Market', 'Colonial Bazaar & Food', 'Best for textiles, leather goods, sweets, flowers and everyday shopping.'),
  M('kolkata', 'Gariahat Market', 'Textiles & Handicrafts', 'Best for Bengali sarees, handicrafts, jewellery and street shopping.'),
  M('kolkata', 'College Street', 'Books & Stationery', 'Best for second-hand books, academic texts and vintage editions.'),

  M('chennai', 'T. Nagar', 'Silk Sarees & Gold', 'Best for Kanchipuram silk sarees, jewellery and traditional shopping.'),
  M('chennai', 'George Town', 'Wholesale & Traditional Goods', 'Best for spices, textiles, stationery and wholesale shopping.'),
  M('chennai', 'Pondy Bazaar', 'Fashion & Street Shopping', 'Best for clothing, accessories, footwear and affordable local shopping.'),

  M('mysuru', 'Devaraja Market', 'Flowers, Spices & Sandalwood', 'Best for fresh flowers, spices, incense, fruits and traditional Mysuru products.'),
  M('mysuru', 'KR Market', 'Produce & Local Goods', 'Best for local produce, flowers, household goods and everyday shopping.'),
  M('mysuru', 'Mall of Mysore', 'Modern Retail', 'Best for air-conditioned shopping, fashion, food and mainstream brands.'),

  M('pushkar', 'Pushkar Bazaar', 'Textiles & Handicrafts', 'Best for embroidered textiles, bags, jewellery, leather goods and souvenirs.'),
  M('pushkar', 'Sadar Bazaar', 'Boho Fashion & Souvenirs', 'Best for colourful clothing, accessories, spiritual items and traveller-oriented goods.'),
  M('pushkar', 'Old Market', 'Spices & Local Goods', 'Best for spices, sweets, small handicrafts and everyday local shopping.'),

  M('ahmedabad', 'Law Garden Night Market', 'Textiles & Handicrafts', 'Best for mirror-work clothing, Gujarati textiles, jewellery and handicrafts.'),
  M('ahmedabad', 'Manek Chowk', 'Jewellery & Street Food', 'Best for jewellery shopping by day and street food after dark.'),
  M('ahmedabad', 'Dhalgarwad', 'Traditional Textiles', 'Best for Gujarati fabrics, dress materials, sarees and traditional clothing.'),

  M('agra', 'Sadar Bazaar', 'Leather & Petha', 'Shoes, bags and boxes of kesar petha.'),
  M('agra', 'Kinari Bazaar', 'Marble Inlay', 'Pietra dura coasters and tabletops.'),
  M('udaipur', 'Hathi Pol Bazaar', 'Miniature Painting', 'Mewar-school art on silk and paper.'),
  M('varanasi', 'Vishwanath Gali', 'Banarasi Silk', 'Handloom saris and brocade.'),
  M('goa', 'Anjuna Flea Market', 'Boho & Beachwear', 'Wednesdays only; bargain hard.'),
  M('kerala', 'Jew Town, Mattancherry', 'Spices & Antiques', 'Cardamom, pepper and colonial furniture.'),
  M('allahabad', 'Chowk Allahabad', 'Brassware & Religious Items', 'Traditional spices, incense, brass idols and street food.'),
  M('allahabad', 'Civil Lines Market', 'Handicrafts & Books', 'Modern high street, colonial bookshops, and sweet shops.'),
];

export const FOOD_SPECIALTIES = {
  jaipur: [
    { dish: 'Dal Baati Churma', where: 'Laxmi Misthan Bhandar (LMB)', note: 'Baked wheat balls drowned in ghee, with sweet churma.' },
    { dish: 'Pyaaz Kachori', where: 'Rawat Misthan Bhandar', note: 'Onion-stuffed and fried; eat it hot, standing.' },
    { dish: 'Laal Maas', where: 'Handi Restaurant / Suvarna Mahal', note: 'Fiery Mathania-chilli mutton curry.' },
  ],
  delhi: [
    { dish: 'Mutton Burra', where: "Karim's", note: 'Slow-cooked overnight; famous Old Delhi tandoori.' },
    { dish: 'Dal Bukhara', where: 'Bukhara (ITC Maurya)', note: 'Slow-simmered black lentils cooked for 18 hours.' },
    { dish: 'Butter Chicken', where: 'Moti Mahal, Daryaganj', note: 'Invented here in the 1940s.' },
    { dish: 'Rabri Paratha', where: 'Paranthe Wali Gali', note: 'Crisp deep-fried parathas served with sweet rabri.' },
  ],
  kolkata: [
    { dish: 'Chelo Kebab', where: 'Peter Cat', note: 'Iconic buttered rice with grilled mutton seekh and chicken kebabs.' },
    { dish: 'Kosha Mangsho', where: '6 Ballygunge Place', note: 'Rich, slow-cooked Bengali spiced mutton curry.' },
    { dish: 'Daab Chingri', where: 'Kasturi', note: 'Prawns cooked in mustard paste inside a tender coconut.' },
    { dish: 'Baked Rasgulla', where: 'Balaram Mullick', note: 'Warm caramelised baked cottage-cheese dumplings.' },
  ],
  chennai: [
    { dish: 'Podi Idli', where: 'Murugan Idli Shop', note: 'Steamed rice cakes tossed in spiced gun powder and ghee.' },
    { dish: 'Masala Dosa', where: 'Saravana Bhavan', note: 'Crispy fermented crepe filled with spiced potato masala.' },
    { dish: 'Chicken 65', where: 'Buhari Hotel', note: 'Original deep-fried spicy red chicken created in 1965.' },
    { dish: 'Sambar Idli', where: 'Ratna Cafe', note: 'Idlis completely submerged in piping hot signature sambar.' },
  ],
  mysuru: [
    { dish: 'Mysore Masala Dosa', where: 'Vinayaka Mylari', note: 'Soft, buttery dosa with secret red paste filling.' },
    { dish: 'Chicken Biryani', where: 'RRR Restaurant', note: 'Spicy Andhra-style biryani served on plantain leaves.' },
    { dish: 'Mutton Biryani', where: 'Hotel Hanumanthu', note: 'Traditional woodfire pulao-style mutton delicacy.' },
  ],
  pushkar: [
    { dish: 'Rajasthani Thali', where: 'Sixth Sense Rooftop', note: 'Traditional platter of gatte ki sabzi, dal, baati and rotis.' },
    { dish: 'Wood-fired Pizza', where: 'La Pizzeria', note: 'Fresh thin-crust Italian pizza in a garden courtyard.' },
    { dish: 'Falafel Plate', where: 'Honey Dew Cafe', note: 'Fresh pita, hummus, tahini and crisp chickpea patties.' },
  ],
  ahmedabad: [
    { dish: 'Gujarati Thali', where: 'Agashiye / Gordhan Thal', note: 'Unlimited spread of farsan, kathol, rotlis and desserts.' },
    { dish: 'Chocolate Sandwich', where: 'Manek Chowk Food Street', note: 'Decadent grilled sandwich loaded with chocolate and cheese.' },
    { dish: 'Khaman', where: 'Das Khaman', note: 'Steamed, spongy chickpea cakes garnished with mustard and coriander.' },
  ],
  agra: [
    { dish: 'Petha', where: 'Panchhi Petha Store', note: 'Ash-gourd candy — try the kesar and paan versions.' },
    { dish: 'Mughlai Thali', where: 'Pinch of Spice', note: 'Korma, biryani and sheermal in one tray.' },
    { dish: 'Bedai & Jalebi', where: 'Deviram Sweets', note: 'The classic Agra breakfast.' },
  ],
  allahabad: [
    { dish: 'Allahabadi Guava & Chaat', where: 'Loknath Galli', note: 'Red-fleshed local guavas and spicy tamatar chaat.' },
    { dish: 'Poori Sabzi & Jalebi', where: 'Netram Mulchand', note: 'Morning breakfast with hing aloo and crisp jalebi.' },
    { dish: 'Allahabadi Tehri', where: 'Chowk Kitchens', note: 'Fragrant turmeric-infused spiced vegetable rice with local mustard oil.' },
  ],
};

// ---- Itinerary generator ---------------------------------------------------
const SLOTS = ['Morning', 'Afternoon', 'Lunch', 'Evening', 'Night'];

export function generateItinerary(cityIds, durationDays, budgetTier) {
  const days = [];
  const perCity = Math.max(1, Math.round(durationDays / cityIds.length));
  let dayNo = 1;
  cityIds.forEach((cityId, ci) => {
    const pois = POIS.filter((p) => p.cityId === cityId);
    const rests = RESTAURANTS.filter((r) => r.cityId === cityId);
    const markets = MARKETS.filter((m) => m.cityId === cityId);
    const nDays = ci === cityIds.length - 1 ? durationDays - (dayNo - 1) : perCity;
    for (let d = 0; d < nDays && dayNo <= durationDays; d++, dayNo++) {
      const items = SLOTS.map((slot, si) => {
        if (slot === 'Lunch' || slot === 'Night') {
          const r = rests[(d * 2 + (slot === 'Night' ? 1 : 0)) % Math.max(1, rests.length)];
          if (!r) return null;
          return { id: `${dayNo}-${slot}`, slot: slot === 'Night' ? 'Dinner' : 'Lunch', kind: 'food',
            name: r.name, tag: r.area, description: r.description, mustTry: r.mustTry, price: r.priceForTwo, priceLabel: `₹${r.priceForTwo}` };
        }
        if (slot === 'Evening' && markets.length && d % 2 === 0) {
          const m = markets[d % markets.length];
          return { id: `${dayNo}-${slot}`, slot, kind: 'market', name: m.name, tag: m.specialty, description: m.bestFor, price: 0, priceLabel: 'Free' };
        }
        const idx = (d * 3 + si) % Math.max(1, pois.length);
        const p = pois[idx];
        if (!p) return null;
        return { id: `${dayNo}-${slot}`, slot, kind: 'poi', name: p.name, tag: p.category,
          description: p.description, price: p.price, priceLabel: p.price ? `₹${p.price}` : 'Free', rating: p.rating };
      }).filter(Boolean);
      days.push({ day: dayNo, cityId, items });
    }
  });
  return days;
}

export const TIER_LABEL = { budget: 'Budget', mid: 'Mid', luxury: 'Luxury' };
export const TIER_SYMBOL = { budget: '$', mid: '$$', luxury: '$$$' };

export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

// Rough inter-city transit hours for the route builder
export function transitHours(a, b) {
  const ca = cityById(a), cb = cityById(b);
  if (!ca || !cb) return 0;
  if (ca.country !== cb.country) return 8;
  return 4;
}

export const GUIDE_REPLIES = [
  (city) => `For a first day in ${city}, start early — most heritage sites open at sunrise and the light (and the crowds) are far better before 9am.`,
  (city) => `Getting around ${city}: use an app cab for anything over 3 km and autos for short hops. Always agree the auto fare up front.`,
  (city) => `Budget tip for ${city}: eating where the queue is local rather than touristy typically halves your food spend without losing anything.`,
  (city) => `Safety in ${city} is generally fine, but keep cash in two places, avoid unmarked "government emporium" detours, and save your hotel's address in the local script.`,
];

// Builds "search on X" links for a hotel using its name + city, rather than
// guessing at a specific listing URL (which could point to the wrong hotel
// or a dead page). These are all confirmed generic search-query patterns.
export function buildHotelLinks(hotelName, cityName) {
  const q = encodeURIComponent(`${hotelName} ${cityName}`);
  return [
    {
      label: 'Booking.com',
      url: `https://www.booking.com/searchresults.html?ss=${q}`,
    },
    {
      label: 'Google Hotels',
      url: `https://www.google.com/travel/hotels?q=${q}`,
    },
    {
      label: 'Tripadvisor',
      url: `https://www.tripadvisor.com/Search?q=${q}`,
    },
    {
      // MakeMyTrip's real search URLs need internal city/property codes we
      // don't have, so this searches Google scoped to their site instead of
      // guessing a link that might be wrong.
      label: 'MakeMyTrip',
      url: `https://www.google.com/search?q=site:makemytrip.com+${q}`,
    },
  ];
}

