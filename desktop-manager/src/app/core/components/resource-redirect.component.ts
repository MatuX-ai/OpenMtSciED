import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-resource-redirect',
  standalone: true,
  template: '',
})
export class ResourceRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const extra = (this.route.snapshot.data['extraParams'] as Record<string, string>) || {};
    const queryParams = { ...this.route.snapshot.queryParams, ...extra };
    void this.router.navigate(['/resource-explorer'], { queryParams, replaceUrl: true });
  }
}
