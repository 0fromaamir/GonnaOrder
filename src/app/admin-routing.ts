import { AuthGuard } from 'src/app/auth/auth.guard';
import { mapToCanActivate } from 'src/app/functional-guards';
import { StoreIntegrationsHubriseComponent } from 'src/app/stores/store-integrations/store-integrations-hubrise/store-integrations-hubrise.component';

export const adminRoutes = [
    {
        path: 'manager',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: mapToCanActivate([AuthGuard])
    },
    {
        path: 'hubrise-user-login',
        component: StoreIntegrationsHubriseComponent
    },
]