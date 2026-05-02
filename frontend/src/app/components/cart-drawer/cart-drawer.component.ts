import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-overlay" (click)="close()" *ngIf="isOpen$ | async"></div>
    <div class="cart-drawer" *ngIf="isOpen$ | async">
      <div class="cart-header">
        <div class="cart-title">Votre Panier</div>
        <button class="close-btn" (click)="close()">✕</button>
      </div>

      <div class="cart-items">
        <div *ngIf="(cartItems$ | async)?.length === 0" style="text-align: center; padding: 3rem 0;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
          <p>Votre panier est vide</p>
          <button class="btn btn-clay" style="margin-top: 1rem;" (click)="close()">Continuer vos achats</button>
        </div>

        <div *ngFor="let item of (cartItems$ | async)" class="cart-item">
          <img [src]="item.images[0]?.url" [alt]="item.name" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.9rem;">{{ item.name }}</div>
            <div style="font-size: 0.8rem; color: var(--ink3);">{{ item.quantity }} x {{ item.price | number }} {{ item.currency }}</div>
          </div>
          <button (click)="remove(item._id)" style="border: none; background: none; cursor: pointer;">🗑️</button>
        </div>
      </div>

      <div class="cart-footer" style="padding: 1.5rem; border-top: 1px solid var(--border);" *ngIf="(cartItems$ | async)?.length! > 0">
        <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 1.5rem;">
          <span>Total</span>
          <span>{{ total$ | async | number }} XOF</span>
        </div>
        <button class="btn-add-main" style="width: 100%;" routerLink="/checkout" (click)="close()">
          Commander
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class CartDrawerComponent {
  cartItems$: Observable<CartItem[]>;
  total$: Observable<number>;
  isOpen$: Observable<boolean>;

  constructor(private cartService: CartService) {
    this.cartItems$ = this.cartService.cart$;
    this.isOpen$ = this.cartService.drawerOpen$;
    this.total$ = new Observable(sub => {
       this.cartService.cart$.subscribe(() => {
         sub.next(this.cartService.getTotalPrice());
       });
    });
  }

  close() {
    this.cartService.closeDrawer();
  }

  remove(id: string) {
    this.cartService.removeFromCart(id);
  }
}
