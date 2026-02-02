import type { Product as SharedProduct } from 'types';
import natural from 'natural';

type ProductView = Pick<
  SharedProduct,
  | 'id'
  | 'name'
  | 'description'
  | 'category'
  | 'modelKey'
  | 'price'
  | 'image'
  | 'stock'
  | 'originalPrice'
  | 'rating'
  | 'reviewCount'
  | 'inStock'
>;

type IndexedProduct = {
  product: ProductView;
  vector: Map<string, number>;
  norm: number;
};

type RecommendationIndex = {
  key: string;
  builtAtMs: number;
  byId: Map<string, IndexedProduct>;
  all: IndexedProduct[];
};

const tokenizer = new natural.WordTokenizer();
const stopwordSet = new Set<string>([
  ...(Array.isArray((natural as any).stopwords) ? ((natural as any).stopwords as string[]) : []),
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'has',
  'have',
  'in',
  'into',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'then',
  'there',
  'these',
  'this',
  'to',
  'was',
  'were',
  'will',
  'with',
]);

function tokenizeAndStem(text: string): string[] {
  const raw = tokenizer.tokenize(text.toLowerCase());
  const out: string[] = [];
  for (const r of raw) {
    const t = r.trim();
    if (t.length < 3) continue;
    if (!/^[a-z0-9]+$/.test(t)) continue;
    if (stopwordSet.has(t)) continue;
    out.push(natural.PorterStemmer.stem(t));
  }
  return out;
}

function cosineSimilarity(a: Map<string, number>, aNorm: number, b: Map<string, number>, bNorm: number) {
  if (aNorm === 0 || bNorm === 0) return 0;
  let dot = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  small.forEach((v, k) => {
    const bv = large.get(k);
    if (bv !== undefined) dot += v * bv;
  });
  return dot / (aNorm * bNorm);
}

function toText(p: ProductView): string {
  return `${p.name ?? ''} ${p.description ?? ''} ${p.category ?? ''} ${p.modelKey ?? ''}`.trim();
}

function computeKey(products: ProductView[]): string {
  const ids = products.map(p => String(p.id)).sort();
  const first = ids[0] ?? '';
  const last = ids[ids.length - 1] ?? '';
  return `${products.length}:${first}:${last}`;
}

function buildIndex(products: ProductView[]): RecommendationIndex {
  const key = computeKey(products);

  const tfidf = new natural.TfIdf();
  for (const product of products) {
    const tokens = tokenizeAndStem(toText(product));
    tfidf.addDocument(tokens.join(' '));
  }

  const byId = new Map<string, IndexedProduct>();
  const all: IndexedProduct[] = [];

  for (let i = 0; i < products.length; i += 1) {
    const product = products[i];
    const vector = new Map<string, number>();
    let normSq = 0;
    const terms = tfidf.listTerms(i);
    for (let j = 0; j < terms.length; j += 1) {
      const term = terms[j]?.term;
      const w = terms[j]?.tfidf;
      if (!term || !Number.isFinite(w)) continue;
      vector.set(term, w);
      normSq += w * w;
    }

    const indexed: IndexedProduct = {
      product,
      vector,
      norm: Math.sqrt(normSq),
    };

    byId.set(String(product.id), indexed);
    all.push(indexed);
  }

  return { key, builtAtMs: Date.now(), byId, all };
}

let cached: RecommendationIndex | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

function getOrBuildIndex(products: ProductView[]) {
  const key = computeKey(products);
  if (cached && cached.key === key && Date.now() - cached.builtAtMs < CACHE_TTL_MS) return cached;
  cached = buildIndex(products);
  return cached;
}

function clamp01(v: number) {
  if (Number.isNaN(v) || !Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function scoreCandidate(seed: ProductView, seedIdx: IndexedProduct, candidateIdx: IndexedProduct) {
  const sim = cosineSimilarity(seedIdx.vector, seedIdx.norm, candidateIdx.vector, candidateIdx.norm);
  const sameCategory = seed.category && candidateIdx.product.category === seed.category ? 1 : 0;
  const rating = clamp01((candidateIdx.product.rating ?? 0) / 5);
  const reviews = clamp01(Math.log10((candidateIdx.product.reviewCount ?? 0) + 1) / 4);
  const inStockBoost = candidateIdx.product.inStock === false ? -0.05 : 0.02;
  return sim + sameCategory * 0.05 + rating * 0.03 + reviews * 0.02 + inStockBoost;
}

export function recommendForProduct(
  seedProductId: string,
  products: ProductView[],
  limit: number
): ProductView[] {
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit || 8)));
  const index = getOrBuildIndex(products);
  const seed = index.byId.get(String(seedProductId));
  if (!seed) return [];

  const scored: Array<{ score: number; product: ProductView }> = [];
  for (const candidate of index.all) {
    if (candidate.product.id === seed.product.id) continue;
    scored.push({
      score: scoreCandidate(seed.product, seed, candidate),
      product: candidate.product,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, safeLimit).map(v => v.product);
}
