import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();
  
  private drawerOpenSubject = new BehaviorSubject<boolean>(false);
  drawerOpen$ = this.drawerOpenSubject.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  addToCart(product: Product, quantity: number = 1) {
    const existingItem = this.cartItems.find(item => item._id === product._id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ ...product, quantity });
    }
    this.saveCart();
    this.openDrawer();
  }
  
  openDrawer() {
    this.drawerOpenSubject.next(true);
  }
  
  closeDrawer() {
    this.drawerOpenSubject.next(false);
  }
  
  toggleDrawer() {
    this.drawerOpenSubject.next(!this.drawerOpenSubject.value);
  }

  removeFromCart(productId: string) {
    this.cartItems = this.cartItems.filter(item => item._id !== productId);
    this.saveCart();
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }
  
  isDrawerOpen(): boolean {
    return this.drawerOpenSubject.value;
  }
}
