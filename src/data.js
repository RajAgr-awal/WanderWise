// WanderWise mock data (v0 — no backend, per PRD §5)

const img = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const PHOTOS = {
  jaipur: img('1477587458883-47145ed94245'),
  delhi: img('1587474260584-136574528ed5'),
  mumbai: img('1529253355930-ddbe423a2ac7'),
  goa: img('1512343879784-a960bf40e7f2'),
  udaipur: img('1609920658906-8223bd289001'),
  varanasi: img('1561361513-2d000a50f0dc'),
  agra: img('1564507592333-c60657eea523'),
  kolkata: img('1558431382-27e303142255'),
  kerala: img('1602216056096-3b40cc0c9944'),
  kashmir: img('1566323834-3a5b1e5c8b46'),
  chennai: img('1582510003544-4d00b7f74220'),
  mysuru: img('1600100397608-f010d1e63d43'),
  pushkar: img('1524492412937-b28074a5d7da'),
  ahmedabad: img('1621996346565-e3dbc646d9a9'),
  puri: img('1590050752117-238cb0fb12b1'),
  pune: img('1567157577867-05ccb1388e66'),
  hyderabad: img('1600100397608-f010d1e63d43'),
  darjeeling: img('1544735716-392fe2489ffa'),
  shimla: img('1626621341517-bbf3d9990a23'),
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
  P('jaipur', 'Amber Fort', 'Heritage', 'Hilltop sandstone & marble fort with Sheesh Mahal mirror palace.', 600, 4.7),
  P('jaipur', 'Hawa Mahal', 'Heritage', "The 'Palace of Winds' — 953 tiny windows in a honeycomb facade.", 200, 4.5),
  P('jaipur', 'City Palace', 'Heritage', 'Still-royal residence with courtyards, textiles and armoury museums.', 700, 4.6),
  P('jaipur', 'Jantar Mantar', 'Heritage', 'UNESCO observatory with the world\'s largest stone sundial.', 200, 4.4),
  P('jaipur', 'Johari Bazaar', 'Market', 'Gems, kundan jewellery and traditional Rajasthani textiles.', 0, 4.3),
  P('jaipur', 'Nahargarh Fort', 'Viewpoint', 'Sunset over the whole pink grid from the Aravalli ridge.', 200, 4.6),
  P('jaipur', 'Chokhi Dhani', 'Experience', 'Village-themed evening of folk dance, puppets and thali dinner.', 1100, 4.2),
  P('jaipur', 'Panna Meena ka Kund', 'Heritage', 'Symmetrical 16th-century stepwell near Amber.', 0, 4.5),

  P('delhi', 'Red Fort', 'Heritage', "Shah Jahan's walled palace-city in Mughal red sandstone.", 550, 4.5),
  P('delhi', 'Qutub Minar', 'Heritage', "73 m victory tower from 1193 and India's first mosque complex.", 550, 4.6),
  P('delhi', "Humayun's Tomb", 'Heritage', 'The garden tomb that became the blueprint for the Taj Mahal.', 550, 4.7),
  P('delhi', 'India Gate', 'Monument', 'War memorial arch anchoring the Kartavya Path lawns.', 0, 4.6),
  P('delhi', 'Lotus Temple', 'Spiritual', 'Bahá\'í house of worship shaped as a 27-petal marble lotus.', 0, 4.5),
  P('delhi', 'Jama Masjid', 'Spiritual', "India's largest mosque, overlooking Chandni Chowk.", 0, 4.5),
  P('delhi', 'Hauz Khas Village', 'Experience', 'Medieval reservoir ruins ringed by bars and design shops.', 0, 4.2),
  P('delhi', 'Akshardham', 'Spiritual', 'Vast carved-stone temple complex with an evening water show.', 170, 4.7),

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

  P('kolkata', 'Victoria Memorial', 'Heritage', 'Marble monument to British India housing a sprawling colonial-era museum.', 30, 4.6),
  P('kolkata', 'Howrah Bridge', 'Landmark', 'Cantilever bridge over the Hooghly — busiest of its kind in the world.', 0, 4.5),
  P('kolkata', 'Dakshineswar Kali Temple', 'Spiritual', 'Riverside temple linked to the mystic Ramakrishna Paramahansa.', 0, 4.6),
  P('kolkata', 'College Street', 'Market', "Asia's largest second-hand book market, running for over a kilometre.", 0, 4.4),
  P('kolkata', 'Indian Museum', 'Heritage', "India's oldest and largest museum, since 1814.", 50, 4.3),

  P('chennai', 'Kapaleeshwarar Temple', 'Spiritual', 'Dravidian-style temple with a towering painted gopuram in Mylapore.', 0, 4.7),
  P('chennai', 'Marina Beach', 'Beach', "One of the world's longest urban beaches, busy at sunrise and sunset.", 0, 4.4),
  P('chennai', 'Fort St. George', 'Heritage', 'First English fortress in India, built in 1644.', 30, 4.3),
  P('chennai', 'Mahabalipuram Shore Temple', 'Heritage', 'UNESCO-listed 7th-century granite temple facing the Bay of Bengal.', 40, 4.6),

  P('mysuru', 'Mysore Palace', 'Heritage', 'Indo-Saracenic royal palace, lit with 100,000 bulbs on Sunday nights.', 70, 4.8),
  P('mysuru', 'Chamundi Hill', 'Viewpoint', 'Hilltop temple and city panorama, reached by 1,000 stone steps or road.', 0, 4.5),
  P('mysuru', 'Devaraja Market', 'Market', 'Century-old market piled with flowers, spices and sandalwood.', 0, 4.4),

  P('pushkar', 'Pushkar Lake', 'Spiritual', 'Holy lake ringed by 52 bathing ghats and 500 temples.', 0, 4.6),
  P('pushkar', 'Brahma Temple', 'Spiritual', 'One of the very few temples on earth dedicated to Brahma.', 0, 4.5),
  P('pushkar', 'Savitri Temple Viewpoint', 'Viewpoint', 'Ropeway or hilltop hike above the lake for sunset views.', 100, 4.5),

  P('ahmedabad', 'Sabarmati Ashram', 'Heritage', "Gandhi's riverside home and independence-movement headquarters.", 0, 4.7),
  P('ahmedabad', 'Adalaj Stepwell', 'Heritage', 'Five-storey carved stepwell from 1499.', 0, 4.6),
  P('ahmedabad', 'Sidi Saiyyed Mosque', 'Heritage', 'Famous for its intricately carved stone jaali windows.', 0, 4.5),
  P('ahmedabad', 'Manek Chowk', 'Market', 'Jewellery market by day, street-food night market after dark.', 0, 4.5),
];

