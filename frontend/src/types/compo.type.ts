export interface Product {
  id: string;
  name: string;
  nameLocalized?: string | null;
  image?: string | null;
  isActive: boolean;
  category: { name: string };
}
