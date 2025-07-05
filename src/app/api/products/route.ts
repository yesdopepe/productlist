import { NextResponse } from "next/server";
import productsData from "./products.json";

interface Product {
    name: string;
    popularityScore: number;
    weight: number;
    price: number;
    images: {
        yellow: string;
        rose: string;
        white: string;
    };
}

const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
    const minWeight = searchParams.get('minWeight') ? parseFloat(searchParams.get('minWeight')!) : null;
    const maxWeight = searchParams.get('maxWeight') ? parseFloat(searchParams.get('maxWeight')!) : null;
    const minPopularity = searchParams.get('minPopularity') ? parseFloat(searchParams.get('minPopularity')!) : null;
    const maxPopularity = searchParams.get('maxPopularity') ? parseFloat(searchParams.get('maxPopularity')!) : null;
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const response = productsData as Product[];
    const goldPriceResponse = await fetch(
        'https://api.gold-api.com/price/XAU',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add caching to avoid hitting rate limits
          next: { revalidate: 3600 } // Cache for 1 hour
        }
      );
    const goldPriceData = await goldPriceResponse.json();
    
    // Convert gold price from per ounce to per gram
    // 1 troy ounce = 31.1035 grams
    const goldPricePerGram = goldPriceData.price / 31.1035;
    
    let final_response = response.map((product: Product) => {
        // Price = (popularityScore + 1) * weight * goldPrice per gram
        const calculatedPrice = (product.popularityScore + 1) * product.weight * goldPricePerGram;
        
        return {
            ...product,
            price: Math.round(calculatedPrice * 100) / 100 // Round to 2 decimal places
        }
    });

    // Apply filters
    final_response = final_response.filter((product: Product) => {
        // Price filter
        if (minPrice !== null && product.price < minPrice) return false;
        if (maxPrice !== null && product.price > maxPrice) return false;
        
        // Weight filter
        if (minWeight !== null && product.weight < minWeight) return false;
        if (maxWeight !== null && product.weight > maxWeight) return false;
        
        // Popularity filter
        if (minPopularity !== null && product.popularityScore < minPopularity) return false;
        if (maxPopularity !== null && product.popularityScore > maxPopularity) return false;
        
        return true;
    });

    // Apply sorting
    final_response.sort((a: Product, b: Product) => {
        let aValue: string | number, bValue: string | number;
        
        switch (sortBy) {
            case 'price':
                aValue = a.price;
                bValue = b.price;
                break;
            case 'weight':
                aValue = a.weight;
                bValue = b.weight;
                break;
            case 'popularity':
                aValue = a.popularityScore;
                bValue = b.popularityScore;
                break;
            case 'name':
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
        }
        
        if (sortOrder === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
    });

    return NextResponse.json(final_response);
}

export { GET };