import product from './documents/product'
import category from './documents/category'
import post from './documents/post'
import author from './documents/author'
import homePage from './singletons/homePage'
import siteSettings from './singletons/siteSettings'

export const schemaTypes = [
    product,
    category,
    post,
    author,
    homePage,
    siteSettings,
]

export const schema = {
    types: schemaTypes,
}
