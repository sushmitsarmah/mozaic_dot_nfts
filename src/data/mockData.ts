
import { NFT, Category } from "@/types";

export const nfts: NFT[] = [
  {
    id: "1",
    title: "Cosmic Dreams",
    description: "A journey through the cosmos, where dreams and reality intertwine in a dance of stars and nebulas.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    creator: "CryptoArtist",
    owner: "0x8a345...7d2b",
    price: "1.45 DOT",
    category: "ai-art",
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Colors", value: "Blue, Purple" },
      { trait_type: "Rarity", value: "Rare" }
    ],
    createdAt: "2025-04-15T14:30:00Z"
  },
  {
    id: "2",
    title: "Digital Existence",
    description: "An exploration of what it means to exist in a digital world, expressed through algorithmic patterns and glitches.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    creator: "BlockchainVisionary",
    owner: "0x2c45d...9f1a",
    price: "0.89 DOT",
    category: "photography",
    attributes: [
      { trait_type: "Style", value: "Generative" },
      { trait_type: "Colors", value: "Green, Black" },
      { trait_type: "Rarity", value: "Common" }
    ],
    createdAt: "2025-04-10T09:15:00Z"
  },
  {
    id: "3",
    title: "Neon Wilderness",
    description: "A futuristic landscape where nature and technology merge, illuminated by the glow of neon lights.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    creator: "TechnoCreative",
    owner: "0x7a1e3...4d6b",
    price: "2.13 DOT",
    category: "abstract",
    attributes: [
      { trait_type: "Style", value: "Cyberpunk" },
      { trait_type: "Colors", value: "Pink, Blue, Green" },
      { trait_type: "Rarity", value: "Uncommon" }
    ],
    createdAt: "2025-04-05T18:45:00Z"
  },
  {
    id: "4",
    title: "Virtual Echoes",
    description: "Echoes of digital consciousness reverberate through layers of virtual reality, creating patterns of thought and memory.",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    creator: "DigitalNomad",
    owner: "0x4d23f...9a7c",
    price: "3.25 DOT",
    category: "ai-art",
    attributes: [
      { trait_type: "Style", value: "Futuristic" },
      { trait_type: "Colors", value: "Green, Black, White" },
      { trait_type: "Rarity", value: "Epic" }
    ],
    createdAt: "2025-03-28T11:20:00Z"
  },
  {
    id: "5",
    title: "Binary Bloom",
    description: "A garden of digital flowers that bloom and evolve based on blockchain transactions.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    creator: "CodeGardener",
    owner: "0x3b67d...2e5f",
    price: "1.78 DOT",
    category: "generative",
    attributes: [
      { trait_type: "Style", value: "Generative" },
      { trait_type: "Colors", value: "Multiple" },
      { trait_type: "Rarity", value: "Rare" }
    ],
    createdAt: "2025-03-22T15:10:00Z"
  },
  {
    id: "6",
    title: "Quantum Portrait",
    description: "A portrait that exists in multiple states simultaneously, capturing the essence of quantum uncertainty.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    creator: "QuantumCreator",
    owner: "0x9c34a...8f1d",
    price: "4.50 DOT",
    category: "portrait",
    attributes: [
      { trait_type: "Style", value: "Quantum" },
      { trait_type: "Colors", value: "Purple, Blue" },
      { trait_type: "Rarity", value: "Legendary" }
    ],
    createdAt: "2025-03-15T09:30:00Z"
  },
  {
    id: "7",
    title: "Polkadot Paradigm",
    description: "A visual representation of the Polkadot network, showcasing the interconnectedness of parachains.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    creator: "PolkaFan",
    owner: "0x5e72c...3a9b",
    price: "2.60 DOT",
    category: "conceptual",
    attributes: [
      { trait_type: "Style", value: "Network" },
      { trait_type: "Colors", value: "Pink, Black" },
      { trait_type: "Rarity", value: "Uncommon" }
    ],
    createdAt: "2025-03-10T13:45:00Z"
  },
  {
    id: "8",
    title: "Digital Dreamscape",
    description: "A landscape born from the collective dreams of artificial intelligence, rendered in stunning detail.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    creator: "AIArtist",
    owner: "0x1f43e...7c2d",
    price: "3.89 DOT",
    category: "ai-art",
    attributes: [
      { trait_type: "Style", value: "Dreamlike" },
      { trait_type: "Colors", value: "Pastel" },
      { trait_type: "Rarity", value: "Epic" }
    ],
    createdAt: "2025-03-05T17:20:00Z"
  }
];

export const categories: Category[] = [
  { id: "1", name: "AI Art", slug: "ai-art" },
  { id: "2", name: "Abstract", slug: "abstract" },
  { id: "3", name: "Photography", slug: "photography" },
  { id: "4", name: "Portrait", slug: "portrait" },
  { id: "5", name: "Generative", slug: "generative" },
  { id: "6", name: "Conceptual", slug: "conceptual" },
  { id: "7", name: "Landscape", slug: "landscape" },
  { id: "8", name: "Animation", slug: "animation" }
];
