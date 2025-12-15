'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NoData from '@/public/no-data.png'
const API = 'https://fakestoreapi.com';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await axios.get(`${API}/products`);
  return data;
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await axios.get(`${API}/products/categories`);
  return data;
}

export default function ProductListingPage() {
  const router = useRouter();

  const { data: products = [], isLoading, isError } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: categories = [], isLoading: catLoading, isError: catError } = useQuery<string[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    let out = products;
    if (debouncedSearch.trim()) {
      out = out.filter((p) => p.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    if (category !== 'all') {
      out = out.filter((p) => p.category === category);
    }
    if (sort === 'asc') out = [...out].sort((a, b) => a.price - b.price);
    if (sort === 'desc') out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [products, debouncedSearch, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  if (isLoading || catLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: perPage }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded shadow animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (isError) return <div className="text-red-500">Failed to load products.</div>;
  if (catError) return <div className="text-red-500">Failed to load categories.</div>;

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-col sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className="border rounded px-3 py-2 w-full"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-3 py-3 w-full"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'none' | 'asc' | 'desc')}
          className="border rounded px-3 py-3 w-full"
        >
          <option value="none">Sort</option>
          <option value="asc">Price: Low → High</option>
          <option value="desc">Price: High → Low</option>
        </select>

        <button
          onClick={() => router.push('/products/create')}
          className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {pageItems.length ? <>
          {pageItems.map((p) => (
            <motion.article
              key={p.id}
              className="bg-white p-4 rounded shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
            >
              <img src={p.image} alt={p.title} className="h-40 w-full object-contain mb-3" />
              <h3 className="font-medium text-sm mb-1 truncate">{p.title}</h3>
              <p className="font-semibold">₹{p.price}</p>
              <p className="text-xs text-gray-500 truncate">{p.category}</p>
              <div className="w-full mt-3">
                <Link href={`/products/${p.id}`} className="text-white p-3 rounded-lg text-center w-full text-sm block bg-blue-700 ">
                  View
                </Link>
              </div>
            </motion.article>
          ))}
          </>
        :
        <div className='text-center col-span-3'>
          <img src={NoData.src} className='h-[200px] w-[200px] mx-auto'/>
          </div>  
        }
        </div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded"
          disabled={page === 1}
        >
          Prev
        </button>
        <div>
          Page {page} / {totalPages}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 border rounded"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
