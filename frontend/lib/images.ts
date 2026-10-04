// Curated Unsplash imagery for the storefront.
// All photos verified visually for topical accuracy + non-living subject
// (no portraits, no visible bodies on the editorial hero/maker images).
//
// If any URL 404s in your region, replace the photo id (the
// "photo-XXX-XXX" portion). The rest of the path is identical.

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const IMG = {
  // Hero · ikat textile detail (terracotta/red/black pattern)
  heroTextile: U("photo-1748141951488-9c9fb9603daf", 1400),
  // Hero side · stack of wicker baskets, top-down
  heroRattan: U("photo-1455669175216-9017c9b02fc6", 700),
  // Hero side · honey jar with citrus, dark moody background
  heroHoney: U("photo-1471943311424-646960669fbc", 700),

  // Maker story · LOOM in progress, woven jute texture (no people)
  makerStory: U("photo-1643766882273-335aae5a9309", 1000),

  // Sellers landing · workshop/craft photography
  sellerStudio: U("photo-1455669175216-9017c9b02fc6", 1200), // rattan baskets
  sellerLoom: U("photo-1643766882273-335aae5a9309", 1200),   // loom + jute
  sellerCoffee: U("photo-1610632380989-680fe40816c6", 1200), // coffee cup + beans
  sellerCeramic: U("photo-1610701596007-11502861dcfa", 1200),// ceramic cups
  sellerWeaving: U("photo-1748141951488-9c9fb9603daf", 1200),// ikat pattern
  sellerHoney: U("photo-1471943311424-646960669fbc", 1200),  // honey jar
  sellerAromatic: U("photo-1562835154-7ac43f0fec10", 1200),  // dried pine cones in basket

  // Journal hero / cards · craft details, materials
  jurnalIkat: U("photo-1748141951488-9c9fb9603daf", 1200),   // ikat pattern
  jurnalCoffee: U("photo-1442550528053-c431ecb55509", 1200), // coffee beans
  jurnalRattan: U("photo-1455669175216-9017c9b02fc6", 1200), // rattan baskets
  jurnalDye: U("photo-1778084356053-40103587d24f", 1200),    // indigo dye fabric grid
  jurnalCeramic: U("photo-1478234170285-53301bcf2461", 1200),// stacked clay pots
  jurnalKitchen: U("photo-1648587456176-4969b0124b12", 1200) // kraft packaging
};

export const SELLER_IMG: Record<string, string> = {
  "studio-waingapu": IMG.sellerLoom,      // ikat weavers
  "tanoh-roastery": IMG.sellerCoffee,     // coffee roasters
  "kayuh-studio": IMG.sellerStudio,       // rattan craft
  "tanah-ceramic": IMG.sellerCeramic,     // ceramic
  "wewangi-rumah": IMG.sellerAromatic,    // home fragrance (dried botanicals)
  "anyaman-ibu-sari": IMG.sellerWeaving,  // weavers
  "hutan-lestari": IMG.sellerHoney,       // forest honey
  "tongkonan-weave": IMG.jurnalIkat       // ikat
};
