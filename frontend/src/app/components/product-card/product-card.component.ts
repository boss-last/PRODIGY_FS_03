import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-card" [routerLink]="['/product', product._id]">
      <div class="product-image">
        <img [src]="product.images[0]?.url" [alt]="product.name">
        <div class="product-badges">
          <span *ngIf="product.isNew" class="pbadge pbadge-new">Nouveau</span>
          <span *ngIf="product.comparePrice" class="pbadge pbadge-discount">Promo</span>
        </div>
        <button class="wish-btn" (click)="toggleWishlist($event)">
          ❤️
        </button>
      </div>
      
      <div class="product-body">
        <div class="product-cat">{{ product.category }}</div>
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="product-origin">📍 {{ product.origin }}</div>
        
        <div class="stars">
          <span class="star">★</span>
          <span>{{ product.avgRating }}</span>
          <span class="stars-count">({{ product.numReviews }})</span>
        </div>

        <div class="product-footer">
          <div class="price-wrap">
            <div class="price-cur">{{ product.price | number:'1.0-0' }} {{ product.currency }}</div>
            <div *ngIf="product.comparePrice" class="price-compare">{{ product.comparePrice | number:'1.0-0' }}</div>
          </div>
          <button class="add-btn" (click)="addToCart($event)">
            <span>+</span> Ajouter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private cartService: CartService) {}

  toggleWishlist(event: Event) {
    event.stopPropagation();
    // Wishlist logic could be added here
  }

  addToCart(event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(this.product);
    // Optionnel: On peut ouvrir le panier automatiquement
    this.cartService.toggleDrawer();
  }
}
