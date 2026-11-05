/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        @for (item of items(); track item.label; let last = $last) {
          <li class="breadcrumb-item">
            @if (!last && item.route) {
              <a [routerLink]="item.route" class="breadcrumb-link">
                {{ item.label }}
              </a>
            } @else {
              <span class="breadcrumb-text">{{ item.label }}</span>
            }
          </li>
          @if (!last) {
            <li class="breadcrumb-separator">
              <span>/</span>
            </li>
          }
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
