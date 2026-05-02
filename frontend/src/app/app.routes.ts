import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { AuthComponent } from './pages/auth/auth.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AccountComponent } from './pages/account/account.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'account', component: AccountComponent },
];
