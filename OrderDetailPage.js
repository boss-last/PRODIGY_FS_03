import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const fmtXOF = n => new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-CI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtTime = d => d ? new Date(d).toLocaleTimeString('fr-CI', { hour: '2-digit', minute: '2-digit' }) : '';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_ICONS = { pending: '⏳', confirmed: '✅', processing: '📦', shipped: '🚚', delivered: '🎉', cancelled: '❌' };
const STATUS_LABELS_FR = { pending: 'Reçue', confirmed: 'Confirmée', processing: 'En préparation', shipped: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.data))
      .catch(() => navigate('/account'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Annuler cette commande ?')) return;
    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${id}/cancel`);
      setOrder(data.data);
      toast.success('Commande annulée.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d\'annuler.');
    } finally { setCancelling(false); }
  };

  if (loading) return <div className="centered"><div className="spinner spinner-lg" /></div>;
  if (!order)  return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container section">
      <div className="breadcrumb">
        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>Accueil</a>
        <span>›</span>
        <a href="/account" onClick={e => { e.preventDefault(); navigate('/account'); }}>Mon compte</a>
        <span>›</span>
        <span style={{ color: 'var(--ink2)' }}>Commande {order.orderNumber}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 700 }}>{order.orderNumber}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink3)', marginTop: 3 }}>
            Passée le {fmtDate(order.createdAt)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`status-badge sb-${order.status}`}>
            {STATUS_ICONS[order.status]} {STATUS_LABELS_FR[order.status]}
          </span>
          {['pending', 'confirmed'].includes(order.status) && (
            <button className="btn btn-outline btn-sm" onClick={handleCancel} disabled={cancelling} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              {cancelling ? '…' : 'Annuler'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          {/* Progress bar */}
          {!isCancelled && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.75rem', marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>
                Suivi de commande
              </div>

              {/* Step bar */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '19px', left: '5%', right: '5%', height: 3, background: 'var(--border)', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '19px', left: '5%', height: 3, background: 'var(--clay)', zIndex: 0, width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 90)}%`, transition: 'width 0.5s ease' }} />
                {STATUS_STEPS.map((step, idx) => {
                  const done    = idx < currentStep;
                  const current = idx === currentStep;
                  return (
                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <div style={{
                        width: 40, height: 40,
                        borderRadius: '50%',
                        background: done ? 'var(--clay)' : current ? 'var(--clay)' : 'white',
                        border: `2.5px solid ${done || current ? 'var(--clay)' : 'var(--border2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem',
                        boxShadow: current ? '0 0 0 4px rgba(192,96,26,0.2)' : 'none',
                        transition: 'all 0.3s',
                      }}>
                        {done ? '✓' : STATUS_ICONS[step]}
                      </div>
                      <div style={{ fontSize: '0.65rem', fontWeight: current ? 700 : 500, color: current ? 'var(--clay)' : done ? 'var(--ink2)' : 'var(--ink3)', marginTop: '0.4rem', textAlign: 'center', lineHeight: 1.3 }}>
                        {STATUS_LABELS_FR[step]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline events */}
              <div className="tracking-timeline">
                {[...order.trackingEvents].reverse().map((ev, idx) => (
                  <div key={idx} className={`tracking-event ${idx === 0 ? 'current' : 'done'}`}>
                    <div className="tracking-dot" />
                    <div className="tracking-status">{STATUS_LABELS_FR[ev.status] || ev.status}</div>
                    <div className="tracking-desc">{ev.description}</div>
                    {ev.location && <div className="tracking-time">📍 {ev.location}</div>}
                    <div className="tracking-time">{fmtDate(ev.timestamp)} à {fmtTime(ev.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.75rem' }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>
              Articles commandés
            </div>
            {order.items.map(item => (
              <div key={item._id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <img
                  src={item.image || 'https://via.placeholder.com/60?text=📦'}
                  alt={item.name}
                  style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', background: 'var(--clay-light)', flexShrink: 0 }}
                  onError={e => { e.target.src='https://via.placeholder.com/60?text=📦'; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginTop: 2 }}>
                    {fmtXOF(item.price)} × {item.qty}
                  </div>
                </div>
                <div style={{ fontWeight: 700, flexShrink: 0 }}>{fmtXOF(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Summary */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, marginBottom: '1rem' }}>Récapitulatif</div>
            {[
              ['Sous-total', fmtXOF(order.subtotal)],
              ['Livraison',  order.shippingCost === 0 ? '🎉 Gratuite' : fmtXOF(order.shippingCost)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--ink2)', padding: '0.3rem 0' }}>
                <span>{k}</span>
                <span style={k === 'Livraison' && order.shippingCost === 0 ? { color: 'var(--success)', fontWeight: 600 } : {}}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--clay)' }}>{fmtXOF(order.total)}</span>
            </div>
          </div>

          {/* Delivery address */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, marginBottom: '1rem' }}>📍 Livraison</div>
            {[
              ['Destinataire', order.shippingAddress?.name],
              ['Téléphone',    order.shippingAddress?.phone],
              ['Adresse',      order.shippingAddress?.street],
              ['Commune',      order.shippingAddress?.district],
              ['Ville',        order.shippingAddress?.city],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.83rem', padding: '0.2rem 0' }}>
                <span style={{ color: 'var(--ink3)', minWidth: 90 }}>{k}</span>
                <span style={{ color: 'var(--ink2)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Payment */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, marginBottom: '1rem' }}>💳 Paiement</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink2)' }}>
              {order.paymentMethod?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <span className={`status-badge ${order.paymentStatus === 'paid' ? 'sb-delivered' : 'sb-pending'}`}>
                {order.paymentStatus === 'paid' ? '✅ Payé' : '⏳ En attente'}
              </span>
            </div>
            {order.estimatedDelivery && (
              <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginTop: '0.75rem' }}>
                Livraison estimée : {fmtDate(order.estimatedDelivery)}
              </div>
            )}
          </div>

          <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => navigate('/shop')}>
            ← Continuer les achats
          </button>
        </div>
      </div>
    </div>
  );
}
