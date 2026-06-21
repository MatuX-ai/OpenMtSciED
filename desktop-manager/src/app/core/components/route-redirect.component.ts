import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** 通用路由重定向（用于 deprecated 路由） */
@Component({
  selector: 'app-route-redirect',
  standalone: true,
  template: '',
})
export class RouteRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const target = (this.route.snapshot.data['redirectTo'] as string) || '/dashboard';
    void this.router.navigateByUrl(target, { replaceUrl: true });
  }
}
