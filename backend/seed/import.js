#!/usr/bin/env node
/**
 * WanderWise — Idempotent import for 30 cities (Tier 1/2/3)
 * - Never fabricate prices/hours/ratings/coords/descriptions
 * - Missing = null, confidence low, not verified
 * - Deduplicate, classify kinds, merge by slug
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'data');
const LOG_PATH = path.join(OUTPUT_DIR, 'import-log.json');

// Helpers
const slugify = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const citySlug = (name) => {
  const map = {
    'goa': 'goa',
    'bengaluru': 'bengaluru',
    'visakhapatnam': 'visakhapatnam',
    'mysuru': 'mysuru',
  };
  const slug = slugify(name);
  return map[slug] || slug;
};

const monthMap = {
  january:1, february:2, march:3, april:4, may:5, june:6,
  july:7, august:8, september:9, october:10, november:11, december:12
};

function parseBestMonths(str) {
  if (!str) return [];
  // Normalize en-dash, em-dash to hyphen
  const normalized = str.replace(/[–—]/g, '-');
  const parts = normalized.split(',').map(s=>s.trim()).filter(Boolean);
  const months = new Set();
  for (const part of parts) {
    // part like "October-March" or "September-November"
    const m = part.match(/([A-Za-z]+)\s*-\s*([A-Za-z]+)/);
    if (!m) continue;
    const start = monthMap[m[1].toLowerCase()];
    const end = monthMap[m[2].toLowerCase()];
    if (!start || !end) continue;
    let cur = start;
    while (true) {
      months.add(cur);
      if (cur === end) break;
      cur = cur % 12 + 1;
      // safety prevent infinite
      if (months.size > 12) break;
    }
  }
  return Array.from(months).sort((a,b)=>a-b);
}

function parseWeatherRisks(str) {
  if (!str || str.toLowerCase()==='no') return [];
  return str.split(',').map(s=>s.trim()).filter(Boolean);
}

// Master Rhythm tables
const rhythmMap = {
  // Tier 3
  'udaipur': { morning: 'Palace', afternoon: 'Lake', evening: 'Rooftop dinner', night: 'Heritage hotel' },
  'jodhpur': { morning: 'Fort', afternoon: 'Market', evening: 'Rooftop dinner', night: 'Heritage haveli' },
  'jaisalmer': { morning: 'Fort', afternoon: 'Desert camp', evening: 'Folk performance', night: 'Desert camp' },
  'mysuru': { morning: 'Palace', afternoon: 'Market', evening: 'Gardens', night: 'Heritage hotel' },
  'madurai': { morning: 'Temple darshan', afternoon: 'Rest or bazaar', evening: 'Temple and street food', night: 'Heritage hotel' },
  'rishikesh': { morning: 'Yoga', afternoon: 'Rafting or temple', evening: 'Ganga aarti', night: 'Yoga retreat' },
  'shimla': { morning: 'Toy train or viewpoint', afternoon: 'Mall Road', evening: 'Café', night: 'Heritage hotel' },
  'manali': { morning: 'Valley', afternoon: 'Adventure or café', evening: 'Old Manali café', night: 'Mountain resort' },
  'puri': { morning: 'Temple darshan', afternoon: 'Beach', evening: 'Seafood', night: 'Beach resort' },
  'guwahati': { morning: 'Temple or river cruise', afternoon: 'Silk village or sanctuary', evening: 'Assamese food', night: 'River-view hotel' },
  // Tier 1
  'delhi': { morning: 'Monument and breakfast', afternoon: 'Museum or bazaar', evening: 'Food street and India Gate', night: 'Late-night food' },
  'mumbai': { morning: 'Seafront and breakfast', afternoon: 'Museum or market', evening: 'Marine Drive and food', night: 'Late-night food' },
  'bengaluru': { morning: 'Tiffin and garden', afternoon: 'Market or tech district', evening: 'Breweries and food', night: 'Late-night food' },
  'chennai': { morning: 'Tiffin and temple', afternoon: 'Museum or beach', evening: 'Food street and beach', night: 'Early rest' },
  'hyderabad': { morning: 'Irani chai', afternoon: 'Charminar or Golconda', evening: 'Biryani and kebabs', night: 'Late-night food' },
  'kolkata': { morning: 'Heritage and breakfast', afternoon: 'Museum or market', evening: 'Park Street and riverfront', night: 'Late-night food' },
  'ahmedabad': { morning: 'Heritage walk', afternoon: 'Stepwell or museum', evening: 'Market food', night: 'Early rest' },
  'pune': { morning: 'Fort or temple', afternoon: 'Café or museum', evening: 'Food street', night: 'City hotel' },
  'jaipur': { morning: 'Fort', afternoon: 'Bazaar', evening: 'Rooftop dinner', night: 'Heritage haveli' },
  'goa': { morning: 'Beach', afternoon: 'Café or heritage walk', evening: 'Nightlife or riverfront', night: 'Beach resort' },
  // Tier 2
  'lucknow': { morning: 'Imambara', afternoon: 'Bazaar or Residency', evening: 'Kebab and sheermal', night: 'Heritage hotel' },
  'varanasi': { morning: 'Sunrise boat', afternoon: 'Temple or silk workshop', evening: 'Ganga aarti', night: 'River-view hotel' },
  'agra': { morning: 'Sunrise Taj', afternoon: 'Fort or bazaar', evening: 'Mehtab Bagh', night: 'Heritage hotel' },
  'amritsar': { morning: 'Golden Temple darshan', afternoon: 'Museum or Wagah', evening: 'Langar', night: 'Heritage hotel' },
  'chandigarh': { morning: 'Garden or lake', afternoon: 'Museum or café', evening: 'Sector 17', night: 'City hotel' },
  'kochi': { morning: 'Heritage walk', afternoon: 'Spice market or backwater', evening: 'Marine Drive and seafood', night: 'Heritage hotel' },
  'coimbatore': { morning: 'Temple or wellness', afternoon: 'Market or hill', evening: 'Food street', night: 'City hotel' },
  'indore': { morning: 'Temple', afternoon: 'Heritage', evening: 'Sarafa food walk', night: 'City hotel' },
  'bhopal': { morning: 'Lake or museum', afternoon: 'Heritage', evening: 'Food street', night: 'Lake-view hotel' },
  'visakhapatnam': { morning: 'Beach', afternoon: 'Araku or caves', evening: 'Seafood', night: 'Beach resort' },
};

// Master Season/Permit
const seasonPermitMap = {
  // Tier3
  'udaipur': { best: 'October–March', permit: 'No', weather: 'Desert heat, dust' },
  'jodhpur': { best: 'October–March', permit: 'No', weather: 'Desert heat, dust' },
  'jaisalmer': { best: 'October–March', permit: 'Desert-camp access rules', weather: 'Desert heat, dust' },
  'mysuru': { best: 'October–March', permit: 'No', weather: 'Summer heat, monsoon rain' },
  'madurai': { best: 'October–March', permit: 'No', weather: 'Summer heat, monsoon rain' },
  'rishikesh': { best: 'September–November, March–May', permit: 'No', weather: 'Monsoon flooding, landslides' },
  'shimla': { best: 'March–June, September–November', permit: 'No', weather: 'Winter snow, landslides' },
  'manali': { best: 'March–June, September–November', permit: 'Rohtang and Atal Tunnel rules', weather: 'Winter snow, landslides' },
  'puri': { best: 'October–March', permit: 'No', weather: 'Cyclones, monsoon flooding' },
  'guwahati': { best: 'October–March', permit: 'No', weather: 'Monsoon flooding, humidity' },
  // Tier1
  'delhi': { best: 'October–March', permit: 'No', weather: 'Winter fog, summer heat' },
  'mumbai': { best: 'October–February', permit: 'No', weather: 'Monsoon flooding, humidity' },
  'bengaluru': { best: 'October–February', permit: 'No', weather: 'Mild weather, occasional rain' },
  'chennai': { best: 'October–March', permit: 'No', weather: 'Cyclones, humidity' },
  'hyderabad': { best: 'October–March', permit: 'No', weather: 'Summer heat' },
  'kolkata': { best: 'October–March', permit: 'No', weather: 'Monsoon flooding, cyclones' },
  'ahmedabad': { best: 'October–March', permit: 'No', weather: 'Extreme summer heat' },
  'pune': { best: 'October–February', permit: 'No', weather: 'Monsoon rain, summer heat' },
  'jaipur': { best: 'October–March', permit: 'No', weather: 'Desert heat, dust' },
  'goa': { best: 'November–February', permit: 'No', weather: 'Monsoon rain, humidity' },
  // Tier2
  'lucknow': { best: 'October–March', permit: 'No', weather: 'Summer heat, winter fog' },
  'varanasi': { best: 'October–March', permit: 'No', weather: 'Summer heat, monsoon flooding' },
  'agra': { best: 'October–March', permit: 'Taj entry ticket', weather: 'Summer heat, winter fog' },
  'amritsar': { best: 'October–March', permit: 'No', weather: 'Summer heat, winter fog' },
  'chandigarh': { best: 'October–March', permit: 'No', weather: 'Summer heat, winter fog' },
  'kochi': { best: 'October–February', permit: 'No', weather: 'Monsoon rain, humidity' },
  'coimbatore': { best: 'October–March', permit: 'No', weather: 'Summer heat, monsoon rain' },
  'indore': { best: 'October–March', permit: 'No', weather: 'Summer heat' },
  'bhopal': { best: 'October–March', permit: 'No', weather: 'Summer heat, monsoon rain' },
  'visakhapatnam': { best: 'October–March', permit: 'No', weather: 'Cyclones, humidity' },
};

// Master Transport lists per city (for transport_options collection)
const masterTransport = {
  'udaipur': [
    'Udaipur airport transfers.',
    'Udaipur railway-station transfers.',
    'Udaipur buses.',
    'Udaipur autos and app cabs.',
    'Udaipur taxis.',
    'Udaipur boats.',
    'Udaipur to Kumbhalgarh taxi.',
    'Udaipur to Ranakpur taxi.',
    'Udaipur to Mount Abu taxi or bus.',
    'Udaipur to Jodhpur bus or taxi.'
  ],
  'jodhpur': [
    'Jodhpur airport transfers.',
    'Jodhpur railway-station transfers.',
    'Jodhpur buses.',
    'Jodhpur autos and app cabs.',
    'Jodhpur taxis.',
    'Jodhpur to Jaisalmer taxi or bus.',
    'Jodhpur to Udaipur bus or taxi.',
    'Jodhpur to Osian taxi.',
    'Jodhpur to Bikaner bus or taxi.'
  ],
  'jaisalmer': [
    'Jaisalmer airport transfers.',
    'Jaisalmer railway-station transfers.',
    'Jaisalmer buses.',
    'Jaisalmer autos and app cabs.',
    'Jaisalmer taxis.',
    'Jaisalmer to Sam taxi.',
    'Jaisalmer to Khuri taxi.',
    'Jaisalmer to Desert National Park taxi.',
    'Jaisalmer to Longewala taxi.'
  ],
  'mysuru': [
    'Mysuru airport transfers.',
    'Mysuru railway-station transfers.',
    'Mysuru buses.',
    'Mysuru autos and app cabs.',
    'Mysuru taxis.',
    'Mysuru to Coorg taxi or bus.',
    'Mysuru to Hampi bus or train.',
    'Mysuru to Bengaluru train or bus.',
    'Mysuru to Nagarhole taxi or bus.'
  ],
  'madurai': [
    'Madurai airport transfers.',
    'Madurai railway-station transfers.',
    'Madurai buses.',
    'Madurai autos and app cabs.',
    'Madurai taxis.',
    'Madurai to Rameswaram bus or taxi.',
    'Madurai to Kodaikanal taxi or bus.',
    'Madurai to Dindigul taxi or bus.',
    'Madurai to Thanjavur bus or taxi.'
  ],
  'rishikesh': [
    'Rishikesh airport transfers.',
    'Rishikesh railway-station transfers.',
    'Rishikesh buses.',
    'Rishikesh autos and app cabs.',
    'Rishikesh taxis.',
    'Rishikesh to Haridwar taxi or bus.',
    'Rishikesh to Dehradun taxi or bus.',
    'Rishikesh to Mussoorie taxi.',
    'Rishikesh to Rajaji taxi.'
  ],
  'shimla': [
    'Shimla airport transfers.',
    'Kalka-Shimla toy train.',
    'Shimla buses.',
    'Shimla local taxis.',
    'Shimla to Kufri taxi.',
    'Shimla to Chail taxi.',
    'Shimla to Solan taxi.',
    'Shimla to Manali bus or taxi.'
  ],
  'manali': [
    'Manali airport transfers.',
    'Manali buses.',
    'Manali local taxis.',
    'Manali rented bikes.',
    'Manali rented cars.',
    'Manali to Solang taxi.',
    'Manali to Rohtang taxi.',
    'Manali to Kasol taxi or bus.',
    'Manali to Spiti taxi or bus.'
  ],
  'puri': [
    'Puri railway-station transfers.',
    'Puri buses.',
    'Puri autos and cycle-rickshaws.',
    'Puri taxis.',
    'Puri rented cycles.',
    'Puri to Konark taxi or bus.',
    'Puri to Bhubaneswar train or taxi.',
    'Puri to Chilika taxi or bus.',
    'Puri to Satapada taxi or boat.'
  ],
  'guwahati': [
    'Guwahati airport transfers.',
    'Guwahati railway-station transfers.',
    'Guwahati buses.',
    'Guwahati autos and app cabs.',
    'Guwahati taxis.',
    'Guwahati river ferries.',
    'Guwahati to Kaziranga taxi or bus.',
    'Guwahati to Shillong taxi or bus.',
    'Guwahati to Cherrapunji taxi or bus.',
    'Guwahati to Majuli ferry or road.'
  ],
  'delhi': [
    'Delhi airport transfers.',
    'Delhi railway-station transfers.',
    'Delhi Metro.',
    'Delhi buses.',
    'Delhi autos and app cabs.',
    'Delhi cycle-rickshaws.',
    'Delhi to Agra train or taxi.',
    'Delhi to Jaipur train or bus.',
    'Delhi to Rishikesh bus or taxi.',
    'Delhi to Shimla bus or taxi.',
    'Delhi to Amritsar train or flight.'
  ],
  'mumbai': [
    'Mumbai airport transfers.',
    'Mumbai railway-station transfers.',
    'Mumbai local trains.',
    'Mumbai Metro.',
    'Mumbai buses.',
    'Mumbai autos and app cabs.',
    'Mumbai ferries.',
    'Mumbai to Elephanta ferry.',
    'Mumbai to Alibaug ferry.',
    'Mumbai to Lonavala train or taxi.',
    'Mumbai to Pune train or taxi.'
  ],
  'bengaluru': [
    'Bengaluru airport transfers.',
    'Bengaluru railway-station transfers.',
    'Namma Metro.',
    'Bengaluru buses.',
    'Bengaluru autos and app cabs.',
    'Bengaluru to Mysuru train or bus.',
    'Bengaluru to Coorg taxi or bus.',
    'Bengaluru to Hampi overnight bus or train.',
    'Bengaluru to Tirupati train or bus.',
    'Bengaluru to Nandi Hills taxi.'
  ],
  'chennai': [
    'Chennai airport transfers.',
    'Chennai railway-station transfers.',
    'Chennai Metro.',
    'Chennai MRTS.',
    'Chennai buses.',
    'Chennai autos and app cabs.',
    'Chennai to Mamallapuram ECR taxi or bus.',
    'Chennai to Kanchipuram bus or taxi.',
    'Chennai to Pondicherry ECR bus or taxi.',
    'Chennai to Tirupati train or bus.'
  ],
  'hyderabad': [
    'Hyderabad airport transfers.',
    'Hyderabad railway-station transfers.',
    'Hyderabad Metro.',
    'Hyderabad buses.',
    'Hyderabad autos and app cabs.',
    'Hyderabad to Warangal train or bus.',
    'Hyderabad to Nagarjunasagar taxi or bus.',
    'Hyderabad to Srisailam bus or taxi.',
    'Hyderabad to Ramappa taxi or bus.'
  ],
  'kolkata': [
    'Kolkata airport transfers.',
    'Howrah and Sealdah station transfers.',
    'Kolkata Metro.',
    'Kolkata trams.',
    'Kolkata taxis and app cabs.',
    'Kolkata autos and cycle-rickshaws.',
    'Kolkata river ferries.',
    'Kolkata to Shantiniketan train.',
    'Kolkata to Bishnupur train or bus.',
    'Kolkata to Sundarbans road-and-boat route.',
    'Kolkata to Darjeeling flight or train to New Jalpaiguri.'
  ],
  'ahmedabad': [
    'Ahmedabad airport transfers.',
    'Ahmedabad railway-station transfers.',
    'Ahmedabad Metro.',
    'Ahmedabad BRTS.',
    'Ahmedabad buses.',
    'Ahmedabad autos and app cabs.',
    'Ahmedabad to Patan taxi or bus.',
    'Ahmedabad to Kutch bus or taxi.',
    'Ahmedabad to Statue of Unity taxi or bus.',
    'Ahmedabad to Dwarka train or bus.'
  ],
  'pune': [
    'Pune airport transfers.',
    'Pune railway-station transfers.',
    'Pune Metro.',
    'Pune buses.',
    'Pune autos and app cabs.',
    'Pune to Lonavala train or taxi.',
    'Pune to Mumbai train or taxi.',
    'Pune to Aurangabad bus or taxi.',
    'Pune to Mahabaleshwar taxi or bus.'
  ],
  'jaipur': [
    'Jaipur airport transfers.',
    'Jaipur railway-station transfers.',
    'Jaipur Metro.',
    'Jaipur buses.',
    'Jaipur autos and app cabs.',
    'Jaipur to Pushkar bus or taxi.',
    'Jaipur to Udaipur train or bus.',
    'Jaipur to Jodhpur train or bus.',
    'Jaipur to Ranthambore taxi or bus.',
    'Jaipur to Agra train or taxi.'
  ],
  'goa': [
    'Goa airport transfers.',
    'Goa railway-station transfers.',
    'Goa buses.',
    'Goa taxis.',
    'Goa rented scooters.',
    'Goa rented cars.',
    'Panaji local buses.',
    'Panaji taxis.',
    'North Goa beach taxis.',
    'South Goa beach taxis.',
    'Old Goa taxis.',
    'Dudhsagar jeep safari.'
  ],
  'lucknow': [
    'Lucknow airport transfers.',
    'Lucknow railway-station transfers.',
    'Lucknow Metro.',
    'Lucknow buses.',
    'Lucknow autos and app cabs.',
    'Lucknow to Ayodhya taxi or train.',
    'Lucknow to Varanasi train or bus.',
    'Lucknow to Kanpur train or bus.',
    'Lucknow to Prayagraj train or bus.'
  ],
  'varanasi': [
    'Varanasi airport transfers.',
    'Varanasi railway-station transfers.',
    'Varanasi local autos.',
    'Varanasi cycle-rickshaws.',
    'Varanasi boat rides.',
    'Varanasi to Sarnath taxi or bus.',
    'Varanasi to Prayagraj train or bus.',
    'Varanasi to Ayodhya train or bus.',
    'Varanasi to Chitrakoot taxi or bus.'
  ],
  'agra': [
    'Agra airport transfers.',
    'Agra railway-station transfers.',
    'Agra local autos.',
    'Agra cycle-rickshaws.',
    'Agra taxis and app cabs.',
    'Agra to Fatehpur Sikri taxi or bus.',
    'Agra to Mathura taxi or bus.',
    'Agra to Delhi train or taxi.',
    'Agra to Jaipur train or bus.'
  ],
  'amritsar': [
    'Amritsar airport transfers.',
    'Amritsar railway-station transfers.',
    'Amritsar local autos.',
    'Amritsar cycle-rickshaws.',
    'Amritsar taxis and app cabs.',
    'Amritsar to Wagah taxi.',
    'Amritsar to Jalandhar train or bus.',
    'Amritsar to Chandigarh train or bus.',
    'Amritsar to Dharamshala bus or taxi.'
  ],
  'chandigarh': [
    'Chandigarh airport transfers.',
    'Chandigarh railway-station transfers.',
    'Chandigarh buses.',
    'Chandigarh autos and app cabs.',
    'Chandigarh taxis.',
    'Chandigarh to Shimla taxi or bus.',
    'Chandigarh to Manali taxi or bus.',
    'Chandigarh to Amritsar train or bus.',
    'Chandigarh to Morni Hills taxi.'
  ],
  'kochi': [
    'Kochi airport transfers.',
    'Kochi railway-station transfers.',
    'Kochi Metro.',
    'Kochi buses.',
    'Kochi autos and app cabs.',
    'Kochi ferries.',
    'Kochi to Alappuzha train or taxi.',
    'Kochi to Munnar taxi or bus.',
    'Kochi to Thekkady taxi or bus.',
    'Kochi to Kumarakom taxi or boat.'
  ],
  'coimbatore': [
    'Coimbatore airport transfers.',
    'Coimbatore railway-station transfers.',
    'Coimbatore buses.',
    'Coimbatore autos and app cabs.',
    'Coimbatore taxis.',
    'Coimbatore to Ooty taxi or bus.',
    'Coimbatore to Valparai taxi or bus.',
    'Coimbatore to Palakkad taxi or bus.',
    'Coimbatore to Madurai train or bus.'
  ],
  'indore': [
    'Indore airport transfers.',
    'Indore railway-station transfers.',
    'Indore Metro.',
    'Indore buses.',
    'Indore autos and app cabs.',
    'Indore to Ujjain taxi or bus.',
    'Indore to Mandu taxi or bus.',
    'Indore to Omkareshwar taxi or bus.',
    'Indore to Bhopal train or bus.'
  ],
  'bhopal': [
    'Bhopal airport transfers.',
    'Bhopal railway-station transfers.',
    'Bhopal Metro.',
    'Bhopal buses.',
    'Bhopal autos and app cabs.',
    'Bhopal to Sanchi taxi or bus.',
    'Bhopal to Bhimbetka taxi or bus.',
    'Bhopal to Pachmarhi taxi or bus.',
    'Bhopal to Ujjain train or bus.'
  ],
  'visakhapatnam': [
    'Visakhapatnam airport transfers.',
    'Visakhapatnam railway-station transfers.',
    'Visakhapatnam buses.',
    'Visakhapatnam autos and app cabs.',
    'Visakhapatnam taxis.',
    'Visakhapatnam to Araku train or taxi.',
    'Visakhapatnam to Borra Caves taxi or bus.',
    'Visakhapatnam to Lambasingi taxi or bus.',
    'Visakhapatnam to Vijayawada train or bus.'
  ],
};

// Tier data
const tier3Cities = [
  {
    city_id: "IN-UDR-T3-001", city: "Udaipur", state_ut: "Rajasthan", region: "North India", tier: 3, travel_rank: 1,
    city_type: "Lake heritage city", best_season: "October–March", core_identity: "Lake Pichola, Rajput palaces, Aravalli hills, crafts and romantic heritage",
    main_pois: ["City Palace","Lake Pichola","Jag Mandir","Lake Palace","Saheliyon ki Bari","Sajjangarh Monsoon Palace","Fateh Sagar Lake","Bagore ki Haveli","Shilpgram","Ahar Cenotaphs"],
    where_to_stay: { budget: "Old city and lake-side guesthouses", mid_range: "Lake Pichola and Fateh Sagar hotels", premium: "Lake Palace and heritage palace hotels" },
    local_transport: { airport: "Maharana Pratap Airport", rail: "Udaipur City Station", metro: "Not available", city: "Autos, taxis, app cabs, boats", nearby: "Buses and taxis to Kumbhalgarh, Ranakpur and Mount Abu" },
    food_anchors: ["Dal baati churma","Laal maas","Ghevar","Rajasthani thali"],
    markets: ["Hathi Pol","Bada Bazaar","Chetak Circle","Sajjan Neel","Shilpgram","Lake Palace Road"],
    seasonal_overlays: ["Mewar Festival","Shilpgram Utsav","Diwali"],
    nearby_destinations: ["Kumbhalgarh","Ranakpur","Mount Abu","Jodhpur","Chittorgarh"],
    local_rhythm: "Morning palace, afternoon lake, evening rooftop dinner", app_tags: ["heritage","lake","palace","romantic","shopping","gateway"]
  },
  {
    city_id: "IN-JDH-T3-002", city: "Jodhpur", state_ut: "Rajasthan", region: "North India", tier: 3, travel_rank: 2,
    city_type: "Blue City heritage capital", best_season: "October–March", core_identity: "Mehrangarh Fort, blue old city, Marwar heritage, spices and desert culture",
    main_pois: ["Mehrangarh Fort","Umaid Bhawan Palace","Jaswant Thada","Clock Tower","Sardar Market","Toorji ka Jhalra","Mandore Gardens","Balsamand Lake","Osian day trip","Rao Jodha Desert Rock Park"],
    where_to_stay: { budget: "Old city and Clock Tower guesthouses", mid_range: "Sardar Market and Umaid Bhawan-side hotels", premium: "Heritage havelis and palace hotels" },
    local_transport: { airport: "Jodhpur Airport", rail: "Jodhpur Junction", metro: "Not available", city: "Autos, taxis, app cabs, rented cars", nearby: "Buses and taxis to Jaisalmer, Udaipur and Osian" },
    food_anchors: ["Mirchi vada","Mawa kachori","Laal maas","Rajasthani thali"],
    markets: ["Sardar Market","Clock Tower Market","Sojati Gate","Nai Sarak","Tripolia Bazaar","Mandore Market"],
    seasonal_overlays: ["Marwar Festival","Diwali","Desert season"], nearby_destinations: ["Jaisalmer","Udaipur","Osian","Pushkar","Bikaner"],
    local_rhythm: "Morning fort, afternoon market, evening rooftop dinner", app_tags: ["heritage","fort","desert","food","shopping","gateway"]
  },
  {
    city_id: "IN-JSA-T3-003", city: "Jaisalmer", state_ut: "Rajasthan", region: "North India", tier: 3, travel_rank: 3,
    city_type: "Desert fort city", best_season: "October–March", core_identity: "Golden Fort, sand dunes, camel safari, desert camps and Rajasthani folk culture",
    main_pois: ["Jaisalmer Fort","Patwon ki Haveli","Salim Singh ki Haveli","Nathmal ki Haveli","Sam Sand Dunes","Khuri Sand Dunes","Desert National Park","Gadisar Lake","Kuldhara","Bada Bagh"],
    where_to_stay: { budget: "Jaisalmer Fort guesthouses", mid_range: "City hotels and desert camps", premium: "Luxury desert camps and heritage hotels" },
    local_transport: { airport: "Jaisalmer Airport", rail: "Jaisalmer Railway Station", metro: "Not available", city: "Autos, taxis, rented cars", nearby: "Road to Sam, Khuri and Desert National Park" },
    food_anchors: ["Dal baati churma","Ker sangri","Laal maas","Rajasthani thali"],
    markets: ["Sadar Bazaar","Sonaron ka Bass","Manak Chowk","Pansari Bazaar","Gandhi Chowk","Desert Camp Market"],
    seasonal_overlays: ["Desert Festival","Diwali","Winter desert"], nearby_destinations: ["Jodhpur","Bikaner","Sam","Khuri","Longewala"],
    local_rhythm: "Morning fort, afternoon desert camp, evening folk performance", app_tags: ["heritage","desert","fort","camel safari","folk","gateway"]
  },
  {
    city_id: "IN-MYQ-T3-004", city: "Mysuru", state_ut: "Karnataka", region: "South India", tier: 3, travel_rank: 4,
    city_type: "Royal heritage city", best_season: "October–March", core_identity: "Wodeyar palace heritage, Dasara, silk, sandalwood and South Indian food",
    main_pois: ["Mysuru Palace","Chamundi Hills","Chamundeshwari Temple","Brindavan Gardens","Mysuru Zoo","Devaraja Market","Mysuru Silk Market","St. Philomena’s Cathedral","Rail Museum","Nagarhole day trip"],
    where_to_stay: { budget: "Devaraja Market and bus-stand guesthouses", mid_range: "City-centre and palace-side hotels", premium: "Heritage hotels and palace-style stays" },
    local_transport: { airport: "Mysuru Airport; Bengaluru Airport is the main gateway", rail: "Mysuru Junction", metro: "Not available", city: "Autos, taxis, buses, rented cars", nearby: "Buses and taxis to Coorg, Hampi and Bengaluru" },
    food_anchors: ["Mysuru masala dosa","Mysuru pak","Filter coffee","South Indian thali"],
    markets: ["Devaraja Market","Mysuru Silk Market","Devaraj Urs Road","Sayyaji Rao Road","Bannimantap","Nagarhole Market"],
    seasonal_overlays: ["Dasara","Ugadi","Palace festival"], nearby_destinations: ["Coorg","Hampi","Bengaluru","Nagarhole","Bandipur"],
    local_rhythm: "Morning palace, afternoon market, evening gardens", app_tags: ["heritage","palace","food","shopping","wildlife","gateway"]
  },
  {
    city_id: "IN-IXM-T3-005", city: "Madurai", state_ut: "Tamil Nadu", region: "South India", tier: 3, travel_rank: 5,
    city_type: "Temple city", best_season: "October–March", core_identity: "Meenakshi Amman Temple, Tamil food culture, ancient bazaars and street food",
    main_pois: ["Meenakshi Amman Temple","Thirumalai Nayakkar Mahal","Gandhi Memorial Museum","Madurai Main Market","Jigarthanda Street","Alagar Kovil","Thiruparankundram Temple","Vandiyur Mariamman Teppakulam","Koodal Azhagar Temple","Pazhamudircholai"],
    where_to_stay: { budget: "Temple-area lodges and West Tower Street guesthouses", mid_range: "Town-centre and Periyar bus-stand hotels", premium: "Heritage-style and business hotels near Meenakshi Temple" },
    local_transport: { airport: "Madurai Airport", rail: "Madurai Junction", metro: "Not available", city: "Autos, taxis, app cabs, buses", nearby: "Buses and taxis to Rameswaram, Kodaikanal, Dindigul and Thanjavur" },
    food_anchors: ["Jigarthanda","Kari dosa","Mutton chukka","Bun parotta","Filter coffee"],
    markets: ["Madurai Main Market","Puthu Mandapam","South Masi Street","North Masi Street","Periyar Bus Stand Market","Jigarthanda Street"],
    seasonal_overlays: ["Chithirai Festival","Pongal","Temple festivals"], nearby_destinations: ["Rameswaram","Kodaikanal","Dindigul","Thanjavur","Kanyakumari"],
    local_rhythm: "Early darshan, afternoon rest, evening temple and street food", app_tags: ["temple","heritage","food","shopping","pilgrimage","gateway"]
  },
  {
    city_id: "IN-RSH-T3-006", city: "Rishikesh", state_ut: "Uttarakhand", region: "North India", tier: 3, travel_rank: 6,
    city_type: "Yoga-adventure town", best_season: "September–November, March–May", core_identity: "Ganga, yoga, ashrams, white-water rafting and Himalayan foothills",
    main_pois: ["Triveni Ghat","Ram Jhula","Lakshman Jhula","Parmarth Niketan","Beatles Ashram","Neelkanth Mahadev Temple","Rajaji National Park","White-water rafting points","Kunjapuri Temple","Waterfall treks"],
    where_to_stay: { budget: "Lakshman Jhula and Tapovan hostels", mid_range: "Tapovan and riverside hotels", premium: "Luxury yoga retreats and riverside resorts" },
    local_transport: { airport: "Dehradun Airport", rail: "Rishikesh Railway Station", metro: "Not available", city: "Autos, taxis, rented scooters, rented bikes", nearby: "Buses and taxis to Haridwar, Dehradun and Mussoorie" },
    food_anchors: ["Aloo puri","Kachori","Sattu","Organic café food","Garhwali thali"],
    markets: ["Lakshman Jhula Market","Ram Jhula Market","Tapovan Market","Rishikesh Main Bazaar","Swarg Ashram","Organic Market"],
    seasonal_overlays: ["International Yoga Festival","Ganga Dussehra","Rafting season"], nearby_destinations: ["Haridwar","Dehradun","Mussoorie","Rajaji","Auli"],
    local_rhythm: "Morning yoga, afternoon rafting or temple, evening Ganga aarti", app_tags: ["yoga","adventure","spiritual","river","food","gateway"]
  },
  {
    city_id: "IN-JLI-T3-007", city: "Shimla", state_ut: "Himachal Pradesh", region: "North India", tier: 3, travel_rank: 7,
    city_type: "Colonial hill station", best_season: "March–June, September–November", core_identity: "Colonial heritage, Mall Road, toy train, snow and Himalayan views",
    main_pois: ["Mall Road","The Ridge","Jakhoo Temple","Kalka-Shimla Toy Train","Kufri","Christ Church","Viceregal Lodge","Annandale","Chail day trip","Naldehra"],
    where_to_stay: { budget: "Mall Road and lower bazaar guesthouses", mid_range: "Mall Road and Ridge-side hotels", premium: "Heritage hotels and mountain-view resorts" },
    local_transport: { airport: "Jubbarhatti Airport, Shimla", rail: "Kalka-Shimla narrow gauge", metro: "Not available", city: "Local taxis, buses, toy train", nearby: "Road from Chandigarh and Delhi" },
    food_anchors: ["Himachali thali","Siddu","Momos","Bakery items"],
    markets: ["Mall Road","Lower Bazaar","Lakkar Bazaar","Tibetan Market","The Ridge","Kufri Market"],
    seasonal_overlays: ["Winter snow","Summer hill season","Apple season"], nearby_destinations: ["Kufri","Chail","Solan","Manali","Kasauli"],
    local_rhythm: "Morning toy train or viewpoint, afternoon Mall Road, evening café", app_tags: ["hill","heritage","toy train","snow","food","gateway"]
  },
  {
    city_id: "IN-MNL-T3-008", city: "Manali", state_ut: "Himachal Pradesh", region: "North India", tier: 3, travel_rank: 8,
    city_type: "Adventure hill station", best_season: "March–June, September–November", core_identity: "Himalayan valley, adventure sports, Old Manali cafés, temples and snow",
    main_pois: ["Hadimba Temple","Old Manali","Mall Road","Solang Valley","Rohtang Pass","Atal Tunnel","Vashisht Hot Springs","Naggar Castle","Jogini Falls","Rahala Falls"],
    where_to_stay: { budget: "Old Manali hostels and guesthouses", mid_range: "Old Manali and Aleo hotels", premium: "Luxury mountain resorts and boutique stays" },
    local_transport: { airport: "Bhuntar Airport, Kullu", rail: "Joginder Nagar or Chandigarh rail access", metro: "Not available", city: "Local taxis, buses, rented bikes, rented cars", nearby: "Road from Delhi, Chandigarh and Shimla" },
    food_anchors: ["Himachali thali","Siddu","Momos","Trout fish","Café food"],
    markets: ["Mall Road","Old Manali Market","Vashisht Market","Manu Market","Aleo Market","Solang Market"],
    seasonal_overlays: ["Winter snow","Summer trekking","Apple season"], nearby_destinations: ["Solang","Rohtang","Kasol","Spiti","Shimla"],
    local_rhythm: "Morning valley, afternoon adventure, evening Old Manali café", app_tags: ["adventure","hill","snow","food","cafés","gateway"]
  },
  {
    city_id: "IN-PUR-T3-009", city: "Puri", state_ut: "Odisha", region: "East India", tier: 3, travel_rank: 9,
    city_type: "Pilgrimage beach city", best_season: "October–March", core_identity: "Jagannath Temple, Mahaprasad, Puri Beach and Rath Yatra",
    main_pois: ["Shree Jagannath Temple","Gundicha Temple","Puri Beach","Puri Golden Beach","Konark Sun Temple","Chandrabhaga Beach","Raghurajpur Artist Village","Chilika Lake","Satapada Dolphin Point","Puri Lighthouse"],
    where_to_stay: { budget: "Temple-area guesthouses and beach lodges", mid_range: "Beach Road and hotel-zone stays", premium: "Beach resorts and heritage-style hotels" },
    local_transport: { airport: "Biju Patnaik International Airport, Bhubaneswar", rail: "Puri Railway Station", metro: "Not available", city: "Autos, cycle-rickshaws, taxis, rented cycles", nearby: "Taxis and buses to Konark, Bhubaneswar and Chilika" },
    food_anchors: ["Mahaprasad","Pakhala","Seafood","Chhena poda"],
    markets: ["Puri Beach Market","Jagannath Temple Market","Swargadwar Market","Chakratirtha Road","Puri Lighthouse Market","Raghurajpur Craft Market"],
    seasonal_overlays: ["Rath Yatra","Kartik Purnima","Beach season"], nearby_destinations: ["Konark","Bhubaneswar","Chilika","Satapada","Raghurajpur"],
    local_rhythm: "Morning darshan, afternoon beach, evening seafood", app_tags: ["temple","beach","pilgrimage","food","heritage","gateway"]
  },
  {
    city_id: "IN-GAU-T3-010", city: "Guwahati", state_ut: "Assam", region: "Northeast India", tier: 3, travel_rank: 10,
    city_type: "River, temple and Northeast gateway", best_season: "October–March", core_identity: "Brahmaputra river, Kamakhya Temple, Assamese culture, tea gardens and Northeast access",
    main_pois: ["Kamakhya Temple","Umananda Island","Brahmaputra River","Assam State Museum","Sualkuchi Silk Village","Hajo","Pobitora Wildlife Sanctuary","Kaziranga day trip","Guwahati Planetarium","Brahmaputra River Cruise"],
    where_to_stay: { budget: "Paltan Bazaar and railway-station guesthouses", mid_range: "GS Road, Zoo Road and Six Mile hotels", premium: "River-view and boutique hotels" },
    local_transport: { airport: "Lokpriya Gopinath Bordoloi International Airport", rail: "Guwahati Railway Station", metro: "Not available", city: "Buses, autos, app cabs, taxis, river ferries", nearby: "Road to Kaziranga, Shillong, Cherrapunji and Tezpur" },
    food_anchors: ["Assamese thali","Masor tenga","Pitha","Tea","Bamboo shoot"],
    markets: ["Paltan Bazaar","Fancy Bazaar","Pan Bazaar","Zoo Road","Six Mile","Sualkuchi Silk Market"],
    seasonal_overlays: ["Bihu","Ambubachi Mela","Tea season"], nearby_destinations: ["Kaziranga","Shillong","Cherrapunji","Tezpur","Majuli"],
    local_rhythm: "Morning temple or river cruise, afternoon silk village or sanctuary, evening Assamese food", app_tags: ["temple","river","heritage","food","wildlife","gateway"]
  }
];

const tier1Cities = [
  {
    city_id: "IN-DEL-001", city: "Delhi", state_ut: "Delhi", region: "North India", tier: 1, travel_rank: 1,
    city_type: "Capital heritage and gateway city", best_season: "October–March", core_identity: "Mughal monuments, colonial boulevards, bazaars, food streets and modern capital energy",
    main_pois: ["Red Fort","Jama Masjid","Qutub Minar","Humayun’s Tomb","India Gate","Rashtrapati Bhavan","Lotus Temple","Lodhi Gardens","Chandni Chowk","Connaught Place","Akshardham Temple","National Museum","Hauz Khas Village","Purana Qila","Raj Ghat"],
    where_to_stay: { budget: "Paharganj, Karol Bagh and Hauz Khas hostels", mid_range: "Connaught Place, Karol Bagh, Saket and Aerocity", premium: "Aerocity, Lutyens’ Delhi and five-star city hotels" },
    local_transport: { airport: "Indira Gandhi International Airport", rail: "New Delhi, Old Delhi, Hazrat Nizamuddin", metro: "Delhi Metro", city: "Metro, buses, autos, app cabs, taxis, cycle-rickshaws", nearby: "Trains and buses to Agra, Jaipur, Rishikesh, Shimla and Amritsar" },
    food_anchors: ["Butter chicken","Chole bhature","Paranthe wali gali","Kebabs","Chaat","Mughlai food"],
    markets: ["Chandni Chowk","Sarojini Nagar","Dilli Haat","Janpath","Karol Bagh","Khan Market"],
    seasonal_overlays: ["Republic Day","Diwali","Holi","Winter fog"], nearby_destinations: ["Agra","Jaipur","Rishikesh","Shimla","Amritsar"],
    local_rhythm: "Morning monument, afternoon bazaar, evening food street", app_tags: ["heritage","food","shopping","museum","gateway","business"]
  },
  {
    city_id: "IN-MUM-002", city: "Mumbai", state_ut: "Maharashtra", region: "West India", tier: 1, travel_rank: 2,
    city_type: "Coastal metro and financial capital", best_season: "October–February", core_identity: "Arabian Sea, colonial heritage, Bollywood, street food and financial-capital energy",
    main_pois: ["Gateway of India","Marine Drive","Elephanta Caves","Chhatrapati Shivaji Maharaj Terminus","Colaba Causeway","Kala Ghoda","Juhu Beach","Bandra-Worli Sea Link","Haji Ali Dargah","Siddhivinayak Temple","Sanjay Gandhi National Park","Global Vipassana Pagoda","Dharavi","Bandra"],
    where_to_stay: { budget: "Colaba, Fort and Bandra hostels and guesthouses", mid_range: "Colaba, Bandra, Andheri and Lower Parel", premium: "Marine Drive, Bandra and Juhu beachfront hotels" },
    local_transport: { airport: "Chhatrapati Shivaji Maharaj International Airport", rail: "Chhatrapati Shivaji Maharaj Terminus, Mumbai Central", metro: "Mumbai Metro", city: "Local trains, metro, buses, autos, app cabs, ferries", nearby: "Trains and buses to Lonavala, Pune, Alibaug and Nashik" },
    food_anchors: ["Vada pav","Pav bhaji","Misal","Seafood","Irani chai","Bhel puri"],
    markets: ["Colaba Causeway","Crawford Market","Linking Road","Fashion Street","Dadar Market","Chor Bazaar"],
    seasonal_overlays: ["Ganesh Chaturthi","Kala Ghoda Festival","Monsoon sea walks"], nearby_destinations: ["Elephanta","Alibaug","Lonavala","Pune","Nashik"],
    local_rhythm: "Morning seafront, afternoon markets, evening Marine Drive", app_tags: ["coastal","heritage","food","shopping","nightlife","business"]
  },
  {
    city_id: "IN-BLR-003", city: "Bengaluru", state_ut: "Karnataka", region: "South India", tier: 1, travel_rank: 3,
    city_type: "Tech, food and garden city", best_season: "October–February", core_identity: "Gardens, breweries, tech culture, South Indian food and heritage markets",
    main_pois: ["Lalbagh Botanical Garden","Cubbon Park","Bangalore Palace","Tipu Sultan’s Summer Palace","KR Market","Commercial Street","UB City","Nandi Hills","VV Puram Food Street","Bangalore Aquarium","Jawaharlal Nehru Planetarium","Innovative Film City"],
    where_to_stay: { budget: "Majestic, Indiranagar and Koramangala hostels", mid_range: "Indiranagar, Koramangala, MG Road and Whitefield", premium: "MG Road, UB City and luxury business hotels" },
    local_transport: { airport: "Kempegowda International Airport", rail: "KSR Bengaluru City Station, Yesvantpur", metro: "Namma Metro", city: "Metro, buses, autos, app cabs, rented cars", nearby: "Trains and buses to Mysuru, Coorg, Hampi and Tirupati" },
    food_anchors: ["Masala dosa","Bisi bele bath","Filter coffee","Craft beer","Street food"],
    markets: ["KR Market","Commercial Street","Chickpet","Jayanagar 4th Block","Malleshwaram Market","UB City"],
    seasonal_overlays: ["Karaga","Ugadi","Bengaluru Habba"], nearby_destinations: ["Mysuru","Coorg","Hampi","Nandi Hills","Tirupati"],
    local_rhythm: "Morning tiffin, afternoon garden or market, evening breweries", app_tags: ["food","nightlife","shopping","parks","business","gateway"]
  },
  {
    city_id: "IN-MAA-004", city: "Chennai", state_ut: "Tamil Nadu", region: "South India", tier: 1, travel_rank: 4,
    city_type: "Coastal cultural metro", best_season: "October–March", core_identity: "Tamil culture, Marina Beach, Dravidian temples, filter coffee and classical arts",
    main_pois: ["Marina Beach","Kapaleeshwarar Temple","San Thome Basilica","Fort St. George","Government Museum","National Art Gallery","Elliot’s Beach","Besant Nagar","Pondy Bazaar","T Nagar","Mylapore","DakshinaChitra","Mahabalipuram day trip"],
    where_to_stay: { budget: "T Nagar, Egmore and Chennai Central guesthouses", mid_range: "T Nagar, Egmore, Adyar and OMR hotels", premium: "Marina-facing, ECR and city-centre hotels" },
    local_transport: { airport: "Chennai International Airport", rail: "Chennai Central, Chennai Egmore", metro: "Chennai Metro", city: "Metro, MRTS, buses, autos, app cabs, taxis", nearby: "Trains and buses to Mamallapuram, Kanchipuram, Pondicherry and Tirupati" },
    food_anchors: ["Idli","Dosa","Filter coffee","Chettinad chicken","Seafood","Tamil thali"],
    markets: ["Pondy Bazaar","T Nagar","George Town","Mylapore Market","Besant Nagar","Phoenix MarketCity"],
    seasonal_overlays: ["Margazhi season","Pongal","Music and dance festival"], nearby_destinations: ["Mamallapuram","Kanchipuram","Pondicherry","Tirupati","Puducherry"],
    local_rhythm: "Morning tiffin and temple, afternoon museum or beach, evening food street", app_tags: ["heritage","beach","food","shopping","temple","gateway"]
  },
  {
    city_id: "IN-HYD-005", city: "Hyderabad", state_ut: "Telangana", region: "South India", tier: 1, travel_rank: 5,
    city_type: "Deccan heritage and business city", best_season: "October–March", core_identity: "Nizam heritage, Charminar, Golconda, biryani, pearls and Deccan culture",
    main_pois: ["Charminar","Charminar Bazaar","Laad Bazaar","Chowmahalla Palace","Salar Jung Museum","Golconda Fort","Qutb Shahi Tombs","Hussain Sagar Lake","Necklace Road","Shilparamam","Ramoji Film City","HITEC City","Banjara Hills"],
    where_to_stay: { budget: "Charminar, Secunderabad and Ameerpet guesthouses", mid_range: "Banjara Hills, Jubilee Hills, HITEC City and Secunderabad", premium: "Banjara Hills, Jubilee Hills and lake-view hotels" },
    local_transport: { airport: "Rajiv Gandhi International Airport", rail: "Hyderabad Deccan, Secunderabad Junction", metro: "Hyderabad Metro", city: "Metro, buses, autos, app cabs, taxis", nearby: "Trains and buses to Warangal, Nagarjunasagar and Srisailam" },
    food_anchors: ["Hyderabadi biryani","Haleem","Irani chai","Kebabs","Deccan sweets"],
    markets: ["Laad Bazaar","Charminar Bazaar","Begum Bazaar","Moazzam Jahi Market","Shilparamam","Jubilee Hills"],
    seasonal_overlays: ["Bonalu","Ramadan","Deccan festival"], nearby_destinations: ["Warangal","Nagarjunasagar","Srisailam","Bidar","Ramappa"],
    local_rhythm: "Morning Irani chai, afternoon monument, evening biryani", app_tags: ["heritage","food","shopping","business","lake","gateway"]
  },
  {
    city_id: "IN-CCU-006", city: "Kolkata", state_ut: "West Bengal", region: "East India", tier: 1, travel_rank: 6,
    city_type: "Heritage, food and cultural metro", best_season: "October–March", core_identity: "Bengal Renaissance, colonial heritage, Bengali food, book culture and Hooghly river life",
    main_pois: ["Victoria Memorial","Howrah Bridge","Indian Museum","Marble Palace","Dakshineswar Kali Temple","Belur Math","St. Paul’s Cathedral","Jorasanko Thakur Bari","Mullick Ghat Flower Market","College Street","New Market","Park Street","Prinsep Ghat","Eco Park","Science City"],
    where_to_stay: { budget: "Sudder Street, Sealdah and Howrah-side guesthouses", mid_range: "Park Street, BBD Bagh, Salt Lake and New Town", premium: "Park Street, Victoria Memorial area and riverfront hotels" },
    local_transport: { airport: "Netaji Subhas Chandra Bose International Airport", rail: "Howrah Station, Sealdah Station", metro: "Kolkata Metro", city: "Metro, buses, trams, taxis, app cabs, autos, ferries", nearby: "Trains and buses to Shantiniketan, Bishnupur, Digha and Darjeeling" },
    food_anchors: ["Machher jhol","Shukto","Aloo posto","Kathi rolls","Phuchka","Mishti doi","Rosogolla","Sandesh"],
    markets: ["New Market","College Street","Mullick Ghat Flower Market","Gariahat","Burrabazar","South City Mall"],
    seasonal_overlays: ["Durga Puja","Poila Boishakh","Kolkata Christmas"], nearby_destinations: ["Shantiniketan","Bishnupur","Sundarbans","Digha","Darjeeling"],
    local_rhythm: "Morning heritage, afternoon markets, evening Park Street and riverfront", app_tags: ["heritage","food","shopping","culture","river","gateway"]
  },
  {
    city_id: "IN-AMD-007", city: "Ahmedabad", state_ut: "Gujarat", region: "West India", tier: 1, travel_rank: 7,
    city_type: "Heritage, textile and business city", best_season: "October–March", core_identity: "Old city, stepwells, textile heritage, Gandhi legacy and Gujarati food",
    main_pois: ["Sabarmati Ashram","Adalaj Stepwell","Bhadra Fort","Jama Masjid","Sidi Saiyyed Mosque","Manek Chowk","Calico Museum of Textiles","Kankaria Lake","Law Garden Night Market","Sarkhej Roza","Statue of Unity day trip","Patan day trip"],
    where_to_stay: { budget: "Old city and railway-station guesthouses", mid_range: "Navrangpura, CG Road and SG Highway hotels", premium: "Heritage hotels and boutique stays" },
    local_transport: { airport: "Sardar Vallabhbhai Patel International Airport", rail: "Ahmedabad Junction", metro: "Ahmedabad Metro", city: "Metro, BRTS, buses, autos, app cabs, taxis", nearby: "Trains and buses to Patan, Kutch, Dwarka and Somnath" },
    food_anchors: ["Gujarati thali","Dhokla","Fafda-jalebi","Undhiyu","Khakhra"],
    markets: ["Manek Chowk","Law Garden Night Market","Ratanpole","CG Road","Law Garden","Sindhi Market"],
    seasonal_overlays: ["Navratri","Uttarayan","Rann Utsav"], nearby_destinations: ["Patan","Modhera","Kutch","Statue of Unity","Dwarka"],
    local_rhythm: "Morning heritage walk, afternoon stepwell or museum, evening market food", app_tags: ["heritage","food","shopping","textile","business","gateway"]
  },
  {
    city_id: "IN-PNQ-008", city: "Pune", state_ut: "Maharashtra", region: "West India", tier: 1, travel_rank: 8,
    city_type: "Heritage, education and food city", best_season: "October–February", core_identity: "Maratha history, Peshwa heritage, hill forts, cafés and Deccan culture",
    main_pois: ["Shaniwar Wada","Aga Khan Palace","Dagdusheth Halwai Ganpati Temple","Sinhagad Fort","Raja Dinkar Kelkar Museum","Pataleshwar Cave Temple","Koregaon Park","Osho Garden","Pune University","Lavasa day trip","Lonavala day trip"],
    where_to_stay: { budget: "Deccan Gymkhana and Shivajinagar guesthouses", mid_range: "Koregaon Park, Kalyani Nagar and Baner hotels", premium: "Koregaon Park and hill-view resorts" },
    local_transport: { airport: "Pune International Airport", rail: "Pune Junction", metro: "Pune Metro", city: "Metro, buses, autos, app cabs, taxis", nearby: "Trains and buses to Mumbai, Lonavala, Nashik and Aurangabad" },
    food_anchors: ["Misal pav","Puran poli","Vada pav","Bhel","Maharashtrian thali"],
    markets: ["Laxmi Road","Tulshibaug","FC Road","Koregaon Park","Phoenix Marketcity","Bajirao Road"],
    seasonal_overlays: ["Ganesh Chaturthi","Savitribai Phule Jayanti","Monsoon treks"], nearby_destinations: ["Lonavala","Khandala","Mumbai","Aurangabad","Mahabaleshwar"],
    local_rhythm: "Morning fort or temple, afternoon café, evening food street", app_tags: ["heritage","food","cafés","forts","education","gateway"]
  },
  {
    city_id: "IN-JAI-009", city: "Jaipur", state_ut: "Rajasthan", region: "North India", tier: 1, travel_rank: 9,
    city_type: "Pink City heritage capital", best_season: "October–March", core_identity: "Rajput forts, palaces, bazaars, block printing and Rajasthani food",
    main_pois: ["Amber Fort","City Palace","Hawa Mahal","Jantar Mantar","Nahargarh Fort","Jaigarh Fort","Birla Mandir","Johari Bazaar","Bapu Bazaar","Chokhi Dhani","Albert Hall Museum","Nahargarh Biological Park"],
    where_to_stay: { budget: "Old city and Bani Park guesthouses", mid_range: "MI Road, Civil Lines and Bani Park hotels", premium: "Heritage havelis and palace hotels" },
    local_transport: { airport: "Jaipur International Airport", rail: "Jaipur Junction", metro: "Jaipur Metro", city: "Metro, buses, autos, app cabs, taxis", nearby: "Trains and buses to Udaipur, Jodhpur, Jaisalmer and Pushkar" },
    food_anchors: ["Dal baati churma","Laal maas","Pyaaz kachori","Ghevar","Rajasthani thali"],
    markets: ["Johari Bazaar","Bapu Bazaar","Tripolia Bazaar","Chandpole Bazaar","Nehru Bazaar","Chokhi Dhani"],
    seasonal_overlays: ["Jaipur Literature Festival","Teej","Diwali"], nearby_destinations: ["Pushkar","Udaipur","Jodhpur","Ranthambore","Agra"],
    local_rhythm: "Morning fort, afternoon bazaar, evening rooftop dinner", app_tags: ["heritage","forts","palaces","shopping","food","desert"]
  },
  {
    city_id: "IN-GOI-010", city: "Goa", state_ut: "Goa", region: "West India", tier: 1, travel_rank: 10,
    city_type: "Beach, heritage and leisure state-city", best_season: "November–February", core_identity: "Beaches, Indo-Portuguese heritage, cafés, nightlife, water sports and slow coastal travel",
    main_pois: ["Baga Beach","Calangute Beach","Anjuna Beach","Vagator Beach","Morjim Beach","Ashwem Beach","Chapora Fort","Aguada Fort","Fontainhas","Our Lady of the Immaculate Conception Church","Basilica of Bom Jesus","Se Cathedral","Palolem Beach","Agonda Beach","Dudhsagar Falls"],
    where_to_stay: { budget: "Anjuna, Vagator and Palolem hostels and beach huts", mid_range: "Baga, Calangute, Assagao and Palolem hotels", premium: "Beachfront resorts, boutique villas and heritage hotels" },
    local_transport: { airport: "Goa International Airport, Dabolim", rail: "Madgaon, Thivim, Karmali", metro: "Not available", city: "Rented scooter, taxi, rented car, local bus", nearby: "Road to Panaji, Old Goa, North Goa, South Goa and Gokarna" },
    food_anchors: ["Fish curry rice","Vindaloo","Bebinca","Goan sausage","Feni"],
    markets: ["Anjuna Flea Market","Saturday Night Market","Mapusa Market","Panaji Market","Margao Market","Calangute Beach Market"],
    seasonal_overlays: ["Carnival","Sao Joao","Christmas","New Year"], nearby_destinations: ["Panaji","Old Goa","North Goa","South Goa","Gokarna"],
    local_rhythm: "Morning beach, afternoon café, evening nightlife or riverfront", app_tags: ["beach","nightlife","heritage","food","water sports","leisure"]
  }
];

const tier2Cities = [
  {
    city_id: "IN-LKO-T2-001", city: "Lucknow", state_ut: "Uttar Pradesh", region: "North India", tier: 2, travel_rank: 1,
    city_type: "Awadhi heritage and food city", best_season: "October–March", core_identity: "Nawabi heritage, Awadhi cuisine, chikankari, Imambaras and refined culture",
    main_pois: ["Bara Imambara","Chota Imambara","Rumi Darwaza","Hazratganj","Lucknow Residency","Chowk","Ambedkar Memorial Park","Chikankari Workshops","British Residency","La Martiniere"],
    where_to_stay: { budget: "Charbagh and Hazratganj guesthouses", mid_range: "Hazratganj, Gomti Nagar and Civil Lines hotels", premium: "Heritage hotels and boutique stays" },
    local_transport: { airport: "Chaudhary Charan Singh International Airport", rail: "Lucknow Charbagh, Lucknow Junction", metro: "Lucknow Metro", city: "Metro, buses, autos, app cabs, taxis", nearby: "Trains and buses to Ayodhya, Varanasi and Kanpur" },
    food_anchors: ["Awadhi biryani","Galouti kebab","Tunday kebab","Sheermal","Chaat"],
    markets: ["Chowk","Hazratganj","Aminabad","Nakhas Market","Bhoothnath Market","Gomti Nagar"],
    seasonal_overlays: ["Lucknow Mahotsav","Muharram","Diwali"], nearby_destinations: ["Ayodhya","Varanasi","Kanpur","Prayagraj","Chitrakoot"],
    local_rhythm: "Morning monument, afternoon bazaar, evening kebab and sheermal", app_tags: ["heritage","food","shopping","culture","business","gateway"]
  },
  {
    city_id: "IN-VNS-T2-002", city: "Varanasi", state_ut: "Uttar Pradesh", region: "North India", tier: 2, travel_rank: 2,
    city_type: "Spiritual river city", best_season: "October–March", core_identity: "Ganga ghats, temples, silk weaving, boat rides and evening aarti",
    main_pois: ["Kashi Vishwanath Temple","Dashashwamedh Ghat","Assi Ghat","Manikarnika Ghat","Sarnath","Banaras Hindu University","Ramnagar Fort","Sankat Mochan Temple","Silk Weaving Workshops","Ganga Aarti"],
    where_to_stay: { budget: "Assi Ghat and Godowlia guesthouses", mid_range: "Assi Ghat, Dashashwamedh and Cantonment hotels", premium: "River-view heritage hotels and boutique stays" },
    local_transport: { airport: "Lal Bahadur Shastri International Airport", rail: "Varanasi Junction, Banaras Station", metro: "Not available", city: "Autos, cycle-rickshaws, boats, taxis", nearby: "Trains and buses to Sarnath, Prayagraj and Ayodhya" },
    food_anchors: ["Kachori sabzi","Tamatar chaat","Malaiyo","Banarasi paan","Thandai"],
    markets: ["Godowlia","Chowk","Thatheri Bazaar","Vishwanath Gali","Lahurabir","Silk Market"],
    seasonal_overlays: ["Dev Deepawali","Maha Shivratri","Ganga Mahotsav"], nearby_destinations: ["Sarnath","Prayagraj","Ayodhya","Vindhyachal","Chitrakoot"],
    local_rhythm: "Sunrise boat, afternoon temple or silk workshop, evening aarti", app_tags: ["spiritual","heritage","food","river","shopping","pilgrimage"]
  },
  {
    city_id: "IN-AGR-T2-003", city: "Agra", state_ut: "Uttar Pradesh", region: "North India", tier: 2, travel_rank: 3,
    city_type: "Mughal heritage city", best_season: "October–March", core_identity: "Taj Mahal, Agra Fort, Mughal gardens, petha and marble craft",
    main_pois: ["Taj Mahal","Agra Fort","Mehtab Bagh","Tomb of Itimad-ud-Daulah","Fatehpur Sikri","Kinari Bazaar","Sadar Bazaar","Korai Village","Mariam Tomb","Chini ka Rauza"],
    where_to_stay: { budget: "Taj Ganj guesthouses and hostels", mid_range: "Taj Ganj, Fatehabad Road and Civil Lines hotels", premium: "Taj-view and heritage hotels" },
    local_transport: { airport: "Agra Airport", rail: "Agra Cantt, Agra Fort", metro: "Not available", city: "Autos, cycle-rickshaws, taxis, app cabs, rented cars", nearby: "Trains and buses to Delhi, Jaipur, Mathura and Varanasi" },
    food_anchors: ["Petha","Bedai","Mughlai food","Agra chaat","Dalmoth"],
    markets: ["Kinari Bazaar","Sadar Bazaar","Raja ki Mandi","Balkeshwar Market","Sanjay Place","Marble Craft Market"],
    seasonal_overlays: ["Taj Mahotsav","Diwali","Holi"], nearby_destinations: ["Fatehpur Sikri","Mathura","Vrindavan","Delhi","Jaipur"],
    local_rhythm: "Sunrise Taj, afternoon fort or bazaar, evening Mehtab Bagh", app_tags: ["heritage","monument","food","shopping","craft","gateway"]
  },
  {
    city_id: "IN-ASR-T2-004", city: "Amritsar", state_ut: "Punjab", region: "North India", tier: 2, travel_rank: 4,
    city_type: "Sikh pilgrimage and food city", best_season: "October–March", core_identity: "Golden Temple, Punjabi food, Wagah Border and Sikh heritage",
    main_pois: ["Golden Temple","Harmandir Sahib","Jallianwala Bagh","Wagah Border","Partition Museum","Durgiana Temple","Ram Bagh","Hall Bazaar","Punjabi food streets"],
    where_to_stay: { budget: "Golden Temple-area guesthouses and sarais", mid_range: "Hall Bazaar and GT Road hotels", premium: "Heritage hotels and boutique stays" },
    local_transport: { airport: "Sri Guru Ram Dass Jee International Airport", rail: "Amritsar Junction", metro: "Not available", city: "Autos, cycle-rickshaws, taxis, app cabs", nearby: "Trains and buses to Delhi, Chandigarh and Jammu" },
    food_anchors: ["Amritsari kulcha","Langar","Chole bhature","Lassi","Punjabi thali"],
    markets: ["Hall Bazaar","Katra Jaimal Singh","Guru Bazaar","Lohgarh Market","Shastri Market","Ranjit Avenue"],
    seasonal_overlays: ["Baisakhi","Diwali","Gurpurab"], nearby_destinations: ["Wagah","Jalandhar","Chandigarh","Katra","Dharamshala"],
    local_rhythm: "Early darshan, afternoon museum or Wagah, evening langar", app_tags: ["spiritual","heritage","food","shopping","pilgrimage","border"]
  },
  {
    city_id: "IN-IXC-T2-005", city: "Chandigarh", state_ut: "Chandigarh", region: "North India", tier: 2, travel_rank: 5,
    city_type: "Planned city and Himalayan gateway", best_season: "October–March", core_identity: "Modernist planning, gardens, lakes, cafés and Himalayan access",
    main_pois: ["Rock Garden","Sukhna Lake","Rose Garden","Pinjore Gardens","Elante Mall","Sector 17 Plaza","Le Corbusier Centre","Government Museum and Art Gallery","Morni Hills day trip","Shimla gateway"],
    where_to_stay: { budget: "Sector 17 and Sector 22 guesthouses", mid_range: "Sector 17, Sector 35 and IT Park hotels", premium: "Lake-view and luxury business hotels" },
    local_transport: { airport: "Chandigarh International Airport", rail: "Chandigarh Junction", metro: "Not available", city: "Buses, autos, app cabs, taxis, rented cars", nearby: "Road to Shimla, Manali, Amritsar and Delhi" },
    food_anchors: ["Punjabi food","Chole bhature","Kulcha","Café food","North Indian thali"],
    markets: ["Sector 17 Plaza","Sector 22","Sector 34","Elante Mall","Palika Bazaar","Shastri Market"],
    seasonal_overlays: ["Chandigarh Carnival","Rose Festival","Winter season"], nearby_destinations: ["Shimla","Manali","Amritsar","Morni Hills","Kasauli"],
    local_rhythm: "Morning garden or lake, afternoon museum or café, evening Sector 17", app_tags: ["planned city","gardens","food","shopping","gateway","business"]
  },
  {
    city_id: "IN-COK-T2-006", city: "Kochi", state_ut: "Kerala", region: "South India", tier: 2, travel_rank: 6,
    city_type: "Harbour heritage and backwater gateway", best_season: "October–February", core_identity: "Chinese fishing nets, Portuguese and Dutch heritage, spice trade, backwaters and Kerala food",
    main_pois: ["Fort Kochi Chinese Fishing Nets","Fort Kochi Beach","Mattancherry Palace","Paradesi Synagogue","St. Francis Church","Santa Cruz Basilica","Mattancherry Spice Market","Jew Town","Marine Drive","Cherai Beach","Kochi Biennale venues"],
    where_to_stay: { budget: "Fort Kochi guesthouses and backpacker hostels", mid_range: "Fort Kochi, Mattancherry and Marine Drive hotels", premium: "Heritage hotels, waterfront resorts and boutique stays" },
    local_transport: { airport: "Cochin International Airport", rail: "Ernakulam Junction, Ernakulam Town", metro: "Kochi Metro", city: "Metro, buses, autos, app cabs, ferries", nearby: "Buses, trains and taxis to Alappuzha, Munnar and Thekkady" },
    food_anchors: ["Karimeen pollichathu","Appam","Sadya","Seafood","Malabar biryani"],
    markets: ["Mattancherry Spice Market","Jew Town","Marine Drive","Broadway","MG Road","Lulu Mall"],
    seasonal_overlays: ["Kochi-Muziris Biennale","Cochin Carnival","Onam"], nearby_destinations: ["Alappuzha","Munnar","Thekkady","Kumarakom","Varkala"],
    local_rhythm: "Morning heritage, afternoon spice market, evening Marine Drive", app_tags: ["heritage","coastal","food","backwaters","shopping","gateway"]
  },
  {
    city_id: "IN-CJB-T2-007", city: "Coimbatore", state_ut: "Tamil Nadu", region: "South India", tier: 2, travel_rank: 7,
    city_type: "Textile, wellness and hill gateway", best_season: "October–March", core_identity: "Textile industry, temples, wellness, coffee hills and Western Ghats access",
    main_pois: ["Marudamalai Temple","Dhyanalinga","Adiyogi Shiva Statue","Gandhipuram","Coimbatore Textile Market","VOC Park","Siruvani Waterfalls","Kovai Kutralam Falls","Valparai day trip","Ooty gateway"],
    where_to_stay: { budget: "Gandhipuram and railway-station guesthouses", mid_range: "RS Puram, Gandhipuram and Peelamedu hotels", premium: "City-centre and wellness resorts" },
    local_transport: { airport: "Coimbatore International Airport", rail: "Coimbatore Junction", metro: "Not available", city: "Buses, autos, app cabs, taxis, rented cars", nearby: "Road to Ooty, Valparai, Palakkad and Madurai" },
    food_anchors: ["Kongu food","Filter coffee","Dosa","Biryani","Sweets"],
    markets: ["Gandhipuram","RS Puram","Townhall","Ukkadam","Cross Cut Road","Textile Market"],
    seasonal_overlays: ["Kongu festivals","Tea season","Wellness tourism"], nearby_destinations: ["Ooty","Valparai","Palakkad","Madurai","Munnar"],
    local_rhythm: "Morning temple or wellness, afternoon market, evening food street", app_tags: ["wellness","textile","food","shopping","gateway","business"]
  },
  {
    city_id: "IN-IDR-T2-008", city: "Indore", state_ut: "Madhya Pradesh", region: "Central India", tier: 2, travel_rank: 8,
    city_type: "Food, heritage and business city", best_season: "October–March", core_identity: "Street food, Maratha heritage, temples, clean-city culture and Malwa history",
    main_pois: ["Rajwada Palace","Lal Bagh Palace","Khajrana Ganesh Temple","Sarafa Bazaar","Chappan Dukan","Annapurna Temple","Patalpani Waterfall","Ralamandal Wildlife Sanctuary","Ujjain day trip","Mandu day trip"],
    where_to_stay: { budget: "Rajwada and railway-station guesthouses", mid_range: "Vijay Nagar, New Palasia and MG Road hotels", premium: "Vijay Nagar and boutique hotels" },
    local_transport: { airport: "Devi Ahilya Bai Holkar Airport", rail: "Indore Junction", metro: "Indore Metro", city: "Metro, buses, autos, app cabs, taxis", nearby: "Road to Ujjain, Mandu, Omkareshwar and Bhopal" },
    food_anchors: ["Poha jalebi","Sarafa chaat","Dahi bada","Bhutte ka kees","Malwa thali"],
    markets: ["Sarafa Bazaar","Chappan Dukan","Rajwada Market","Sitlamata Bazaar","MT Cloth Market","Vijay Nagar"],
    seasonal_overlays: ["Sarafa night food","Navratri","Diwali"], nearby_destinations: ["Ujjain","Mandu","Omkareshwar","Bhopal","Maheshwar"],
    local_rhythm: "Morning temple, afternoon heritage, evening Sarafa food walk", app_tags: ["food","heritage","shopping","temple","business","gateway"]
  },
  {
    city_id: "IN-BHO-T2-009", city: "Bhopal", state_ut: "Madhya Pradesh", region: "Central India", tier: 2, travel_rank: 9,
    city_type: "Lake heritage and Islamic architecture city", best_season: "October–March", core_identity: "Upper Lake, Nawabi heritage, Sanchi access, Islamic architecture and tribal culture",
    main_pois: ["Upper Lake","Lower Lake","Taj-ul-Masajid","Shaukat Mahal","Gohar Mahal","Bharat Bhavan","Sanchi Stupa day trip","Bhimbetka day trip","Van Vihar National Park","Tribal Museum"],
    where_to_stay: { budget: "Old city and railway-station guesthouses", mid_range: "MP Nagar, Arera Colony and Shamla Hills hotels", premium: "Lake-view and boutique hotels" },
    local_transport: { airport: "Raja Bhoj Airport", rail: "Bhopal Junction", metro: "Bhopal Metro", city: "Metro, buses, autos, app cabs, taxis", nearby: "Road to Sanchi, Bhimbetka, Pachmarhi and Ujjain" },
    food_anchors: ["Poha","Biryani","Kebabs","Bhopali paan","Malwa thali"],
    markets: ["Chowk Bazaar","New Market","MP Nagar","Bittan Market","Bairagarh","Tribal Market"],
    seasonal_overlays: ["Sanchi festival","Tribal festivals","Diwali"], nearby_destinations: ["Sanchi","Bhimbetka","Pachmarhi","Ujjain","Indore"],
    local_rhythm: "Morning lake or museum, afternoon heritage, evening food street", app_tags: ["heritage","lake","food","shopping","tribal","gateway"]
  },
  {
    city_id: "IN-VTZ-T2-010", city: "Visakhapatnam", state_ut: "Andhra Pradesh", region: "South India", tier: 2, travel_rank: 10,
    city_type: "Coastal port and hill-valley gateway", best_season: "October–March", core_identity: "Beach Road, Araku Valley, coffee estates, caves and seafood",
    main_pois: ["Visakhapatnam Beach Road","Submarine Museum","Kailasagiri","Visakhapatnam Fish Market","Araku Valley","Borra Caves","Lambasingi","Rushikonda Beach","Yarada Beach","Simhachalam Temple"],
    where_to_stay: { budget: "Beach Road and railway-station guesthouses", mid_range: "Beach Road, MVP Colony and city-centre hotels", premium: "Beach resorts and hill-view hotels" },
    local_transport: { airport: "Visakhapatnam International Airport", rail: "Visakhapatnam Railway Station", metro: "Not available", city: "Buses, autos, app cabs, taxis", nearby: "Train and road to Araku, Borra and Lambasingi" },
    food_anchors: ["Fish curry","Seafood","Andhra thali","Bamboo chicken","Filter coffee"],
    markets: ["Beach Road Market","Poorna Market","Jagadamba Junction","MVP Colony","Siripuram","Araku Coffee Market"],
    seasonal_overlays: ["Fishing season","Coffee harvest","Beach season"], nearby_destinations: ["Araku Valley","Borra Caves","Lambasingi","Vijayawada","Rajahmundry"],
    local_rhythm: "Morning beach, afternoon Araku or caves, evening seafood", app_tags: ["beach","heritage","food","coffee","hill","gateway"]
  }
];

const allRaw = [...tier1Cities, ...tier2Cities, ...tier3Cities];

// Classification helpers
const areaSet = new Set([
  'bandra','old manali','hauz khas village','gandhipuram','banjara hills','hitec city',
  'koregaon park','dharavi','jew town','marine drive','pondy bazaar','t nagar','mylapore',
  'besant nagar','elante mall','sector 17 plaza','bandra-worli sea link','ub city',
  'connaught place','morni hills','koregaon park','sector 17','sector 22','paltan bazaar'
].map(s=>s.toLowerCase()));

const needsReviewKeywords = [
  { kw: 'workshop', kind: 'activity', reason: 'Workshops are experiences/courses at multiple venues — not a single place. Needs curator to split into specific shops/studios.' },
  { kw: 'rafting points', kind: 'activity', reason: 'Activity cluster, not a single locatable place — needs curator to list specific ghats/operators.' },
  { kw: 'waterfall treks', kind: 'activity', reason: 'Trek/activity — not a single place. Needs curator to list specific trails.' },
  { kw: 'food street', kind: 'activity', reason: 'Food street is an area/activity — should be linked to specific eateries.' },
  { kw: 'shimla gateway', kind: 'route', reason: 'Gateway/route — not a visitable POI in this city. Should be a nearby_destinations link.' },
  { kw: 'ooty gateway', kind: 'route', reason: 'Gateway to another city — not a POI.' },
  { kw: 'brahmaputra river', kind: 'route', reason: 'River is a linear feature — not a single place. Use specific ghats/cruise points.' },
  { kw: 'ganga aarti', kind: 'event', reason: 'Event/ritual at Dashashwamedh Ghat — not a separate place. Link to ghat.' },
  { kw: 'river cruise', kind: 'activity', reason: 'Activity/route — needs specific jetty/operator.' },
];

function classifyPOI(name, cityMarkets = []) {
  const lower = name.toLowerCase().trim();
  // Day trip
  if (lower.endsWith('day trip')) {
    return { kind: 'day_trip', category: 'Nature', needs_review: false, review_reason: null };
  }
  // Check market duplicate: if name appears in markets (case-insensitive)
  const inMarkets = cityMarkets.some(m => m.toLowerCase() === lower);
  if (inMarkets) {
    return { kind: 'market', category: 'Market', needs_review: false, review_reason: null };
  }
  // Check needs_review keywords
  for (const r of needsReviewKeywords) {
    if (lower.includes(r.kw)) {
      return { kind: r.kind, category: 'Experience', needs_review: true, review_reason: r.reason };
    }
  }
  // Area detection
  if (areaSet.has(lower)) {
    return { kind: 'area', category: 'Landmark', needs_review: false, review_reason: null };
  }
  // Heuristic: if name contains Village, Plaza, Road, Street as standalone and not market, treat as area
  if (['hauz khas village','old manali','bandra'].includes(lower)) {
    return { kind: 'area', category: 'Landmark', needs_review: false, review_reason: null };
  }
  // Default: place
  // Infer category
  let category = 'Landmark';
  if (lower.includes('temple') || lower.includes('mosque') || lower.includes('church') || lower.includes('dargah') || lower.includes('guru') || lower.includes('ashram') || lower.includes('aarti') || lower.includes('ghat') || lower.includes('mandir') || lower.includes('shrine') || lower.includes('synagogue') || lower.includes('basilica') || lower.includes('cathedral')) category='Spiritual';
  else if (lower.includes('fort') || lower.includes('palace') || lower.includes('mahal') || lower.includes('haveli') || lower.includes('tomb') || lower.includes('ashram') || lower.includes('stepwell') || lower.includes('bridge') || lower.includes('museum') || lower.includes('memorial')) category='Heritage';
  else if (lower.includes('beach')) category='Beach';
  else if (lower.includes('lake') || lower.includes('tal') || lower.includes('sagar') || lower.includes('ghat') && lower.includes('lake')) category='Lake';
  else if (lower.includes('garden') || lower.includes('park') || lower.includes('zoo') || lower.includes('falls') || lower.includes('valley') || lower.includes('national park') || lower.includes('wildlife') || lower.includes('sanctuary') || lower.includes('dunes') || lower.includes('desert')) category='Nature';
  else if (lower.includes('market') || lower.includes('bazaar') || lower.includes('chowk') || lower.includes('mandi')) category='Market';
  else if (lower.includes('museum') || lower.includes('gallery') || lower.includes('planetarium')) category='Museum';
  else if (lower.includes('tunnel') || lower.includes('tower') || lower.includes('church') || lower.includes('temple')) category='Landmark';
  
  return { kind: 'place', category, needs_review: false, review_reason: null };
}

function parseStayAreas(text) {
  if (!text) return [];
  // Remove trailing category words like hotels, guesthouses etc., then split
  // Example: "Paharganj, Karol Bagh and Hauz Khas hostels" -> ["Paharganj","Karol Bagh","Hauz Khas"]
  // First split by commas and "and"
  const cleaned = text.replace(/\b(hostels|guesthouses|hotels|lodges|resorts|stays|huts|villas|palace hotels|heritage hotels|boutique stays|business hotels|budget guesthouses|airport-side hotels|city hotels|beach resorts|hill-view resorts|mountain resorts|luxury \w+|heritage \w+|boutique \w+)\b/gi, '').replace(/\s+/g,' ').trim();
  // Actually better to extract before those keywords: we need to parse areas
  // Simple approach: remove known suffixes
  let t = text;
  // Remove common suffixes per segment
  const suffixes = ['hostels','guesthouses','hotels','lodges','resorts','stays','huts','villas','palace hotels','heritage hotels','boutique stays','business hotels','budget guesthouses','airport-side hotels','city hotels','beach resorts','hill-view resorts','mountain resorts'];
  // We'll split first
  const parts = t.split(/,|\band\b/g).map(p=>p.trim()).filter(Boolean);
  const areas = [];
  for (let p of parts) {
    // Remove suffix words
    p = p.replace(/\b(hostels|guesthouses|hotels|lodges|resorts|stays|huts|villas|hotels|resorts|lodges)\b/gi, '').trim();
    // Remove trailing "and" leftovers, punctuation
    p = p.replace(/^[-\s]+|[-\s]+$/g,'').trim();
    // Remove "old city and" fragments handled by split, but also "Lake Pichola and Fateh Sagar hotels" -> we want two areas: Lake Pichola, Fateh Sagar
    // Our split already separated by and, so "Lake Pichola" and "Fateh Sagar" will be separate
    // Clean up extra words like "city", "area"
    if (p.length < 2) continue;
    // Title case
    // Remove empty like "and"
    if (p.toLowerCase()==='and') continue;
    // Remove leading "and"
    p = p.replace(/^and\s+/i,'').trim();
    // Collapse multiple spaces
    p = p.replace(/\s+/g,' ').trim();
    if (p) areas.push(p);
  }
  // Deduplicate case-insensitive
  const seen = new Set();
  const uniq = [];
  for (const a of areas) {
    const l = a.toLowerCase();
    if (!seen.has(l)) { seen.add(l); uniq.push(a); }
  }
  return uniq;
}

// Prepare city slugs map for nearby matching
const citySlugSet = new Set(allRaw.map(c=>citySlug(c.city)));
const cityNameToSlug = {};
for (const c of allRaw) {
  cityNameToSlug[c.city.toLowerCase()] = citySlug(c.city);
  // Also add alternate: e.g. "Pondicherry" vs "Puducherry" not in list, but we handle nearby manually
}
// Handle special merges for nearby
const nearbyAlias = {
  'pondicherry': 'puducherry',
  'puducherry': 'puducherry',
  'mamallapuram': 'mahabalipuram', // same place
  'mahabalipuram': 'mahabalipuram',
  'old goa': 'goa', // Old Goa is part of Goa state
};

function normalizeNearby(name) {
  const lower = name.toLowerCase().trim();
  // Handle alias
  if (nearbyAlias[lower]) return nearbyAlias[lower];
  const slug = slugify(lower);
  if (citySlugSet.has(slug)) return slug;
  // Try city name match
  if (cityNameToSlug[lower]) return cityNameToSlug[lower];
  // Try slug without spaces
  // Else free text: return original with slugified? Spec says free text
  return name; // keep original display name
}

// Build collections
let cities = [];
let places = [];
let dishes = [];
let marketsColl = [];
let stayAreas = [];
let transportOptions = [];
let placeIntel = []; // empty
let importLog = { merges: [], needsReview: [], warnings: [] };

const seenSlugs = new Set();
const placeKeySet = new Set(); // city|slug

function placeSlug(name) {
  return slugify(name);
}

// Deduplication maps for special cases
const dedupeMerges = {
  // Amritsar: Golden Temple / Harmandir Sahib
  'amritsar|harmandir-sahib': { keep: 'Golden Temple (Harmandir Sahib)', slug: 'golden-temple-harmandir-sahib', merged: ['Golden Temple','Harmandir Sahib'] },
  'amritsar|golden-temple': { keep: 'Golden Temple (Harmandir Sahib)', slug: 'golden-temple-harmandir-sahib', merged: ['Golden Temple','Harmandir Sahib'] },
  // Chennai Pondicherry/Puducherry handled as nearby, not place
  // Law Garden in Ahmedabad: two entries
  'ahmedabad|law-garden': { keep: 'Law Garden', slug: 'law-garden', merged: ['Law Garden','Law Garden'] },
  'ahmedabad|law-garden-night-market': { keep: 'Law Garden Night Market', slug: 'law-garden-night-market', merged: [] }, // distinct?
};

for (const raw of allRaw) {
  const slug = citySlug(raw.city);
  if (seenSlugs.has(slug)) {
    importLog.warnings.push(`Duplicate city slug ${slug} for ${raw.city} — merging (do not overwrite non-null with null)`);
    // Merge logic would apply, but we know slugs are unique for 30 cities (checked)
    continue;
  }
  seenSlugs.add(slug);
  const editorial_group = `Tier ${raw.tier}`;
  const best_months = parseBestMonths(raw.best_season);
  const permitInfo = seasonPermitMap[slug] || { permit: 'No', weather: '' };
  const weather_risks = parseWeatherRisks(permitInfo.weather);
  const permit_note = permitInfo.permit === 'No' ? null : permitInfo.permit;
  const rhythm = rhythmMap[slug] || { morning: null, afternoon: null, evening: null, night: null };
  
  const nearby = raw.nearby_destinations.map(n => normalizeNearby(n));
  // Deduplicate nearby within city (Pondicherry/Puducherry)
  const nearbySeen = new Set();
  const nearbyDeduped = [];
  for (const n of nearby) {
    const key = typeof n === 'string' ? n.toLowerCase() : n;
    if (nearbySeen.has(key)) {
      importLog.merges.push({ city: raw.city, type: 'nearby', from: n, to: nearbyDeduped.find(x=>x.toLowerCase()===key), reason: 'Duplicate nearby deduplicated (e.g. Pondicherry/Puducherry)' });
      continue;
    }
    nearbySeen.add(key);
    nearbyDeduped.push(n);
  }
  // Special: Chennai has both Pondicherry and Puducherry — they are same, keep one
  // Our alias maps both to puducherry, so dedup will catch second occurrence

  const cityDoc = {
    slug,
    name: raw.city,
    state_ut: raw.state_ut,
    region: raw.region,
    editorial_group,
    rank_in_group: raw.travel_rank,
    city_type: raw.city_type,
    core_identity: raw.core_identity,
    best_season_text: raw.best_season,
    best_months,
    weather_risks,
    permit_note,
    languages: [], // not in dataset
    hero_image_url: null,
    lat: null,
    lng: null,
    app_tags: raw.app_tags,
    nearby_destinations: nearbyDeduped,
    airport: raw.local_transport.airport,
    rail: raw.local_transport.rail,
    metro: raw.local_transport.metro,
    city_transport: raw.local_transport.city,
    nearby_transport: raw.local_transport.nearby,
    rhythm,
    seasonal_overlays: raw.seasonal_overlays,
    data_confidence: 'low',
    source_label: 'WanderWise editorial import v1',
    last_checked: null,
    verified: false,
    city_id: raw.city_id,
  };
  cities.push(cityDoc);

  // Stay areas
  const budget_areas = parseStayAreas(raw.where_to_stay.budget);
  const mid_areas = parseStayAreas(raw.where_to_stay.mid_range);
  const premium_areas = parseStayAreas(raw.where_to_stay.premium);
  const allAreas = [...new Set([...budget_areas, ...mid_areas, ...premium_areas].map(a=>a.toLowerCase()))].map(l => {
    // need original casing — find first occurrence
    const all = [...budget_areas, ...mid_areas, ...premium_areas];
    return all.find(a=>a.toLowerCase()===l);
  }).filter(Boolean);
  stayAreas.push({
    city_slug: slug,
    budget_text: raw.where_to_stay.budget,
    mid_text: raw.where_to_stay.mid_range,
    premium_text: raw.where_to_stay.premium,
    areas: allAreas,
    areas_budget: budget_areas,
    areas_mid: mid_areas,
    areas_premium: premium_areas,
    data_confidence: 'low',
    source_label: 'WanderWise editorial import v1',
    last_checked: null,
  });

  // Dishes
  for (const d of raw.food_anchors) {
    dishes.push({
      id: `${slug}-${placeSlug(d)}-dish`,
      city_slug: slug,
      name: d,
      note: null,
      best_places: null,
      data_confidence: 'low',
      source_label: 'WanderWise editorial import v1',
      last_checked: null,
      slug: placeSlug(d),
    });
  }

  // Markets collection
  for (const m of raw.markets) {
    const mSlug = placeSlug(m);
    marketsColl.push({
      id: `${slug}-${mSlug}-market`,
      city_slug: slug,
      name: m,
      specialty: null,
      data_confidence: 'low',
      source_label: 'WanderWise editorial import v1',
      last_checked: null,
      slug: mSlug,
    });
  }

  // Transport options from master list
  const transports = masterTransport[slug] || [];
  for (const t of transports) {
    const isIntercity = / to /i.test(t) || /from/i.test(t);
    // infer mode
    let mode = 'other';
    const lower = t.toLowerCase();
    if (lower.includes('airport')) mode='airport';
    else if (lower.includes('railway') || lower.includes('rail ') ) mode='rail';
    else if (lower.includes('metro')) mode='metro';
    else if (lower.includes('bus')) mode='bus';
    else if (lower.includes('auto')) mode='auto';
    else if (lower.includes('taxi')) mode='taxi';
    else if (lower.includes('ferry') || lower.includes('boat')) mode='ferry';
    else if (lower.includes('toy train')) mode='toy_train';
    else if (lower.includes('scooter') || lower.includes('bike')) mode='bike';
    else if (lower.includes('cycle-rickshaw')) mode='rickshaw';
    else if (lower.includes('jeep')) mode='jeep';
    else if (lower.includes('tram')) mode='tram';
    
    transportOptions.push({
      id: `${slug}-${slugify(t)}`,
      city_slug: slug,
      mode,
      text: t,
      kind: isIntercity ? 'intercity' : 'local',
      data_confidence: 'low',
      source_label: 'WanderWise editorial import v1',
      last_checked: null,
    });
  }

  // Places from main_pois
  // First, deduplicate within city: case-insensitive name, plus special merges
  const poimap = new Map(); // normalized -> name
  const poiDedupeLog = [];
  for (const poi of raw.main_pois) {
    const norm = poi.toLowerCase().trim();
    // Special merge: Golden Temple / Harmandir Sahib (both names same place)
    if (raw.city === 'Amritsar' && (norm === 'golden temple' || norm === 'harmandir sahib')) {
      const key = 'amritsar|golden-temple-harmandir-sahib';
      const already = poimap.has(key);
      if (!already) {
        poimap.set(key, 'Golden Temple (Harmandir Sahib)');
      } else {
        // second occurrence triggers merge log (only once)
        if (!poimap.has(key+'_logged')) {
          importLog.merges.push({ city: raw.city, type: 'place', from: ['Golden Temple','Harmandir Sahib'], to: 'Golden Temple (Harmandir Sahib)', reason: 'Harmandir Sahib and Golden Temple are one place — merged' });
          poimap.set(key+'_logged', '1');
        }
      }
      continue;
    }
    // Law Garden duplicate in Ahmedabad: Law Garden vs Law Garden Night Market are distinct, but Law Garden appears twice? In Ahmedabad markets we have duplicate, but in POIs we have only Law Garden Night Market once. So no dedupe needed for POIs.
    // But check for general duplicate: if norm already exists, merge
    if (poimap.has(norm)) {
      importLog.merges.push({ city: raw.city, type: 'place', from: poi, to: poimap.get(norm), reason: 'Duplicate POI name within city — deduplicated' });
      continue;
    }
    // Check for Law Garden generic duplicate: if we have Law Garden and Law Garden Night Market, they are distinct, so keep both
    poimap.set(norm, poi);
  }

  // For each unique POI, classify
  for (const [norm, poiName] of poimap.entries()) {
    // Handle special merged key for Amritsar
    const displayName = poiName;
    const classification = classifyPOI(displayName, raw.markets);
    const pSlug = placeSlug(displayName === 'Golden Temple (Harmandir Sahib)' ? 'golden-temple-harmandir-sahib' : displayName);
    const id = `${slug}-${pSlug}`;
    const key = `${slug}|${pSlug}`;
    if (placeKeySet.has(key)) {
      importLog.merges.push({ city: raw.city, type: 'place', from: displayName, to: key, reason: 'Place slug already exists — deduplicated' });
      continue;
    }
    placeKeySet.add(key);
    places.push({
      id,
      city_slug: slug,
      name: displayName,
      slug: pSlug,
      kind: classification.kind,
      category: classification.category,
      description: null,
      price_inr: null,
      rating: null,
      lat: null,
      lng: null,
      google_place_id: null,
      tags: [],
      needs_review: classification.needs_review,
      review_reason: classification.review_reason,
      data_confidence: 'low',
      source_label: 'WanderWise editorial import v1',
      last_checked: null,
      verified: false,
    });
    if (classification.needs_review) {
      importLog.needsReview.push({ city: raw.city, name: displayName, kind: classification.kind, reason: classification.review_reason });
    }
  }

  // Also, if a market name also appears as POI, we already set kind market for POI. But we still have markets collection separate. For places collection, we should also ensure that markets not in POIs but are visitable places? The spec says a name that appears in both main_pois and markets should be ONE place with kind market. We handled that via classification returning market when inMarkets. But what about markets that are NOT in POIs? Should they also be represented as places? The spec implies places collection should include markets as places if they are prominent? But we currently only create places from main_pois. Markets that are not in POIs would not have a place entry. Should we create place entries for markets as well? The spec says "places: city_slug, name, kind (place | area | market | event | activity | day_trip | route), category ..." and KIND includes market. So a market could be a place kind. The rule 3 says if a name appears in both, should be ONE place with kind market. It doesn't say to create place entries for all markets, only that when overlap, merge. So we should keep places from POIs only, and markets collection separate. That's fine.

  // However, we should also handle that some POIs that are markets but not classified as market because we only checked exact match; but markets list may have slightly different naming (e.g. "Chandni Chowk" in POIs vs "Chandni Chowk" in markets exact match — we handle. For "Manek Chowk" in both, exact match handled. For "Law Garden Night Market" in POIs and markets has "Law Garden Night Market" exact, handled.

  // For Chennai, we have "Pondicherry" vs "Puducherry" duplicate in nearby only, already handled.

}

// Ensure 30 cities
if (cities.length !== 30) {
  console.error(`Expected 30 cities, got ${cities.length}`);
  process.exit(1);
}

// Idempotent merge: if output files exist, merge by slug/id, do not overwrite non-null with null
function mergeById(existing, incoming, idField='slug') {
  const map = new Map();
  for (const e of existing) map.set(e[idField], e);
  for (const n of incoming) {
    if (!map.has(n[idField])) {
      map.set(n[idField], n);
    } else {
      const cur = map.get(n[idField]);
      // Merge non-null fields
      const merged = { ...cur };
      for (const [k,v] of Object.entries(n)) {
        if (v !== null && v !== undefined && v !== '' && (cur[k] === null || cur[k] === undefined || (Array.isArray(cur[k]) && cur[k].length===0))) {
          merged[k]=v;
        } else if (Array.isArray(v) && v.length>0 && (!cur[k] || cur[k].length===0)) {
          merged[k]=v;
        }
        // else keep cur (do not overwrite non-null with null)
      }
      map.set(n[idField], merged);
    }
  }
  return Array.from(map.values());
}

// Load existing if any
function loadExisting(file) {
  if (fs.existsSync(file)) {
    try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return []; }
  }
  return [];
}

// Write files
function writeOrMerge(name, data, idField) {
  const file = path.join(OUTPUT_DIR, `${name}.json`);
  const existing = Array.isArray(loadExisting(file)) ? loadExisting(file) : (loadExisting(file).data || []);
  // If file contains object with data field (like cities with meta), handle
  const existingArray = Array.isArray(existing) ? existing : [];
  const merged = mergeById(existingArray, data, idField);
  // Persist as array for simplicity, but cities file we want object with meta? Keep simple array.
  fs.writeFileSync(file, JSON.stringify(merged, null, 2));
  console.log(`  ${name}: ${data.length} incoming, ${merged.length} total (idempotent)`);
  return merged;
}

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Write cities
const citiesMerged = writeOrMerge('cities', cities, 'slug');
const placesMerged = writeOrMerge('places', places, 'id');
const dishesMerged = writeOrMerge('dishes', dishes, 'id');
const marketsMerged = writeOrMerge('markets', marketsColl, 'id');
const stayMerged = writeOrMerge('stay_areas', stayAreas, 'city_slug');
const transportMerged = writeOrMerge('transport_options', transportOptions, 'id');

// Place intel empty but ensure file exists
const intelFile = path.join(OUTPUT_DIR, 'place_intel.json');
if (!fs.existsSync(intelFile)) fs.writeFileSync(intelFile, JSON.stringify([], null, 2));

// Write import log
// Deduplicate log entries by stringify
const log = {
  generatedAt: new Date().toISOString(),
  source_label: 'WanderWise editorial import v1',
  cities: cities.length,
  places: places.length,
  merges: importLog.merges,
  needs_review: importLog.needsReview,
  warnings: importLog.warnings,
  counts: {
    cities: citiesMerged.length,
    places: placesMerged.length,
    dishes: dishesMerged.length,
    markets: marketsMerged.length,
    stay_areas: stayMerged.length,
    transport_options: transportMerged.length,
    place_intel: 0,
  }
};
fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
console.log(`  import-log: ${log.merges.length} merges, ${log.needs_review.length} needs_review`);

// Also write a summary for data-quality page
const quality = {
  counts: log.counts,
  needs_review: log.needs_review,
  merges: log.merges,
  citiesWithMissingHero: cities.filter(c=>!c.hero_image_url).length,
  warning: 'All data confidence low, not yet field-checked, never verified'
};
fs.writeFileSync(path.join(OUTPUT_DIR, 'data-quality.json'), JSON.stringify(quality, null, 2));

console.log('\nImport complete. 30 cities, no duplicate slugs, idempotent.');
console.log('Files in', OUTPUT_DIR);
console.log('  - cities.json, places.json, dishes.json, markets.json, stay_areas.json, transport_options.json, place_intel.json, import-log.json, data-quality.json');

// Also generate users, trips, etc. schemas (empty)
const emptySchemas = {
  users: [], trips: [], templates: [], reports: [], curator_audit: []
};
for (const [k,v] of Object.entries(emptySchemas)) {
  const f = path.join(OUTPUT_DIR, `${k}.json`);
  if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(v, null, 2));
}
