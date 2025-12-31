import React, { useState, useEffect, useCallback } from 'react'
import { Select, Stack, Text, Card, Spinner, Flex } from '@sanity/ui'
import { set, unset, useFormValue, useClient, StringInputProps } from 'sanity'

export function SubCategorySelect(props: StringInputProps) {
    const { onChange, value = '', elementProps } = props
    const [subCategories, setSubCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const client = useClient({ apiVersion: '2023-01-01' })

    // Get the selected category from the form state
    const categoryRef = useFormValue(['category']) as { _ref?: string } | undefined

    useEffect(() => {
        let isMounted = true

        async function fetchSubCategories() {
            if (!categoryRef?._ref) {
                setSubCategories([])
                return
            }

            setLoading(true)
            try {
                const result = await client.fetch(
                    `*[_id == $id][0].subCategories`,
                    { id: categoryRef._ref }
                )
                if (isMounted) {
                    setSubCategories(result || [])
                }
            } catch (err) {
                console.error('Error fetching subcategories:', err)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchSubCategories()
        return () => { isMounted = false }
    }, [categoryRef?._ref, client])

    const handleChange = useCallback(
        (event: React.FormEvent<HTMLSelectElement>) => {
            const nextValue = event.currentTarget.value
            onChange(nextValue ? set(nextValue) : unset())
        },
        [onChange]
    )

    return (
        <Stack space={3}>
            <Select
                {...elementProps}
                onChange={handleChange}
                value={value}
                disabled={loading || !categoryRef?._ref}
            >
                <option value="">Select Sub-Category</option>
                {subCategories.map((sub) => (
                    <option key={sub} value={sub}>
                        {sub}
                    </option>
                ))}
            </Select>
            {loading && (
                <Card padding={2}>
                    <Flex align="center" gap={3}>
                        <Spinner muted />
                        <Text size={1} muted>Loading sub-categories...</Text>
                    </Flex>
                </Card>
            )}
            {!loading && !categoryRef?._ref && (
                <Text size={1} muted>
                    Please select a Category first to see available options.
                </Text>
            )}
            {!loading && categoryRef?._ref && subCategories.length === 0 && (
                <Text size={1} muted>
                    No sub-categories found for the selected category.
                </Text>
            )}
        </Stack>
    )
}
