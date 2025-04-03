
export type Product = {
  id: string;
  name: string;
  description: string;
  currentPrice: number;
  currency: string;
  imageUrl: string;
  category: string;
  priceHistory: PricePoint[];
  lowestPrice: number;
  highestPrice: number;
};

export type PricePoint = {
  date: string;
  price: number;
};

export type ChartData = {
  name: string;
  price: number;
}[];
