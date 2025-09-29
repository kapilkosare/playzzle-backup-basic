
'use client';

import { useState } from 'react';
import type { Category } from '@/app/puzzles/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateCategoryOrder } from '@/app/puzzles/actions';
import { useDebouncedCallback } from 'use-debounce';

function formatCategoryName(name: string) {
    return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export function CategoryOrderManager({ categories }: { categories: Category[] }) {
    const { toast } = useToast();
    const [orders, setOrders] = useState<Record<string, number>>(
        categories.reduce((acc, cat) => {
            acc[cat.name] = cat.displayOrder;
            return acc;
        }, {} as Record<string, number>)
    );

    const handleOrderChange = (name: string, value: string) => {
        const newOrders = { ...orders, [name]: Number(value) };
        setOrders(newOrders);
        debouncedUpdate(name, Number(value));
    };

    const debouncedUpdate = useDebouncedCallback(async (name: string, newOrder: number) => {
        const result = await updateCategoryOrder(name, newOrder);
        if (result.success) {
            toast({
                title: `Order updated for ${formatCategoryName(name)}`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        }
    }, 500);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Order</CardTitle>
                <CardDescription>
                    Set the display order for categories on the homepage. Lower numbers appear first.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category Name</TableHead>
                            <TableHead className="w-[120px]">Display Order</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.name}>
                                <TableCell className="font-medium capitalize">
                                    {formatCategoryName(category.name)}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={orders[category.name] ?? ''}
                                        onChange={(e) => handleOrderChange(category.name, e.target.value)}
                                        className="h-8"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
