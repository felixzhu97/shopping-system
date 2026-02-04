import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage),
      },
      {
        path: 'products-3d',
        loadComponent: () => import('./pages/products-3d/products-3d.page').then(m => m.Products3dPage),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders.page').then(m => m.OrdersPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.page').then(m => m.UsersPage),
      },
      {
        path: 'crawler',
        loadComponent: () => import('./pages/crawler/crawler.page').then(m => m.CrawlerPage),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics.page').then(m => m.AnalyticsPage),
      },
      {
        path: 'meeting',
        loadComponent: () => import('./pages/meeting/meeting.page').then(m => m.MeetingPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
