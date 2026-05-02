import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import { useAuth } from '../context/AuthContext';

const CAT_EMOJI = {
  'Alimentation':'🍽️','Artisanat':'🧺','Beauté':'✨','Vêtements':'👗',
  'Électronique':'📱','Maison':'🏠','Agriculture':'🌾','Boissons':'☕','Épices':'🌶️',
};

export default function HomePage({ onCategory }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newest, setNewest] = useState([]);
  const [wishlist, setWishlist] = useState(user?.wishlist || []);

  useEffect(() => {
    Promise.all([
      api.get('/products/featured'),
      api.get('/products/categories'),
      api.get('/products?isNew=true&limit=4'),
    ]).then(([f, c, n]) => {
      setFeatured(f.data.data);
      setCategories(c.data.data);
      setNewest(n.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => { setWishlist(user?.wishlist || []); }, [user]);

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-eyebrow">🌱 Produits 100% Locaux</div>
          <h1>
            Le meilleur de <em>Côte d'Ivoire</em><br />
            livré chez vous
          </h1>
          <p>
            Artisanat, épices, vêtements wax, karité et cacao bio
            directement des producteurs locaux d'Abidjan et du pays.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-clay btn-lg" onClick={() => navigate('/shop')}>
              Découvrir les produits →
            </button>
            <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}
              onClick={() => navigate('/shop?category=Artisanat')}>
              🧺 Artisanat
            </button>
          </div>
          <div className="hero-stats">
            {[['150+','Produits locaux'],['50+','Artisans partenaires'],['24h','Livraison Abidjan']].map(([v,l]) => (
              <div key={l}>
                <div className="hero-stat-val">{v}</div>
                <div className="hero-stat-lab">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section-sm">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-title">Parcourir par <span>catégorie</span></div>
              <div className="section-sub">Toutes les saveurs de la Côte d'Ivoire</div>
            </div>
          </div>
          <div className="cat-grid">
            {categories.map(c => (
              <div key={c._id} className="cat-pill" onClick={() => { onCategory?.(c._id); navigate('/shop'); }}>
                <div className="cat-emoji">{CAT_EMOJI[c._id] || '📦'}</div>
                <div className="cat-name">{c._id}</div>
                <div className="cat-count">{c.count} produit{c.count > 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-title">Produits <span>phares</span></div>
              <div className="section-sub">Sélectionnés par notre équipe pour leur qualité</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/shop')}>Voir tout →</button>
          </div>
          <div className="products-grid">
            {featured.map(p => (
              <ProductCard key={p._id} product={p} wishlist={wishlist} onWishlistUpdate={setWishlist} />
            ))}
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section style={{ background: 'var(--forest)', padding: '3rem 0', margin: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
              Livraison gratuite dès <span style={{ color: 'var(--gold)' }}>25 000 XOF</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
              Pour toute commande à Abidjan. Délai : 24h à 48h selon le quartier.
            </p>
          </div>
          <button className="btn btn-lg" style={{ background: 'var(--gold)', color: 'white', border: 'none', flexShrink: 0 }}
            onClick={() => navigate('/shop')}>
            Commander maintenant
          </button>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newest.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-title">Nouveautés 🌟</div>
                <div className="section-sub">Tout juste arrivés en boutique</div>
              </div>
            </div>
            <div className="products-grid">
              {newest.map(p => (
                <ProductCard key={p._id} product={p} wishlist={wishlist} onWishlistUpdate={setWishlist} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section style={{ background: 'var(--clay-light)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-title">Pourquoi choisir <span>Mama Africa</span> ?</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              ['🌱','100% Local','Tous nos produits viennent d\'artisans et producteurs ivoiriens.'],
              ['✅','Qualité garantie','Chaque produit est vérifié et certifié avant mise en vente.'],
              ['🚚','Livraison rapide','Livraison en 24h à Abidjan, 48-72h en région.'],
              ['💚','Paiement sécurisé','Mobile Money, Wave, paiement à la livraison disponibles.'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink3)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