const R = (cityId, name, area, description, mustTry, priceForTwo) => ({ cityId, name, area, description, mustTry, priceForTwo });

export const RESTAURANTS = [
  R('jaipur', 'Laxmi Misthan Bhandar (LMB)', 'Johari Bazaar', 'Iconic 1727 sweet shop and thali joint.', 'Dal Baati Churma', 800),
  R('jaipur', 'Rawat Mishtan Bhandar', 'Station Road', 'Cash-only institution, always packed with locals.', 'Pyaaz kachori', 400),
  R('jaipur', 'Suvarna Mahal', 'Rambagh Palace', "Royal Rajasthani in a maharaja's former dining hall.", 'Laal maas', 7000),
  R('jaipur', 'Handi Restaurant', 'MI Road', 'Smoky tandoor and handi meats since 1980.', 'Handi mutton', 1400),
  R('delhi', 'Karim\'s', 'Jama Masjid', 'Mughlai kitchen run by the same family since 1913.', 'Mutton burra', 900),
  R('delhi', 'Bukhara', 'ITC Maurya', 'North-West Frontier grills; a global top-100 fixture.', 'Dal Bukhara', 8000),
  R('delhi', 'Paranthe Wali Gali', 'Chandni Chowk', 'A lane of fried-paratha stalls, unchanged for a century.', 'Rabri paratha', 300),
  R('delhi', 'Indian Accent', 'Lodhi Road', 'Modern Indian tasting menus, consistently India\'s #1.', 'Daulat ki chaat', 12000),
  R('agra', 'Pinch of Spice', 'Fatehabad Road', 'Reliable upscale Mughlai — great after a long Taj morning.', 'Mughlai thali', 1800),
  R('agra', 'Panchhi Petha Store', 'Sadar Bazaar', "The original 100-year-old petha shop — Agra's iconic ash-gourd sweet.", 'Kesar petha', 300),
  R('agra', 'Esphahan (Oberoi Amarvilas)', 'Taj East Gate', 'Fine-dining Mughlai with a Taj view — the most romantic table in India.', 'Awadhi tasting menu', 12000),
  R('agra', "Joney's Place", 'Taj Ganj', 'Traveler-favorite tiny cafe — everything under ₹200.', 'Banana lassi', 400),
  R('udaipur', 'Ambrai', 'Amet Haveli', 'Lakeside table facing the City Palace lit up at night.', 'Laal maas', 3000),
  R('varanasi', 'Kashi Chat Bhandar', 'Godowlia', 'Legendary tamatar chaat and palak patta chaat.', 'Tamatar chaat', 250),
  R('mumbai', 'Britannia & Co.', 'Ballard Estate', 'Parsi cafe from 1923 with a famous berry pulao.', 'Berry pulao', 1400),
  R('kolkata', 'Peter Cat', 'Park Street', 'Old-school Kolkata institution behind the sizzling Chelo Kebab.', 'Chelo Kebab', 900),
  R('chennai', 'Murugan Idli Shop', 'T. Nagar', 'Soft idlis and podi idlis served on banana leaf since 1978.', 'Podi Idli', 400),
  R('mysuru', 'Vinayaka Mylari', 'Nazarbad', 'The dosa that gave Mysore masala dosa its name — thin, buttery, unique red chutney.', 'Mysore Masala Dosa', 250),
  R('pushkar', 'Sixth Sense Rooftop', 'Near Brahma Temple', 'Rooftop cafe overlooking the lake and ghats.', 'Rajasthani Thali', 500),
  R('ahmedabad', 'Agashiye', 'Old City', 'Rooftop heritage haveli serving a traditional unlimited Gujarati thali.', 'Gujarati Thali', 1200),
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
];

