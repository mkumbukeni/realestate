export type Property = {
  id: string;
  type: "Commercial" | "Residential" | "Industrial" | "Agricultural";
  beds: number;
  baths: number;
  price: string;
  period: string;
  location: string;
  image: string;
  tag: "Rent" | "Sale";
  category:
    | "Featured Properties"
    | "New to Market"
    | "Open Houses"
    | "Most Viewed"
    | "Properties in My Location";
};

export const PROPERTIES: Property[] = [
  {
    id: "1",
    type: "Commercial",
    beds: 6,
    baths: 2,
    price: "MWK 400,000",
    period: "Over a year ago",
    location: "Mzuzu CBD, MZUZU",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Featured Properties",
  },
  {
    id: "2",
    type: "Residential",
    beds: 4,
    baths: 1,
    price: "MWK 200,000",
    period: "Over a year ago",
    location: "Blantyre CBD, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "New to Market",
  },
  {
    id: "3",
    type: "Commercial",
    beds: 8,
    baths: 3,
    price: "MWK 750,000",
    period: "6 months ago",
    location: "Lilongwe CBD, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Open Houses",
  },
  {
    id: "4",
    type: "Residential",
    beds: 3,
    baths: 2,
    price: "MWK 150,000",
    period: "2 months ago",
    location: "Zomba Town, ZOMBA",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Most Viewed",
  },
  {
    id: "5",
    type: "Commercial",
    beds: 10,
    baths: 4,
    price: "MWK 1,200,000",
    period: "1 month ago",
    location: "Mzuzu CBD, MZUZU",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
  },
  {
    id: "6",
    type: "Residential",
    beds: 5,
    baths: 3,
    price: "MWK 350,000",
    period: "3 weeks ago",
    location: "Blantyre CBD, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Featured Properties",
  },
  {
    id: "7",
    type: "Residential",
    beds: 4,
    baths: 2,
    price: "MWK 280,000",
    period: "2 weeks ago",
    location: "Area 43, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "New to Market",
  },
  {
    id: "8",
    type: "Commercial",
    beds: 5,
    baths: 2,
    price: "MWK 900,000",
    period: "1 week ago",
    location: "Area 3, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
  },
  {
    id: "9",
    type: "Residential",
    beds: 3,
    baths: 2,
    price: "MWK 180,000",
    period: "5 days ago",
    location: "Area 18, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Most Viewed",
  },
  {
    id: "10",
    type: "Residential",
    beds: 6,
    baths: 3,
    price: "MWK 500,000",
    period: "3 days ago",
    location: "Nyambadwe, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Properties in My Location",
  },
  {
    id: "11",
    type: "Commercial",
    beds: 8,
    baths: 4,
    price: "MWK 1,500,000",
    period: "1 month ago",
    location: "Blantyre CBD, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Open Houses",
  },
  {
    id: "12",
    type: "Residential",
    beds: 2,
    baths: 1,
    price: "MWK 120,000",
    period: "4 days ago",
    location: "Area 25, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "New to Market",
  },
  {
    id: "13",
    type: "Residential",
    beds: 5,
    baths: 3,
    price: "MWK 450,000",
    period: "2 months ago",
    location: "Kaunda Road, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
  },
  {
    id: "14",
    type: "Commercial",
    beds: 12,
    baths: 5,
    price: "MWK 2,000,000",
    period: "2 weeks ago",
    location: "Mzuzu CBD, MZUZU",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Most Viewed",
  },
  {
    id: "15",
    type: "Residential",
    beds: 4,
    baths: 2,
    price: "MWK 300,000",
    period: "1 week ago",
    location: "Chilomoni, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Open Houses",
  },
  {
    id: "16",
    type: "Residential",
    beds: 7,
    baths: 4,
    price: "MWK 850,000",
    period: "3 weeks ago",
    location: "Area 47, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Properties in My Location",
  },
];

export const PROPERTY_SECTIONS = [
  "Featured Properties",
  "New to Market",
  "Open Houses",
  "Most Viewed",
  "Properties in My Location",
] as const;