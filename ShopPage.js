import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Alimentation','Artisanat','Beauté','Vêtements','Électronique','Maison','Agriculture','Boissons','Épices'];
const CAT_EMOJI  = { 'Alimentation':'🍽️','Artisanat':'🧺','Beauté':'✨','Vêtements':'👗','Électronique':'📱','Maison':'🏠','Agriculture':'🌾','Boissons':'☕','Épices':'🌶️' };

const SORTS = [
  { val: '-createdAt', label: 'Plus récents' },
  { val: 'price_asc',  label: 'Prix croissant' },
  { val: 'price_desc', label: 'Prix décroissant' },
  { val: 'rating',     label: 'Mieux notés' },
  { val: 'popular',    label: 'Plus populaires' },
];

export default function ShopPage({ initCategory = '', initSearch = '' }) {
  const { user } = useAuth();
  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [wishlist, setWishlist]     = useState(user?.wishlist || []);

  const [category, setCategory] = useState(initCategory);
  const [search, setSearch]     = useState(initSearch);
  const [sort, setSort]         = useState('-createdAt');
  const [minP, setMinP]         = useState('');
  const [maxP, setMaxP]         = useState('');
  const [inStock, setInStock]   = useState(false);
  const [isNew, setIsNew]       = useState(false);
  const [page, setPage]         = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort });
      if (category) params.set('category', category);
      if (search)   params.set('search', search);
      if (minP)     params.set('minPrice', minP);
      if (maxP)     params.set('maxPrice', maxP);
      if (inStock)  params.set('inStock', 'true');
      if (isNew)    params.set('isNew', 'true');
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [page, sort, category, search, minP, maxP, inStock, isNew]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [category, search, sort, minP, maxP, inStock, isNew]);
  useEffect(() => { setWishlist(user?.wishlist || []); }, [user]);
  useEffect(() => { setCategory(initCategory); }, [initCategory]);
  useEffect(() => { setSearch(initSearch); }, [initSearch]);

  const clearFilters = () => {
    setCategory(''); setSearch(''); setMinP(''); setMaxP('');
    setInStock(false); setIsNew(false); setSort('-createdAt');
  };

  const hasFilters = category || search || minP || maxP || inStock || isNew;

  return (
    <div className="container section">
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 700 }}>
          {category ? `${CAT_EMOJI[category] || '📦'} ${category}` : 'Tous les produits'}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink3)', marginTop: 3 }}>
          {loading ? '…' : `${pagination.total} produit${pagination.total > 1 ? 's' : ''} trouvé${pagination.total > 1 ? 's' : ''}`}
        </div>
      </div>

      <div className="shop-layout">
        {/* FILTER SIDEBAR */}
        <aside className="filter-panel">
          <div className="filter-title">
            Filtres
            {hasFilters && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--clay)', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="filter-section">
            <div className="filter-section-label">Catégorie</div>
            <button className={`filter-option ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>
              <span className="filter-check">{!category && '✓'}</span>
              Toutes les catégories
            </button>
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-option ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                <span className="filter-check">{category === c && '✓'}</span>
                {CAT_EMOJI[c]} {c}
              </button>
            ))}
          </div>

          {/* Price range */}
          <div className="filter-section">
            <div className="filter-section-label">Prix (XOF)</div>
            <div className="price-inputs">
              <input className="price-input" placeholder="Min" value={minP} onChange={e => setMinP(e.target.value)} type="number" min="0" />
              <span style={{ color: 'var(--ink3)', fontSize: '0.8rem' }}>—</span>
              <input className="price-input" placeholder="Max" value={maxP} onChange={e => setMaxP(e.target.value)} type="number" min="0" />
            </div>
          </div>

          {/* Quick filters */}
          <div className="filter-section">
            <div className="filter-section-label">Options</div>
            <button className={`filter-option ${inStock ? 'active' : ''}`} onClick={() => setInStock(v => !v)}>
              <span className="filter-check">{inStock && '✓'}</span>
              En stock seulement
            </button>
            <button className={`filter-option ${isNew ? 'active' : ''}`} onClick={() => setIsNew(v => !v)}>
              <span className="filter-check">{isNew && '✓'}</span>
              Nouveautés
            </button>
          </div>
        </aside>

        {/* PRODUCTS */}
        <div>
          {/* Sort bar */}
          <div className="sort-bar">
            <span className="sort-label">
              {loading ? 'Chargement…' : `${pagination.total} résultat${pagination.total > 1 ? 's' : ''}`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="sort-label">Trier par :</span>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                {SORTS.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="centered"><div className="spinner spinner-lg" /></div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--ink3)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink2)', marginBottom: '0.5rem' }}>Aucun produit trouvé</div>
              <div style={{ fontSize: '0.875rem' }}>Essayez d'autres filtres.</div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={clearFilters}>Effacer les filtres</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(p => (
                  <ProductCard key={p._id} product={p} wishlist={wishlist} onWishlistUpdate={setWishlist} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem' }}>
                  <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Précédent</button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', alignSelf: 'center', color: 'var(--ink3)' }}>…</span>}
                        <button
                          className="btn btn-sm"
                          style={p === page ? { background: 'var(--clay)', color: 'white', border: '1.5px solid var(--clay)' } : {}}
                          onClick={() => setPage(p)}
                        >{p}</button>
                      </React.Fragment>
                    ))}
                  <button className="btn btn-outline btn-sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Suivant →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