const T = (cityId, mode, costRange, timeEstimate, note) => ({ cityId, mode, costRange, timeEstimate, note });

export const TRANSPORT = [
  T('jaipur', 'Auto-rickshaw', '₹50–150 per hop', '10–25 min', 'Agree the fare before starting; meters are rare.'),
  T('jaipur', 'App cab (Uber/Ola)', '₹120–400', '15–30 min', 'Cheapest reliable option for Amber Fort and back.'),
  T('jaipur', 'Full-day taxi', '₹1,800–2,500/day', '8 hours', 'Best value if you\'re doing Amber + Nahargarh + city in one day.'),
  T('jaipur', 'Metro (Pink Line)', '₹6–20', '5–15 min', 'Only useful along Mansarovar–Chandpole.'),
  T('delhi', 'Delhi Metro', '₹10–60', '15–45 min', 'Fastest way across the city; avoid 9–10am and 6–8pm.'),
  T('delhi', 'Auto-rickshaw', '₹40–200', '10–30 min', 'Insist on the meter or use the app.'),
  T('delhi', 'App cab', '₹150–600', '20–50 min', 'Traffic-dependent; metro usually wins mid-day.'),
  T('delhi', 'Airport Express', '₹60', '20 min', 'New Delhi station to T3 in twenty minutes flat.'),
  T('agra', 'Battery bus / e-rickshaw', '₹10–50', '5–15 min', 'Mandatory for the last 500 m to the Taj gates.'),
  T('agra', 'Gatimaan Express (from Delhi)', '₹800–1,600', '100 min', 'India\'s fastest train; ideal for a day trip.'),
  T('agra', 'Full-day taxi', '₹2,000', '8 hours', 'Covers Taj, Fort and Fatehpur Sikri comfortably.'),
  T('udaipur', 'Auto-rickshaw', '₹60–200', '10–20 min', 'Old city lanes are walkable — use autos for Sajjangarh.'),
  T('goa', 'Scooter rental', '₹400–600/day', 'anywhere', 'The only sensible way to move; carry your licence.'),
  T('kerala', 'Ferry (Kochi)', '₹4–40', '20–30 min', 'Fort Kochi to Ernakulam beats the road every time.'),
  T('kolkata', 'Kolkata Metro', '₹5-30', '15-40 min', 'Fast, cheap way across the city, avoids traffic.'),
  T('kolkata', 'Yellow Taxi', '₹100-300', '20-45 min', 'Iconic Ambassador cabs, agree on fare or ask for the meter.'),
  T('chennai', 'Chennai Metro', '₹10-60', '15-40 min', 'Covers most major sights along the Blue and Green lines.'),
  T('chennai', 'App cab', '₹150-450', '15-40 min', 'Most reliable for Mahabalipuram day trips.'),
  T('mysuru', 'App cab', '₹100-350', '10-30 min', 'Cheapest reliable option around the city.'),
  T('pushkar', 'Cycle rental', '₹100-200/day', 'flexible', 'The whole town is walkable/cyclable, no need for cabs.'),
  T('ahmedabad', 'Janmarg BRTS', '₹10-30', '15-40 min', 'Dedicated bus corridor covering most tourist stops.'),
];

