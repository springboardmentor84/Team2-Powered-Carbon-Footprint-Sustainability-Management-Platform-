import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, Header, Sidebar, Footer],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {}
