import re

file_path = 'frontend/ecotrack-frontend/src/app/features/dashboard/pages/dashboard-home/dashboard-home.ts'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Imports from @angular/core
angular_core_pattern = r'<<<<<<< HEAD.*?ChangeDetectorRef,.*?Component,.*?=======.*?AfterViewInit,.*?Component,.*?ElementRef,.*?OnDestroy,.*?OnInit,.*?ViewChild,.*?inject.*?>>>>>>> origin/feature/project-setup'
angular_core_replacement = '''  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject'''
content = re.sub(angular_core_pattern, angular_core_replacement, content, flags=re.DOTALL)

# 2. rxjs and other imports
rxjs_pattern = r'<<<<<<< HEAD.*?import {\n CommonModule.*?import {\n  Subscription,\n  merge\n} from \'rxjs\';.*?=======.*?import { CommonModule } from \'@angular/common\';.*?import { Subscription, forkJoin } from \'rxjs\';.*?import { MatCardModule } from \'@angular/material/card\';.*?>>>>>>> origin/feature/project-setup'
rxjs_replacement = '''import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';

import { MatCardModule } from '@angular/material/card';'''
content = re.sub(rxjs_pattern, rxjs_replacement, content, flags=re.DOTALL)

# 3. Rest of imports
# There is a block from MatIconModule to ProfileWidget
imports_rest_pattern = r'<<<<<<< HEAD.*?import {\n\n  MatIconModule.*?=======.*?(import {.*?GoalService.*?)>>>>>>> origin/feature/project-setup'
content = re.sub(imports_rest_pattern, r'\1', content, flags=re.DOTALL)

# 4. loadActivities in ngOnInit
load_activities_pattern = r'<<<<<<< HEAD.*?this\.activityService\.loadActivities\(\);.*?Initial dashboard calculation.*?=======.*?(// -+.*?LISTEN FOR ACTIVITY CHANGES.*?)>>>>>>> origin/feature/project-setup'
content = re.sub(load_activities_pattern, r'\1', content, flags=re.DOTALL)

# 5. Dashboard Summary logic inside loadGoals
dashboard_summary_in_load_goals_pattern = r'<<<<<<< HEAD.*?// 1\. Fetch Dashboard Summary.*?this\.dashboardService\.getSummary\(\)\.subscribe.*?this\.cdr\.detectChanges\(\);.*?=======.*?this\.goalSubscription\?\.unsubscribe\(\);.*?this\.goalSubscription =\n      this\.goalService\n        \.getMyGoals\(\)\n        \.subscribe\({\n\n          next: goals => {.*?>>>>>>> origin/feature/project-setup'
dashboard_summary_in_load_goals_replacement = '''    this.goalSubscription?.unsubscribe();

    this.goalSubscription =
      this.goalService
        .getMyGoals()
        .subscribe({

          next: goals => {'''
content = re.sub(dashboard_summary_in_load_goals_pattern, dashboard_summary_in_load_goals_replacement, content, flags=re.DOTALL)

# 6. Rewrite loadDashboardSummary to use the user's logic
load_dashboard_summary_pattern = r'(private loadDashboardSummary\(\): void {.*?this\.dashboardSubscription =.*?this\.dashboardService.*?\.getSummary\(\).*?\.subscribe\({.*?next: summary => {).*?console\.log\(.*?(},.*?error: error => {).*?console\.warn\(.*?(this\.dashboardError = true;.*?this\.errorMessage =.*?\'Dashboard summary unavailable\.\';.*?}.*?}\);.*?\})'

user_logic_next = '''
            this.stats[0].value = `${summary.totalCarbonEmission.toFixed(1)} kg`;
            this.stats[1].value = summary.totalEntries.toString();
            this.stats = [...this.stats];
            this.cdr.detectChanges();
          '''

user_logic_error = '''
            console.error('Failed to load dashboard summary', error);
            this.dashboardError = true;
            this.errorMessage = 'Dashboard summary unavailable.';
            this.cdr.detectChanges();
          '''

def replace_load_dashboard(m):
    return m.group(1) + user_logic_next + m.group(2) + user_logic_error + "          }\n\n        });\n\n  }"

content = re.sub(load_dashboard_summary_pattern, replace_load_dashboard, content, flags=re.DOTALL)

# 7. Prevent updateDashboardCards from overwriting stats[0] and stats[1]
update_cards_pattern = r'(private updateDashboardCards\(\): void {.*?this\.stats\[0\]\.value =\n      `\$\{carbon\.toFixed\(1\)\} kg`;.*?this\.stats\[1\]\.value =\n      String\(activityCount\);)'
content = re.sub(update_cards_pattern, r'/* \1 - Handled by loadDashboardSummary */', content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