const M = (cityId, name, specialty, bestFor, haggle = true) => ({ cityId, name, specialty, bestFor, haggle });

export const MARKETS = [
  M('jaipur', 'Johari Bazaar', 'Gems & Traditional Jewellery', 'Kundan, meenakari and loose stones.'),
  M('jaipur', 'Bapu Bazaar', 'Textiles & Juttis', 'Block prints, mojris and razai quilts.'),
  M('jaipur', 'Tripolia Bazaar', 'Lac Bangles & Ironware', 'Lakh bangles made while you wait.'),
  M('delhi', 'Chandni Chowk', 'Wedding Wear & Spices', 'Silk sarees, silver jewelry, Indian sweets.'),
  M('delhi', 'Dilli Haat (INA)', 'Pan-India Crafts', 'State-wise handicrafts under one roof.'),
  M('delhi', 'Sarojini Nagar', 'Export-Surplus Fashion', 'Branded seconds at throwaway prices.'),
  M('agra', 'Sadar Bazaar', 'Leather & Petha', 'Shoes, bags and boxes of kesar petha.'),
  M('agra', 'Kinari Bazaar', 'Marble Inlay', 'Pietra dura coasters and tabletops.'),
  M('udaipur', 'Hathi Pol Bazaar', 'Miniature Painting', 'Mewar-school art on silk and paper.'),
  M('varanasi', 'Vishwanath Gali', 'Banarasi Silk', 'Handloom saris and brocade.'),
  M('goa', 'Anjuna Flea Market', 'Boho & Beachwear', 'Wednesdays only; bargain hard.'),
  M('kerala', 'Jew Town, Mattancherry', 'Spices & Antiques', 'Cardamom, pepper and colonial furniture.'),
];

export const FOOD_SPECIALTIES = {
  jaipur: [
    { dish: 'Dal Baati Churma', where: 'Laxmi Misthan Bhandar', note: 'Baked wheat balls drowned in ghee, with sweet churma.' },
    { dish: 'Pyaaz Kachori', where: 'Rawat Mishtan Bhandar', note: 'Onion-stuffed and fried; eat it hot, standing.' },
    { dish: 'Laal Maas', where: 'Handi Restaurant', note: 'Fiery Mathania-chilli mutton curry.' },
    { dish: 'Ghewar', where: 'Sodhani Sweets', note: 'Honeycomb disc soaked in syrup — a Teej season sweet.' },
  ],
  delhi: [
    { dish: 'Butter Chicken', where: 'Moti Mahal, Daryaganj', note: 'Invented here in the 1940s.' },
    { dish: 'Chole Bhature', where: 'Sita Ram Diwan Chand', note: 'The Paharganj benchmark.' },
    { dish: 'Nihari', where: "Karim's", note: 'Slow-cooked overnight; go before 10am.' },
    { dish: 'Daulat ki Chaat', where: 'Chandni Chowk, winter only', note: 'Milk foam set under dew; sold before noon.' },
  ],
  agra: [
    { dish: 'Petha', where: 'Panchhi Petha Store', note: 'Ash-gourd candy — try the kesar and paan versions.' },
    { dish: 'Mughlai Thali', where: 'Pinch of Spice', note: 'Korma, biryani and sheermal in one tray.' },
    { dish: 'Bedai & Jalebi', where: 'Deviram Sweets', note: 'The classic Agra breakfast.' },
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
