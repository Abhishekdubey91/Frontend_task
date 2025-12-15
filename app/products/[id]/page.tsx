'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

const API2 = 'https://fakestoreapi.com';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export async function fetchProduct(id: string): Promise<Product> {
    const { data } = await axios.get<Product>(`${API2}/products/${id}`);
    return data;
}

export default function ProductDetail() {
    const params = useParams();  
    const router = useRouter()
    const id = params?.id as string;  
  console.log(id, "dfjgldfjl"); 

  const { data: product, isLoading } = useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,  
});

if (isLoading) return <div>Loading...</div>;
if (!product) return <div>Product not found</div>;
  return (
    <div>
        <button onClick={()=>router.back()}>Back</button>
    <div className="bg-white p-6 rounded shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <img src={product.image} alt={product.title} className="w-full object-contain h-80" />
        </div>
        <div className="md:flex-1">
          <h2 className="text-2xl font-semibold mb-2">{product.title}</h2>
          <p className="text-xl font-bold mb-2">₹{product.price}</p>
          <p className="mb-2 text-gray-600">Category: {product.category}</p>
          <p className="text-sm text-gray-700">{product.description}</p>
        </div>
      </div>
    </div>
    </div>
  );
}
