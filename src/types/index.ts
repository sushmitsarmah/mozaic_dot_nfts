
export interface NFT {
  id: string;
  title: string;
  description?: string;
  image: string;
  creator: string;
  owner: string;
  price?: string;
  category: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export interface MintFormData {
  title: string;
  description: string;
  category: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  image: string;
}
