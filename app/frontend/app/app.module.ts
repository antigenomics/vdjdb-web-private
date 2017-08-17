import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { NavigationBarComponent } from "./navbar/navbar.component";
import { AppComponent } from './app.component';
import { SearchPageModule } from "./pages/search/search-page.module";
import { HomePageComponent } from "./pages/home/home.component";
import { AboutPageComponent } from "./pages/about/about.component";

import { Route, RouterModule } from '@angular/router';
import { SearchPageComponent } from "./pages/search/search-page.component";

const routes: Route[] = [
    { 'path': '', component: HomePageComponent },
    { 'path': 'about', component: AboutPageComponent },
    { 'path': 'search', component: SearchPageComponent }
];

@NgModule({
    imports:      [ CommonModule, BrowserModule, SearchPageModule, RouterModule.forRoot(routes) ],
    declarations: [ AppComponent, NavigationBarComponent, HomePageComponent, AboutPageComponent ],
    bootstrap:    [ AppComponent ]
})
export class AppModule {}
