import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConverterComponent } from './components/converter/converter.component';


export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/converter',
        pathMatch: 'full',
    },
   
    { path: 'converter', component: ConverterComponent},
   

];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
