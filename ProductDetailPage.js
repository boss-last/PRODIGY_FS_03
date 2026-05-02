import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const fmtXOF = n => new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
const Stars = ({ r, size = '0.9rem' }) => <span style={{ fontSize: size, color: 'var(--gold)' }}>{'★'.repeat(Math.round(r))}{'☆'.repeat(5 - Math.round(r))}</span>;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, setOpen, fmtXOF: fmt } = useCart();
  const toast = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Review form
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data.data))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="centered"><div className="spinner spinner-lg" /></div>;
  if (!product) return null;

  const disc = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAdd = () => {
    if (product.stock === 0) { toast.error('Rupture de stock.'); return; }
    addItem(product, qty);
    toast.success(`${product.name} ajouté au panier !`);
    setOpen(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Connectez-vous pour laisser un avis.'); navigate('/login'); return; }
    if (!review.comment.trim()) { toast.error('Le commentaire est obligatoire.'); return; }
    setReviewLoading(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, review);
      setProduct(data.data);
      setReview({ rating: 5, title: '', comment: '' });
      toast.success('Avis publié !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la publication.');
    } finally { setReviewLoading(false); }
  };

  // Rating breakdown
  const ratingCounts = [5,4,3,2,1].map(star => ({
    star,
    count: product.reviews.filter(r => r.rating === star).length,
  }));

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ paddingTop: '1.5rem' }}>
        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>Accueil</a>
        <span>›</span>
        <a href="/shop" onClick={e => { e.preventDefault(); navigate('/shop'); }}>Boutique</a>
        <span>›</span>
        <a href={`/shop?category=${product.category}`} onClick={e => { e.preventDefault(); navigate(`/shop?cat=${product.category}`); }}>{product.category}</a>
        <span>›</span>
        <span style={{ color: 'var(--ink2)' }}>{product.name}</span>
      </div>

      <div className="product-detail">
        {/* Image */}
        <div>
          <div className="detail-image-main">
            <img
              src={product.images?.[0]?.url || 'https://via.placeholder.com/600?text=📦'}
              alt={product.name}
              onError={e => { e.target.src='https://via.placeholder.com/600?text=📦'; }}
            />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              {product.images.map((img, i) => (
                <div key={i} style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--border)' }}>
                  <img src={img.url} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="detail-eyebrow">{product.category}</div>
          <div className="detail-title">{product.name}</div>
          <div className="detail-origin">📍 Origine : {product.origin}</div>

          {product.numReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Stars r={product.avgRating} size="1rem" />
              <span style={{ fontSize: '0.85rem', color: 'var(--ink3)' }}>{product.avgRating}/5 ({product.numReviews} avis)</span>
            </div>
          )}

          <div className="detail-price">
            <span className="detail-price-main">{fmtXOF(product.price)}</span>
            {product.comparePrice && <span className="detail-price-compare">{fmtXOF(product.comparePrice)}</span>}
            {disc > 0 && <span className="detail-price-tag">−{disc}%</span>}
          </div>

          <p className="detail-desc">{product.description}</p>

          {/* Stock indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {product.stock > 0 ? (
              <><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              <span style={{ color: 'var(--success)' }}>En stock ({product.stock} disponibles)</span></>
            ) : (
              <><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} />
              <span style={{ color: 'var(--danger)' }}>Rupture de stock</span></>
            )}
          </div>

          {/* Qty selector */}
          {product.stock > 0 && (
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <div className="qty-val">{qty}</div>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
          )}

          <div className="detail-actions">
            <button className="btn-add-main" onClick={handleAdd} disabled={product.stock === 0}>
              🛒 {product.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
            </button>
          </div>

          {/* Meta */}
          <div className="detail-meta">
            {product.brand && <div className="meta-row"><span className="meta-key">Marque</span><span className="meta-val">{product.brand}</span></div>}
            {product.weight && <div className="meta-row"><span className="meta-key">Poids</span><span className="meta-val">{product.weight} kg</span></div>}
            <div className="meta-row"><span className="meta-key">Livraison</span><span className="meta-val">🚚 24–48h Abidjan</span></div>
            <div className="meta-row"><span className="meta-key">Paiement</span><span className="meta-val">💳 Mobile Money · Wave · Livraison</span></div>
          </div>

          {product.tags?.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {product.tags.map(t => (
                <span key={t} style={{ background: 'var(--cream)', border: '1px solid var(--border)', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', color: 'var(--ink3)' }}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="reviews-section">
        <div className="section-title" style={{ marginBottom: '1.5rem' }}>Avis clients</div>

        {product.numReviews > 0 ? (
          <div className="reviews-summary">
            <div className="avg-rating">
              <div className="avg-num">{product.avgRating}</div>
              <div className="avg-stars"><Stars r={product.avgRating} size="1.3rem" /></div>
              <div className="avg-count">{product.numReviews} avis</div>
            </div>
            <div className="rating-bars">
              {ratingCounts.map(({ star, count }) => (
                <div className="rating-bar-row" key={star}>
                  <span style={{ width: 20, textAlign: 'right' }}>{star}★</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: product.numReviews ? `${(count / product.numReviews) * 100}%` : '0%' }} />
                  </div>
                  <span style={{ width: 24, color: 'var(--ink3)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--ink3)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Aucun avis pour l'instant. Soyez le premier !</p>
        )}

        {/* Reviews list */}
        {product.reviews.map(r => (
          <div key={r._id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">{r.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="reviewer-name">{r.name}</div>
                  <div className="review-date">{new Date(r.createdAt).toLocaleDateString('fr-CI', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
              <Stars r={r.rating} />
            </div>
            {r.title && <div className="review-title">{r.title}</div>}
            <div className="review-body">{r.comment}</div>
          </div>
        ))}

        {/* Write a review */}
        <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.75rem', marginTop: '2rem' }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            {user ? 'Laisser un avis' : 'Connectez-vous pour laisser un avis'}
          </div>
          {!user ? (
            <button className="btn btn-clay" onClick={() => navigate('/login')}>Se connecter</button>
          ) : (
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label>Note</label>
                <div style={{ display: 'flex', gap: '0.4rem', fontSize: '1.8rem', cursor: 'pointer', padding: '0.3rem 0' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={() => setReview(r => ({ ...r, rating: s }))} style={{ color: s <= review.rating ? 'var(--gold)' : 'var(--border2)', transition: 'color 0.1s' }}>★</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Titre (optionnel)</label>
                <input placeholder="Résumé de votre avis" value={review.title} onChange={e => setReview(r => ({ ...r, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Commentaire *</label>
                <textarea rows={4} placeholder="Partagez votre expérience avec ce produit…" value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} required />
              </div>
              <button className="btn btn-clay" type="submit" disabled={reviewLoading}>
                {reviewLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Publication…</> : 'Publier l\'avis'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
