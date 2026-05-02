import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="post-card" style="background: white; border-radius: 12px; border: 1px solid #e1e8ed; margin-bottom: 20px; overflow: hidden;">
      <!-- Header -->
      <div style="padding: 12px; display: flex; align-items: center; gap: 10px;">
        <img [src]="post.user.profilePicture" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
        <div>
          <div style="font-weight: 700; font-size: 14px;">{{ post.user.name }}</div>
          <div style="color: #657786; font-size: 13px;">&#64;{{ post.user.username }}</div>
        </div>
      </div>

      <!-- Content -->
      <div style="padding: 0 12px 12px; font-size: 15px; line-height: 1.4;">
        {{ post.content }}
      </div>

      <!-- Media -->
      <div *ngIf="post.mediaUrl" style="max-height: 500px; overflow: hidden; background: #f5f8fa;">
        <img [src]="post.mediaUrl" style="width: 100%; object-fit: contain;">
      </div>

      <!-- Stats & Actions -->
      <div style="padding: 12px; border-top: 1px solid #f5f8fa; display: flex; gap: 20px; color: #657786;">
        <button (click)="like()" style="border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 4px; color: inherit;">
          {{ isLiked ? '❤️' : '🤍' }} {{ post.likesCount }}
        </button>
        <button (click)="showComments = !showComments" style="border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 4px; color: inherit;">
          💬 {{ post.comments?.length || 0 }}
        </button>
      </div>

      <!-- Comments Section -->
      <div *ngIf="showComments" style="padding: 12px; background: #f8f9fa; border-top: 1px solid #f5f8fa;">
        <div *ngFor="let comment of post.comments" style="margin-bottom: 10px; font-size: 13px;">
          <span style="font-weight: 700;">&#64;{{ comment.user.username }}</span> {{ comment.content }}
        </div>
        
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <input type="text" [(ngModel)]="newComment" placeholder="Votre commentaire..." 
                 style="flex: 1; padding: 6px 12px; border: 1px solid #e1e8ed; border-radius: 20px; font-size: 13px; outline: none;">
          <button (click)="addComment()" [disabled]="!newComment" class="btn btn-clay btn-sm">Envoyer</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PostCardComponent {
  @Input() post!: Post;
  showComments = false;
  newComment = '';
  isLiked = false;

  constructor(private postService: PostService) {}

  like() {
    this.postService.likePost(this.post.id).subscribe(res => {
      if (res.success) {
        if (res.message === 'Liked') {
          this.post.likesCount++;
          this.isLiked = true;
        } else {
          this.post.likesCount--;
          this.isLiked = false;
        }
      }
    });
  }

  addComment() {
    this.postService.addComment(this.post.id, this.newComment).subscribe(res => {
      if (res.success) {
        if (!this.post.comments) this.post.comments = [];
        this.post.comments.push(res.data);
        this.newComment = '';
      }
    });
  }
}
