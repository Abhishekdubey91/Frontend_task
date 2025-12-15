'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().positive('Price must be greater than 0')
  ),
  description: z.string().min(1, 'Description required'),
  image: z.string().url('Must be a valid URL'),
  category: z.string().min(1, 'Category required'),
});

type CreateInput = z.infer<typeof createSchema>;

async function postProduct(payload: CreateInput) {
  const { data } = await axios.post('https://fakestoreapi.com/products', payload);
  return data as { id: number };
}

export default function CreateProduct() {

    const router = useRouter();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateInput) => postProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInput>({
    resolver: zodResolver(createSchema) as any, 
  });

  const onSubmit: (vals: CreateInput) => void = (vals) => {
    mutation.mutate(vals, {
      onSuccess: () => reset(), 
    });
    router?.back()
  };

  return (
    <div className="bg-white p-6 rounded shadow-sm max-w-xl mx-auto mt-10">
      <h2 className="text-lg font-semibold mb-4">Create Product</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            {...register('title')}
            className="w-full border rounded px-3 py-2"
          />
          {errors.title && <p className="text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            {...register('price')}
            type="number"
            step="0.01"
            className="w-full border rounded px-3 py-2"
          />
          {errors.price && <p className="text-red-600">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            {...register('description')}
            className="w-full border rounded px-3 py-2"
          />
          {errors.description && <p className="text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input
            {...register('image')}
            className="w-full border rounded px-3 py-2"
          />
          {errors.image && <p className="text-red-600">{errors.image.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            {...register('category')}
            className="w-full border rounded px-3 py-2"
          />
          {errors.category && <p className="text-red-600">{errors.category.message}</p>}
        </div>

        <div>
          <button
            type="submit"
            disabled={mutation.status === 'pending'}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {mutation.status === 'pending' ? 'Submitting...' : 'Create'}
          </button>
        </div>

        {mutation.status === 'error' && (
          <div className="text-red-600 mt-2">Error creating product</div>
        )}
        {mutation.status === 'success' && mutation.data && (
          <div className="text-green-600 mt-2">
            Created successfully (id: {mutation.data.id})
          </div>
        )}
      </form>
    </div>
  );
}
