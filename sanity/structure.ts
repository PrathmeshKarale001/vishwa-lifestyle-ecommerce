import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Vishwa Administration')
    .items([
      // --- STORE ---
      S.listItem()
        .title('Store Management')
        .child(
          S.list()
            .title('Store Items')
            .items([
              S.documentTypeListItem('product').title('All Products'),
              S.documentTypeListItem('category').title('Categories'),
            ])
        ),

      S.divider(),

      // --- PAGES ---
      S.listItem()
        .title('Pages & Content')
        .child(
          S.list()
            .title('Website Sections')
            .items([
              S.listItem()
                .title('Homepage Config')
                .child(
                  S.document()
                    .schemaType('homePage')
                    .documentId('homePage')
                ),
              S.divider(),
              S.documentTypeListItem('post').title('Blog / Stories'),
              S.documentTypeListItem('author').title('Authors'),
            ])
        ),

      S.divider(),

      // --- CONFIG ---
      S.listItem()
        .title('System Configuration')
        .child(
          S.list()
            .title('Global Settings')
            .items([
              S.listItem()
                .title('Site Settings (Logo, SEO, Footer)')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
            ])
        ),
    ])
