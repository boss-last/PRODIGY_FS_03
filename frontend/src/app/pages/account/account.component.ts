import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  template: `
    <app-header></app-header>
    <main class="container section" style="max-width: 900px;">
      @if (!user) {
        <div style="text-align: center; padding: 3rem 0;">
          <p>Veuillez vous connecter pour accéder à votre compte.</p>
          <button class="btn btn-clay" style="margin-top: 1rem;" routerLink="/auth">Se connecter</button>
        </div>
      }

      @if (user) {
        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
          <img [src]="user.profilePicture || 'https://ui-avatars.com/api/?name='+user.name" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--clay);">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">{{ user.name }}</h1>
            <p style="color: var(--ink3);">&#64;{{ user.username }}</p>
            <p style="color: var(--ink3); font-size: 0.85rem;">{{ user.email }}</p>
          </div>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: var(--r-lg); margin-bottom: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            🛒 Mes commandes
          </h2>
          
          @if (orders.length === 0) {
            <div style="color: var(--ink3); text-align: center; padding: 2rem 0;">
              <p>Aucune commande pour le moment.</p>
              <button class="btn btn-clay" style="margin-top: 1rem;" routerLink="/shop">Découvrir la boutique</button>
            </div>
          }

          @for (order of orders; track order._id) {
            <div class="order-card" style="border: 1px solid var(--border); border-radius: var(--r-md); padding: 1.25rem; margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                  <div style="font-weight: 700; font-size: 0.9rem; color: var(--clay);">{{ order.orderNumber }}</div>
                  <div style="font-size: 0.8rem; color: var(--ink3);">{{ order.createdAt | date:'short' }}</div>
                </div>
                <div [class]="'status-badge ' + order.status" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">
                  {{ order.status }}
                </div>
              </div>

              <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                 @for (item of order.items; track item.productId) {
                   <div style="flex: 0 0 auto; width: 60px;">
                     <img [src]="item.image" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                   </div>
                 }
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <div style="font-weight: 700;">Total: {{ order.totalPrice | number }} XOF</div>
                <button class="btn btn-clay btn-sm" (click)="toggleTracking(order._id)" style="font-size: 0.8rem;">
                  Suivre la commande
                </button>
              </div>

              @if (trackingVisible === order._id) {
                <div class="tracking-timeline" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed var(--border);">
                   @for (event of order.timeline; track event.timestamp) {
                     <div style="display: flex; gap: 1rem; margin-bottom: 1rem; position: relative;">
                       <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--clay); margin-top: 4px; z-index: 2;"></div>
                       <div style="flex: 1;">
                         <div style="font-weight: 600; font-size: 0.85rem;">{{ event.status }}</div>
                         <div style="font-size: 0.8rem; color: var(--ink3);">{{ event.message }}</div>
                         <div style="font-size: 0.7rem; color: var(--ink3);">{{ event.timestamp | date:'short' }}</div>
                       </div>
                     </div>
                   }
                </div>
              }
            </div>
          }
        </div>

        <button (click)="logout()" class="btn-add-main" style="width: 100%; background: #dc3545;">Se déconnecter</button>
      }
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    .status-badge.pending { background: #fff3cd; color: #856404; }
    .status-badge.confirmed { background: #d4edda; color: #155724; }
    .status-badge.delivered { background: #d1ecf1; color: #0c5460; }
    .status-badge.cancelled { background: #f8d7da; color: #721c24; }
  `]
})
export class AccountComponent implements OnInit {
  user: any = null;
  orders: any[] = [];
  trackingVisible: string | null = null;

  constructor(
    private authService: AuthService, 
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadOrders();
      }
    });
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe(res => {
      if (res.success) {
        this.orders = res.data;
      }
    });
  }

  toggleTracking(orderId: string) {
    this.trackingVisible = this.trackingVisible === orderId ? null : orderId;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
