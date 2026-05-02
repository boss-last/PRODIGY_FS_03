import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CartDrawerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-cart-drawer></app-cart-drawer>
  `,
  styleUrls: []
})
export class AppComponent {
  title = 'Mama Africa';
}
