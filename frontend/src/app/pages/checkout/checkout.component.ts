import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink],
  template: `
    <app-header></app-header>
    <main class="container section" style="max-width: 800px;">
      <h1 class="section-title">Finaliser la commande</h1>

      <div *ngIf="cartItems.length === 0" style="text-align: center; padding: 3rem 0;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
        <p>Votre panier est vide</p>
        <button class="btn btn-clay" style="margin-top: 1rem;" routerLink="/shop">Continuer vos achats</button>
      </div>

      <div *ngIf="cartItems.length > 0">
        <div class="cart-summary" style="background: white; padding: 1.5rem; border-radius: var(--r-lg); margin-bottom: 2rem;">
          <div *ngFor="let item of cartItems" style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border);">
            <img [src]="item.images[0]?.url" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
              <div style="font-weight: 600;">{{ item.name }}</div>
              <div style="font-size: 0.85rem; color: var(--ink3);">{{ item.quantity }} x {{ item.price | number }} {{ item.currency }}</div>
            </div>
            <div style="font-weight: 700;">{{ item.price * item.quantity | number }} {{ item.currency }}</div>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 700; padding-top: 1rem; font-size: 1.1rem;">
            <span>Total</span>
            <span>{{ total | number }} XOF</span>
          </div>
        </div>

        <form (ngSubmit)="placeOrder()" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700;">Adresse de livraison</h3>
          
          <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Nom complet</label>
            <input type="text" [(ngModel)]="shippingAddress.fullName" name="fullName" class="price-input" style="width: 100%;" required>
          </div>
          
          <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Téléphone</label>
            <input type="tel" [(ngModel)]="shippingAddress.phone" name="phone" class="price-input" style="width: 100%;" required>
          </div>
          
          <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Adresse</label>
            <input type="text" [(ngModel)]="shippingAddress.address" name="address" class="price-input" style="width: 100%;" required>
          </div>
          
          <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Ville</label>
            <input type="text" [(ngModel)]="shippingAddress.city" name="city" class="price-input" style="width: 100%;" required>
          </div>

          <h3 style="font-size: 1.1rem; font-weight: 700; margin-top: 1rem;">Mode de paiement</h3>
          
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <label style="flex: 1; min-width: 150px; padding: 1rem; border: 2px solid var(--border); border-radius: var(--r-md); cursor: pointer;" [class]="paymentMethod === 'card' ? 'border-color: var(--clay);' : ''">
              <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="card" style="margin-right: 0.5rem;">
              💳 Carte bancaire
            </label>
            <label style="flex: 1; min-width: 150px; padding: 1rem; border: 2px solid var(--border); border-radius: var(--r-md); cursor: pointer;">
              <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="mobile_money" style="margin-right: 0.5rem;">
              📱 Mobile Money
            </label>
            <label style="flex: 1; min-width: 150px; padding: 1rem; border: 2px solid var(--border); border-radius: var(--r-md); cursor: pointer;">
              <input type="radio" name="payment" [(ngModel)]="paymentMethod" value="cash_on_delivery" style="margin-right: 0.5rem;">
              💵 Paiement à la livraison
            </label>
          </div>

          <button type="submit" class="btn-add-main" style="width: 100%; margin-top: 1rem;" [disabled]="!authService.currentUserValue">
            {{ authService.currentUserValue ? 'Confirmer la commande' : 'Connectez-vous pour commander' }}
          </button>
          
          <div *ngIf="!authService.currentUserValue" style="text-align: center; font-size: 0.85rem; color: var(--ink3);">
            <a routerLink="/auth" style="color: var(--clay); font-weight: 600;">Se connecter</a> ou <a routerLink="/auth" style="color: var(--clay); font-weight: 600;">créer un compte</a>
          </div>
        </form>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styles: []
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  total = 0;
  paymentMethod = 'mobile_money';
  shippingAddress = {
    fullName: '',
    phone: '',
    address: '',
    city: ''
  };

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotalPrice();
    });
  }

  placeOrder() {
    if (!this.authService.currentUserValue) {
      alert('Veuillez vous connecter pour passer une commande.');
      this.router.navigate(['/auth']);
      return;
    }

    const orderData = {
      items: this.cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.images[0]?.url
      })),
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      itemsPrice: this.total,
      shippingPrice: 2000, // Fixed shipping for Abidjan
      totalPrice: this.total + 2000
    };
    
    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Commande passée avec succès ! 🎉');
          this.cartService.clearCart();
          this.router.navigate(['/account']);
        } else {
          alert('Erreur: ' + res.message);
        }
      },
      error: (err) => {
        alert('Erreur lors de la commande: ' + (err.error?.message || err.message));
      }
    });
  }
}
