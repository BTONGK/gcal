export type Location = {
  id: string
  displayName: string
  neighborhood: string
  city: string
  lat: number
  lon: number
  timezone: string
  backgroundQuery: string
  tagline: string
  transitStationCode?: string  // 511 SF Bay API station code
  newsFeedUrls: string[]       // RSS feeds for local news
  contextHint: string          // Extra prompt context
}

export const LOCATIONS: Record<string, Location> = {
  bart_powell_st: {
    id: 'bart_powell_st',
    displayName: 'Powell St. Station',
    neighborhood: 'Union Square',
    city: 'San Francisco',
    lat: 37.7844,
    lon: -122.4079,
    timezone: 'America/Los_Angeles',
    backgroundQuery: 'san-francisco-union-square-night',
    tagline: 'Downtown SF · BART',
    transitStationCode: 'POWL',
    newsFeedUrls: ['https://sfist.com/feed', 'https://missionlocal.org/feed'],
    contextHint: 'High-traffic downtown BART station near Union Square shopping, hotels, and tourist areas.',
  },
  bart_16th_mission: {
    id: 'bart_16th_mission',
    displayName: '16th St. Mission',
    neighborhood: 'The Mission',
    city: 'San Francisco',
    lat: 37.7650,
    lon: -122.4196,
    timezone: 'America/Los_Angeles',
    backgroundQuery: 'san-francisco-mission-district-murals',
    tagline: 'Mission District · BART',
    transitStationCode: '16TH',
    newsFeedUrls: ['https://missionlocal.org/feed', 'https://sfist.com/feed'],
    contextHint: 'Mission District BART station. Vibrant Latino cultural neighborhood, murals, taquerias, nightlife.',
  },
  ferry_building: {
    id: 'ferry_building',
    displayName: 'Ferry Building',
    neighborhood: 'Embarcadero',
    city: 'San Francisco',
    lat: 37.7955,
    lon: -122.3937,
    timezone: 'America/Los_Angeles',
    backgroundQuery: 'san-francisco-ferry-building-bay',
    tagline: 'Embarcadero Waterfront',
    newsFeedUrls: ['https://sfist.com/feed', 'https://48hills.org/feed'],
    contextHint: 'Historic Ferry Building on the Embarcadero waterfront. Farmers market on Tue/Thu/Sat. Ferry terminals to East Bay and Marin.',
  },
  hayes_valley_coffee: {
    id: 'hayes_valley_coffee',
    displayName: 'Hayes Valley',
    neighborhood: 'Hayes Valley',
    city: 'San Francisco',
    lat: 37.7757,
    lon: -122.4230,
    timezone: 'America/Los_Angeles',
    backgroundQuery: 'san-francisco-hayes-valley-street',
    tagline: 'Boutiques & Coffee',
    newsFeedUrls: ['https://sfist.com/feed', 'https://48hills.org/feed'],
    contextHint: 'Trendy Hayes Valley near Civic Center. Independent boutiques, coffee shops, restaurants. Close to SF Symphony and Opera.',
  },
  dolores_park: {
    id: 'dolores_park',
    displayName: 'Dolores Park',
    neighborhood: 'The Mission',
    city: 'San Francisco',
    lat: 37.7596,
    lon: -122.4269,
    timezone: 'America/Los_Angeles',
    backgroundQuery: 'san-francisco-dolores-park-skyline',
    tagline: 'Mission Dolores Park',
    newsFeedUrls: ['https://missionlocal.org/feed', 'https://sfist.com/feed'],
    contextHint: 'Mission Dolores Park, a popular community park with city views. Busy on weekends. Playground, tennis courts, dog area.',
  },
}
