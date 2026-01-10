import React, { useCallback } from 'react'
import { Select, Stack, Text } from '@sanity/ui'
import { set, unset, useFormValue, StringInputProps } from 'sanity'

export function SubCategoryNameSelect(props: StringInputProps) {
    const { onChange, value = '', elementProps } = props

    // Access the list of sub-categories from the document root
    const subCategories = useFormValue(['subCategories']) as string[] | undefined

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
            >
                <option value="">Select Sub-Category Name</option>
                {subCategories?.filter(sub => typeof sub === 'string').map((sub) => (
                    <option key={sub} value={sub}>
                        {sub}
                    </option>
                ))}
            </Select>
            {!subCategories || subCategories.length === 0 ? (
                <Text size={1} muted>
                    Please add Sub-Categories in the list above first.
                </Text>
            ) : (
                <Text size={1} muted>
                    Only sub-categories defined in the list above are shown here.
                </Text>
            )}
        </Stack>
    )
}
