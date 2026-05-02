import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>

    <main class="container section" style="max-width: 500px;">
      <div class="auth-card" style="background: white; padding: 2.5rem; border-radius: var(--r-lg); box-shadow: var(--shadow);">
        <h1 class="section-title" style="text-align: center; margin-bottom: 2rem;">
          {{ isLogin ? 'Connexion' : 'Inscription' }}
        </h1>

        <form (ngSubmit)="onSubmit()">
          <div *ngIf="!isLogin" style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Nom complet</label>
            <input type="text" [(ngModel)]="name" name="name" class="price-input" style="width: 100%;" required>
          </div>

          <div *ngIf="!isLogin" style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Nom d'utilisateur</label>
            <input type="text" [(ngModel)]="username" name="username" class="price-input" style="width: 100%;" placeholder="ex: jean_k" required>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Email</label>
            <input type="email" [(ngModel)]="email" name="email" class="price-input" style="width: 100%;" required>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.5rem;">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" class="price-input" style="width: 100%;" required>
          </div>

          <button type="submit" class="btn-add-main" style="width: 100%; margin-top: 1rem;">
            {{ isLogin ? 'Se connecter' : "S'inscrire" }}
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem;">
          {{ isLogin ? "Pas encore de compte ?" : "Déjà un compte ?" }}
          <a (click)="isLogin = !isLogin" style="color: var(--clay); font-weight: 600; cursor: pointer;">
            {{ isLogin ? "S'inscrire" : "Se connecter" }}
          </a>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `,
  styles: []
})
export class AuthComponent {
  isLogin = true;
  name = '';
  username = '';
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    console.log('Tentative de connexion...', { email: this.email, password: this.password });
    if (this.isLogin) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          if (res.success) {
            console.log('Connexion réussie');
            this.router.navigate(['/']);
          } else {
            alert('Erreur : ' + res.message);
          }
        },
        error: (err) => {
          console.error('Erreur login:', err);
          alert('Erreur lors de la connexion. Vérifiez vos identifiants ou le serveur.');
        }
      });
    } else {
      this.authService.register({ name: this.name, username: this.username, email: this.email, password: this.password }).subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/']);
          } else {
            alert('Erreur : ' + res.message);
          }
        },
        error: (err) => {
          console.error('Erreur inscription:', err);
          alert('Erreur lors de l\'inscription.');
        }
      });
    }
  }
}
