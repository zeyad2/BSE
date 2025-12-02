import { Routes } from '@angular/router';
import { publicOnlyGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home/home.page').then((m) => m.HomePage),
    title: 'BSE - Integrated Web ERP Solutions'
  },

  {
    path: 'blog',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/blog/pages/blog-list/blog-list.page').then(
            (m) => m.BlogListPage
          ),
        title: 'Insights & Articles | BSE'
      },
      {
        path: ':id', // Route parameter
        loadComponent: () =>
          import('./features/blog/pages/blog-detail/blog-detail.page').then(
            (m) => m.BlogDetailPage
          ),
        title: 'Article | BSE'
      }
    ]
  },

  {
    path: 'service-details/:id',
    loadComponent: () =>
      import('./features/service-details/pages/service-details/service-details.page').then(
        (m) => m.ServiceDetailsPage
      ),
    title: 'Service Details | BSE'
  },

  {
    path: 'auth',
    children: [
      {
        path: 'signin',
        canActivate: [publicOnlyGuard],
        loadComponent: () =>
          import('./features/auth/pages/signin/signin.page').then(
            (m) => m.SignInPage
          ),
        title: 'Sign In | BSE'
      },
      {
        path: 'signup',
        canActivate: [publicOnlyGuard],
        loadComponent: () =>
          import('./features/auth/pages/signup/signup.page').then(
            (m) => m.SignUpPage
          ),
        title: 'Sign Up | BSE'
      }
    ]
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/pages/admin-blog-list/admin-blog-list.page').then(
            (m) => m.AdminBlogListPage
          ),
        title: 'Admin Dashboard | BSE'
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./features/admin/pages/create-blog/create-blog.page').then(
            (m) => m.CreateBlogPage
          ),
        title: 'Create Blog | BSE'
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./features/admin/pages/edit-blog/edit-blog.page').then(
            (m) => m.EditBlogPage
          ),
        title: 'Edit Blog | BSE'
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];
