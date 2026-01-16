import { getFilteredProducts, getCategories } from '@/lib/sanity';

// Mock sanity client to avoid ESM import issues in tests
jest.mock('next-sanity', () => ({
    createClient: jest.fn(() => ({
        fetch: jest.fn().mockImplementation((query: string) => {
            if (query.includes('count(')) {
                return Promise.resolve({
                    products: [],
                    total: 0
                });
            }
            if (query.includes('_type == "category"')) {
                return Promise.resolve([
                    { _id: '1', name: 'Aromas', slug: 'aromas', subCategories: ['Incense'], categorySegments: [{ subCategoryName: 'Incense', segments: ['Chakra'] }] }
                ]);
            }
            return Promise.resolve([]);
        }),
    })),
}));

jest.mock('@sanity/image-url', () => {
    const mockBuilder = {
        image: jest.fn().mockReturnThis(),
        url: jest.fn().mockReturnValue('https://placeholder.com'),
    };
    return jest.fn(() => mockBuilder);
});

describe('Shop Page Integration Tests', () => {
    describe('Product Filtering', () => {
        it('should fetch all products without filters', async () => {
            const result = await getFilteredProducts({
                category: 'all',
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);
            expect(result.total).toBeGreaterThanOrEqual(0);
        });

        it('should filter by category only', async () => {
            const result = await getFilteredProducts({
                category: 'aromas',
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);

            // All products should be from the aromas category
            result.products.forEach((product: any) => {
                expect(product.category).toBe('aromas');
            });
        });

        it('should filter by category and subcategory', async () => {
            const result = await getFilteredProducts({
                category: 'aromas',
                sub: 'Incense',
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);

            // All products should match the subcategory
            result.products.forEach((product: any) => {
                expect(product.category).toBe('aromas');
                expect(product.subCategory).toBe('Incense');
            });
        });

        it('should filter by category, subcategory, and segment', async () => {
            const result = await getFilteredProducts({
                category: 'aromas',
                sub: 'Incense',
                segment: 'Chakra',
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);

            // All products should match the segment
            result.products.forEach((product: any) => {
                expect(product.category).toBe('aromas');
                expect(product.subCategory).toBe('Incense');
                expect(product.segments).toContain('Chakra');
            });
        });

        it('should handle price range filtering', async () => {
            const result = await getFilteredProducts({
                category: 'all',
                minPrice: 100,
                maxPrice: 500,
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);

            // All products should be within price range
            result.products.forEach((product: any) => {
                expect(product.price).toBeGreaterThanOrEqual(100);
                expect(product.price).toBeLessThanOrEqual(500);
            });
        });

        it('should handle search queries', async () => {
            const result = await getFilteredProducts({
                category: 'all',
                search: 'agnihotra',
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);

            // Products should match search term
            result.products.forEach((product: any) => {
                const searchTerm = 'agnihotra';
                const matchesName = product.name.toLowerCase().includes(searchTerm);
                const matchesDescription = product.description?.toLowerCase().includes(searchTerm);
                expect(matchesName || matchesDescription).toBe(true);
            });
        });

        it('should handle sorting by price ascending', async () => {
            const result = await getFilteredProducts({
                category: 'all',
                sort: 'price-asc',
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);

            // Verify products are sorted by price ascending
            for (let i = 0; i < result.products.length - 1; i++) {
                expect(result.products[i].price).toBeLessThanOrEqual(result.products[i + 1].price);
            }
        });

        it('should handle pagination correctly', async () => {
            const page1 = await getFilteredProducts({
                category: 'all',
                page: 1,
                limit: 5,
            });

            const page2 = await getFilteredProducts({
                category: 'all',
                page: 2,
                limit: 5,
            });

            expect(page1.products).toBeInstanceOf(Array);
            expect(page2.products).toBeInstanceOf(Array);

            // Products on page 2 should be different from page 1
            const page1Ids = page1.products.map((p: any) => p._id);
            const page2Ids = page2.products.map((p: any) => p._id);

            page2Ids.forEach((id: string) => {
                expect(page1Ids).not.toContain(id);
            });
        });
    });

    describe('Categories', () => {
        it('should fetch all categories', async () => {
            const categories = await getCategories();

            expect(categories).toBeInstanceOf(Array);
            expect(categories.length).toBeGreaterThan(0);

            // Each category should have required fields
            categories.forEach((category: any) => {
                expect(category).toHaveProperty('_id');
                expect(category).toHaveProperty('name');
                expect(category).toHaveProperty('slug');
            });
        });

        it('should have categories with subcategories', async () => {
            const categories = await getCategories();

            const categoriesWithSubs = categories.filter(
                (cat: any) => cat.subCategories && cat.subCategories.length > 0
            );

            expect(categoriesWithSubs.length).toBeGreaterThan(0);
        });

        it('should have categories with segments', async () => {
            const categories = await getCategories();

            const categoriesWithSegments = categories.filter(
                (cat: any) => cat.categorySegments && cat.categorySegments.length > 0
            );

            expect(categoriesWithSegments.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid category gracefully', async () => {
            const result = await getFilteredProducts({
                category: 'non-existent-category',
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);
            expect(result.products.length).toBe(0);
            expect(result.total).toBe(0);
        });

        it('should handle empty subcategory filter', async () => {
            const result = await getFilteredProducts({
                category: 'aromas',
                sub: '',
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);
        });

        it('should handle negative price ranges', async () => {
            const result = await getFilteredProducts({
                category: 'all',
                minPrice: -100,
                maxPrice: 0,
                page: 1,
                limit: 12,
            });

            expect(result).toBeDefined();
            expect(result.products).toBeInstanceOf(Array);
        });
    });
});
