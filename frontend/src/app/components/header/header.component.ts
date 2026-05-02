import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="site-header" style="background: white; border-bottom: 1px solid #e1e8ed; height: 53px; position: sticky; top: 0; z-index: 1000;">
      <div class="container" style="display: flex; align-items: center; justify-content: space-between; height: 100%; max-width: 1200px;">
        <a routerLink="/" style="font-size: 20px; font-weight: 900; color: var(--clay); text-decoration: none;">
          MAMA AFRICA
        </a>

        <div style="flex: 1; max-width: 400px; margin: 0 20px;">
           <input type="text" placeholder="Rechercher un produit..." 
                  style="width: 100%; background: #e6ecf0; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; outline: none;">
        </div>

        <nav style="display: flex; align-items: center; gap: 15px;">
          <a routerLink="/" style="font-size: 20px; color: #14171a; text-decoration: none; cursor: pointer;">🏠</a>
          <a routerLink="/shop" style="font-size: 20px; color: #14171a; text-decoration: none; cursor: pointer;">�️</a>
          <button (click)="toggleCart()" style="font-size: 20px; background: none; border: none; cursor: pointer; position: relative;">
            🛒
            <span *ngIf="cartCount$ | async as count" style="position: absolute; top: -5px; right: -10px; background: var(--clay); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; display: flex; align-items: center; justify-content: center;">{{ count }}</span>
          </button>
          
          <a routerLink="/auth" *ngIf="!(user$ | async)" style="font-weight: 700; color: var(--clay); text-decoration: none; cursor: pointer;">Connexion</a>
          
          <ng-container *ngIf="user$ | async as user">
            <a routerLink="/account" style="cursor: pointer;">
              <img [src]="user.profilePicture" style="width: 32px; height: 32px; border-radius: 50%;">
            </a>
            <button (click)="logout()" style="border: none; background: none; cursor: pointer; font-size: 18px;">🚪</button>
          </ng-container>
        </nav>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  user$: Observable<User | null>;
  cartCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.user$ = this.authService.currentUser;
    this.cartCount$ = new Observable(sub => {
      this.cartService.cart$.subscribe(() => {
        sub.next(this.cartService.getTotalItems());
      });
    });
  }

  toggleCart() {
    this.cartService.toggleDrawer();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
