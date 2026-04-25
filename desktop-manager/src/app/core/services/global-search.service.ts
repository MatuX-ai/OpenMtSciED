import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GlobalSearchComponent } from '../../shared/components/global-search/global-search.component';

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private searchOpenSubject = new BehaviorSubject<boolean>(false);
  searchOpen$ = this.searchOpenSubject.asObservable();

  constructor(private dialog: MatDialog) {}

  openSearch(): void {
    if (!this.searchOpenSubject.value) {
      this.dialog.open(GlobalSearchComponent, {
        width: '600px',
        maxHeight: '80vh',
        panelClass: 'global-search-dialog'
      });
      this.searchOpenSubject.next(true);
    }
  }

  closeSearch(): void {
    this.dialog.closeAll();
    this.searchOpenSubject.next(false);
  }
}
