import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, HeaderComponent, FooterComponent, RouterLink],
  template: `
    <app-header></app-header>

    <!-- HERO SECTION -->
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-eyebrow">
          <span>🌿</span> Produits 100% Naturels & Locaux
        </div>
        <h1>L'essence de la <em>Côte d'Ivoire</em> à votre porte</h1>
        <p>Découvrez une sélection unique de produits artisanaux, alimentaires et cosmétiques directement issus de nos régions.</p>
        
        <div style="display: flex; gap: 1rem;">
          <a routerLink="/shop" class="btn btn-clay btn-lg">Découvrir la boutique</a>
          <a href="#featured" class="btn btn-lg" style="background: rgba(255,255,255,0.1); color: white; border: 1.5px solid rgba(255,255,255,0.2);">Voir les nouveautés</a>
        </div>

        <div class="hero-stats">
          <div>
            <div class="hero-stat-val">500+</div>
            <div class="hero-stat-lab">Produits Locaux</div>
          </div>
          <div>
            <div class="hero-stat-val">100%</div>
            <div class="hero-stat-lab">Artisanal</div>
          </div>
          <div>
            <div class="hero-stat-val">24h</div>
            <div class="hero-stat-lab">Livraison Abidjan</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section id="featured" class="container section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Nos <span>Incontournables</span></h2>
          <p class="section-sub">Les produits les plus appréciés par notre communauté.</p>
        </div>
        <a routerLink="/shop" style="color: var(--clay); font-weight: 600;">Tout voir →</a>
      </div>

      <div class="products-grid">
        <app-product-card *ngFor="let p of featuredProducts" [product]="p"></app-product-card>
      </div>
    </section>

    <!-- CATEGORIES PREVIEW -->
    <section class="section-sm" style="background: var(--clay-light);">
      <div class="container">
        <div class="cat-grid">
          <div class="cat-pill" routerLink="/shop" [queryParams]="{category: 'Alimentation'}">
            <div class="cat-emoji">🥘</div>
            <div class="cat-name">Alimentation</div>
          </div>
          <div class="cat-pill" routerLink="/shop" [queryParams]="{category: 'Cosmétique'}">
            <div class="cat-emoji">✨</div>
            <div class="cat-name">Beauté</div>
          </div>
          <div class="cat-pill" routerLink="/shop" [queryParams]="{category: 'Artisanat'}">
            <div class="cat-emoji">🎨</div>
            <div class="cat-name">Artisanat</div>
          </div>
          <div class="cat-pill" routerLink="/shop" [queryParams]="{category: 'Boisson'}">
            <div class="cat-emoji">☕</div>
            <div class="cat-name">Boissons</div>
          </div>
        </div>
      </div>
    </section>

    <app-footer></app-footer>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts({ featured: 'true', limit: 4 }).subscribe(res => {
      if (res.success) {
        this.featuredProducts = res.data;
      }
    });
  }
}
