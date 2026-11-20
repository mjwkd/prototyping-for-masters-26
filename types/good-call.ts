export interface Contact {
  id: string;
  name: string;
  city: string;
  country: string;
  timeZone: string;
  utcOffset: number; // in hours relative to UTC
  awakeStart: number; // 0-24
  awakeEnd: number; // 0-24
  avatar: {
    outer: string;
    middle: string;
    core: string;
    tagColor: string;
  };
  relationship?: string;
}

export interface MyLocation {
  city: string;
  country: string;
  timeZone: string;
  utcOffset: number;
  awakeStart: number;
  awakeEnd: number;
}

export const MY_LOCATION: MyLocation = {
  city: 'New York',
  country: 'USA',
  timeZone: 'America/New_York',
  utcOffset: -5,
  awakeStart: 8,
  awakeEnd: 24,
};

export const DEFAULT_CONTACTS: Contact[] = [
  {
    id: 'mom',
    name: 'Mom',
    city: 'Seoul',
    country: 'South Korea',
    timeZone: 'Asia/Seoul',
    utcOffset: 9, // UTC+9 (+14h ahead of New York UTC-5)
    awakeStart: 7,
    awakeEnd: 24,
    avatar: {
      outer: '#BDBDBD',
      middle: '#FF8C1A',
      core: '#8B6450',
      tagColor: '#FF8C1A',
    },
    relationship: 'Family · Seoul',
  },
  {
    id: 'jake',
    name: 'Jake',
    city: 'London',
    country: 'UK',
    timeZone: 'Europe/London',
    utcOffset: 0, // UTC+0 (+5h ahead of New York UTC-5)
    awakeStart: 8,
    awakeEnd: 23,
    avatar: {
      outer: '#FF86D9',
      middle: '#D93DAE',
      core: '#8B6450',
      tagColor: '#FF86D9',
    },
    relationship: 'Best friend · London',
  },
  {
    id: 'yuna',
    name: 'Yuna',
    city: 'San Francisco',
    country: 'USA',
    timeZone: 'America/Los_Angeles',
    utcOffset: -8, // UTC-8 (-3h behind New York UTC-5)
    awakeStart: 8,
    awakeEnd: 23,
    avatar: {
      outer: '#FFD84D',
      middle: '#E3263A',
      core: '#8B6450',
      tagColor: '#FFD84D',
    },
    relationship: 'Colleague · SF',
  },
];
