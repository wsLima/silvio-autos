import { Routes } from '@angular/router';
import { CarListing } from './pages/car-listing/car-listing';
import { CarDetails } from './pages/car-details/car-details';
import { Login } from './pages/login/login';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard';
import { AdminListingsComponent } from './pages/admin/listings/listings';
import { ListingFormComponent } from './pages/admin/listing-form/listing-form';

export const routes: Routes = [
  {
    path: '',
    component: CarListing,
  },
  {
    path: 'details/:id',
    component: CarDetails,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'listings',
        component: AdminListingsComponent,
      },
      {
        path: 'listings/new',
        component: ListingFormComponent,
      },
      {
        path: 'listings/:id/edit',
        component: ListingFormComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
