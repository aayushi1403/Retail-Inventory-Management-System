import { Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="search-bar">
        <input type="text" placeholder="Search anything..." class="form-control">
      </div>
      <div class="user-profile">
        <div class="avatar">A</div>
        <span class="user-name">Admin User</span>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background-color: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .search-bar input {
      width: 300px;
      border-radius: 20px;
      padding-left: 1rem;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
    }
  `]
})
export class TopbarComponent { }
