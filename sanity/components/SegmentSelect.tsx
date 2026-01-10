import React, { useState, useEffect, useCallback } from 'react'
import { Select, Stack, Text, Card, Spinner, Flex } from '@sanity/ui'
import { set, unset, useFormValue, useClient, StringInputProps } from 'sanity'

export function SegmentSelect(props: StringInputProps) {
    const { onChange, value = '', elementProps } = props
    const [segments, setSegments] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const client = useClient({ apiVersion: '2023-01-01' })

    // Get the selected category and sub-category from the form state
    const categoryRef = useFormValue(['category']) as { _ref?: string } | undefined
    const subCategory = useFormValue(['subCategory']) as string | undefined

    useEffect(() => {
        let isMounted = true

        async function fetchSegments() {
            if (!categoryRef?._ref || !subCategory) {
                setSegments([])
                return
            }

            setLoading(true)
            try {
                const result = await client.fetch(
                    `*[_id == $id][0].categorySegments[subCategoryName == $subCategory][0].segments`,
                    { id: categoryRef._ref, subCategory }
                )
                if (isMounted) {
                    setSegments(result || [])
                }
            } catch (err) {
                console.error('Error fetching segments:', err)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchSegments()
        return () => { isMounted = false }
    }, [categoryRef?._ref, subCategory, client])

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
                disabled={loading || !subCategory}
            >
                <option value="">Select Segment</option>
                {segments.map((segment) => (
                    <option key={segment} value={segment}>
                        {segment}
                    </option>
                ))}
            </Select>
            {loading && (
                <Card padding={2}>
                    <Flex align="center" gap={3}>
                        <Spinner muted />
                        <Text size={1} muted>Loading segments...</Text>
                    </Flex>
                </Card>
            )}
            {!loading && !subCategory && (
                <Text size={1} muted>
                    Please select a Sub-Category first to see available segments.
                </Text>
            )}
            {!loading && subCategory && segments.length === 0 && (
                <Text size={1} muted>
                    No segments found for the selected sub-category.
                </Text>
            )}
        </Stack>
    )
}
