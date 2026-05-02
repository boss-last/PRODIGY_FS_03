import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer style="background: var(--ink); color: white; padding: 4rem 0; margin-top: 4rem;">
      <div class="container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem;">
        <div>
          <div style="font-family: var(--serif); font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">
            MAMA AFRICA
          </div>
          <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.6;">
            Le meilleur des produits locaux ivoiriens. 
            Engagement qualité et soutien aux artisans.
          </p>
        </div>
        
        <div>
          <div style="font-weight: 600; margin-bottom: 1.25rem;">Navigation</div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem; color: rgba(255,255,255,0.7);">
            <li><a routerLink="/shop" style="color: inherit; text-decoration: none;">Boutique</a></li>
            <li><a routerLink="/account" style="color: inherit; text-decoration: none;">Mon Compte</a></li>
            <li><a routerLink="/account" style="color: inherit; text-decoration: none;">Suivi de commande</a></li>
            <li><a routerLink="/" style="color: inherit; text-decoration: none;">Accueil</a></li>
          </ul>
        </div>

        <div>
          <div style="font-weight: 600; margin-bottom: 1.25rem;">Contact</div>
          <p style="font-size: 0.9rem; color: rgba(255,255,255,0.7); line-height: 1.6;">
            📍 Abidjan, Plateau<br>
            📞 +225 07 00 00 00<br>
            ✉️ contact&#64;mamaafrica.ci
          </p>
        </div>
      </div>
      
      <div class="container" style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: rgba(255,255,255,0.4); font-size: 0.8rem;">
        © 2024 Mama Africa. Tous droits réservés.
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}
