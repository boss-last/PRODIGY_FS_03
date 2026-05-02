import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, HeaderComponent, FooterComponent, FormsModule],
  template: `
    <app-header></app-header>

    <main class="container section">
      <div class="shop-layout">
        <!-- SIDEBAR -->
        <aside class="filter-panel">
          <div class="filter-title">Filtres</div>
          
          <div class="filter-section">
            <div class="filter-section-label">Catégories</div>
            <button class="filter-option" [class.active]="!selectedCategory" (click)="filterByCategory('')">
              Toutes les catégories
            </button>
            <button *ngFor="let cat of categories" class="filter-option" [class.active]="selectedCategory === cat._id" (click)="filterByCategory(cat._id)">
              {{ cat._id }} ({{ cat.count }})
            </button>
          </div>

          <div class="filter-section">
            <div class="filter-section-label">Prix</div>
            <div class="price-inputs">
              <input type="number" placeholder="Min" class="price-input" [(ngModel)]="minPrice" (change)="loadProducts()">
              <input type="number" placeholder="Max" class="price-input" [(ngModel)]="maxPrice" (change)="loadProducts()">
            </div>
          </div>
        </aside>

        <!-- MAIN -->
        <div class="shop-main">
          <div class="sort-bar">
             <div class="sort-label">{{ totalProducts }} produits trouvés</div>
             <select class="sort-select" (change)="onSort($event)">
               <option value="-createdAt">Plus récents</option>
               <option value="price_asc">Prix croissant</option>
               <option value="price_desc">Prix décroissant</option>
               <option value="rating">Mieux notés</option>
             </select>
          </div>

          <div class="products-grid">
            <app-product-card *ngFor="let p of products" [product]="p"></app-product-card>
          </div>

          <div *ngIf="products.length === 0" style="text-align: center; padding: 4rem 0;">
             <h3>Aucun produit trouvé 😔</h3>
             <button class="btn btn-clay" (click)="resetFilters()">Réinitialiser les filtres</button>
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: []
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  categories: any[] = [];
  selectedCategory: string = '';
  minPrice?: number;
  maxPrice?: number;
  sortBy: string = '-createdAt';
  totalProducts: number = 0;

  constructor(private productService: ProductService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) this.selectedCategory = params['category'];
      this.loadProducts();
    });
    this.loadCategories();
  }

  loadProducts() {
    const params: any = {
      category: this.selectedCategory,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      sort: this.sortBy
    };
    this.productService.getProducts(params).subscribe(res => {
      if (res.success) {
        this.products = res.data;
        this.totalProducts = res.pagination.total;
      }
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe(res => {
      if (res.success) {
        this.categories = res.data;
      }
    });
  }

  filterByCategory(cat: string) {
    this.selectedCategory = cat;
    this.loadProducts();
  }

  onSort(event: any) {
    this.sortBy = event.target.value;
    this.loadProducts();
  }

  resetFilters() {
    this.selectedCategory = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.sortBy = '-createdAt';
    this.loadProducts();
  }
}
