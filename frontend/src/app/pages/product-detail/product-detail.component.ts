import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, RouterLink],
  template: `
    <app-header></app-header>

    <main class="container section" *ngIf="product">
      <div class="product-detail">
        <!-- IMAGE -->
        <div class="detail-image-main">
          <img [src]="product.images[0]?.url" [alt]="product.name">
        </div>

        <!-- INFO -->
        <div class="detail-info">
          <div class="detail-eyebrow">{{ product.category }}</div>
          <h1 class="detail-title">{{ product.name }}</h1>
          <div class="detail-origin">📍 {{ product.origin }}</div>

          <div class="stars">
            <span class="star">★</span>
            <span>{{ product.avgRating }}</span>
            <span class="stars-count">({{ product.numReviews }} avis)</span>
          </div>

          <div class="detail-price">
            <div class="detail-price-main">{{ product.price | number:'1.0-0' }} {{ product.currency }}</div>
            <div *ngIf="product.comparePrice" class="detail-price-compare">{{ product.comparePrice | number:'1.0-0' }}</div>
          </div>

          <p class="detail-desc">{{ product.description }}</p>

          <div class="detail-actions">
            <div class="qty-control">
              <button class="qty-btn" (click)="qty = qty > 1 ? qty - 1 : 1">-</button>
              <div class="qty-val">{{ qty }}</div>
              <button class="qty-btn" (click)="qty = qty + 1">+</button>
            </div>
            <button class="btn-add-main" (click)="addToCart()">
              🛒 Ajouter au panier
            </button>
          </div>

          <div class="detail-meta">
             <div class="meta-row"><span class="meta-key">Stock :</span> <span class="meta-val">{{ product.stock }} unités</span></div>
             <div class="meta-row"><span class="meta-key">Poids :</span> <span class="meta-val">{{ product.weight }} kg</span></div>
          </div>
        </div>
      </div>

      <!-- REVIEWS SECTION -->
      <section class="section" style="border-top: 1px solid var(--border); margin-top: 4rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 class="section-title" style="margin-bottom: 0;">Avis <span>clients</span></h2>
          <button *ngIf="!showReviewForm && authService.currentUserValue" (click)="showReviewForm = true" class="btn btn-clay btn-sm">
            Laisser un avis
          </button>
        </div>

        <!-- REVIEW FORM -->
        <div *ngIf="showReviewForm" style="background: var(--clay-light); padding: 2rem; border-radius: var(--r-lg); margin-bottom: 3rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem;">Votre avis nous intéresse</h3>
          <form (ngSubmit)="submitReview()">
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Note</label>
              <div class="rating-input" style="display: flex; gap: 0.5rem; font-size: 1.5rem; color: #ffd700; cursor: pointer;">
                <span *ngFor="let s of [1,2,3,4,5]" (click)="newReview.rating = s">
                  {{ s <= newReview.rating ? '★' : '☆' }}
                </span>
              </div>
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Titre</label>
              <input type="text" [(ngModel)]="newReview.title" name="title" class="price-input" style="width: 100%;" placeholder="Ex: Excellent produit !" required>
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Commentaire</label>
              <textarea [(ngModel)]="newReview.comment" name="comment" class="price-input" style="width: 100%; height: 100px; padding: 1rem;" placeholder="Partagez votre expérience..." required></textarea>
            </div>
            <div style="display: flex; gap: 1rem;">
              <button type="submit" class="btn btn-clay">Envoyer l'avis</button>
              <button type="button" class="btn" (click)="showReviewForm = false">Annuler</button>
            </div>
          </form>
        </div>

        <div *ngIf="product.reviews?.length === 0" style="padding: 2rem 0; color: var(--ink3);">
          Aucun avis pour le moment. Soyez le premier à donner votre avis !
        </div>
        <div *ngFor="let rev of product.reviews" style="padding: 1.5rem 0; border-bottom: 1px solid var(--border);">
           <div class="stars">
             <span class="star" *ngFor="let s of [1,2,3,4,5]" style="color: #ffd700;">
               {{ s <= rev.rating ? '★' : '☆' }}
             </span>
           </div>
           <div style="font-weight: 600; margin-bottom: 0.5rem;">{{ rev.title }}</div>
           <p style="font-size: 0.9rem; color: var(--ink2);">{{ rev.comment }}</p>
           <div style="font-size: 0.75rem; color: var(--ink3); margin-top: 0.5rem;">Par {{ rev.user?.name || 'Client' }}</div>
        </div>
      </section>
    </main>

    <app-footer></app-footer>
  `,
  styles: []
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  qty: number = 1;
  showReviewForm = false;
  newReview = {
    rating: 5,
    title: '',
    comment: ''
  };

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProduct();
  }

  loadProduct() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.productService.getProductById(id).subscribe(res => {
          if (res.success) {
            this.product = res.data;
          }
        });
      }
    });
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.qty);
      alert('Produit ajouté au panier !');
    }
  }

  submitReview() {
    if (!this.product) return;
    const token = this.authService.currentUserValue?.token;
    if (!token) {
      alert('Veuillez vous connecter pour laisser un avis.');
      return;
    }

    this.productService.addReview(this.product._id, this.newReview, token).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Merci pour votre avis !');
          this.showReviewForm = false;
          this.newReview = { rating: 5, title: '', comment: '' };
          this.loadProduct(); // Reload to show the new review
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors de l\'envoi de l\'avis');
      }
    });
  }
}
