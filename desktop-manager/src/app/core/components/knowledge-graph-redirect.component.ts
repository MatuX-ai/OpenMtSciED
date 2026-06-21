import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-knowledge-graph-redirect',
  standalone: true,
  template: '',
})
export class KnowledgeGraphRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const tab = (this.route.snapshot.data['tab'] as string) || 'paths';
    const queryParams = { ...this.route.snapshot.queryParams, tab };
    void this.router.navigate(['/knowledge-graph'], { queryParams, replaceUrl: true });
  }
}
