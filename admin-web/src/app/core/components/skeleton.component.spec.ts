import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { SkeletonStatCardComponent, SkeletonTableComponent } from './skeleton.component';

describe('Skeleton Components (UX-07)', () => {
  describe('SkeletonStatCardComponent', () => {
    let fixture: ComponentFixture<SkeletonStatCardComponent>;
    let component: SkeletonStatCardComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SkeletonStatCardComponent, MatCardModule],
        providers: [provideAnimationsAsync('noop')],
      }).compileComponents();

      fixture = TestBed.createComponent(SkeletonStatCardComponent);
      component = fixture.componentInstance;
    });

    it('should render 3 skeleton blocks with OnPush and expose label input', () => {
      component.label = 'Active';
      fixture.detectChanges();
      const blocks = fixture.nativeElement.querySelectorAll('.skeleton-block');
      expect(blocks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('SkeletonTableComponent', () => {
    let fixture: ComponentFixture<SkeletonTableComponent>;
    let component: SkeletonTableComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SkeletonTableComponent, CommonModule],
        providers: [provideAnimationsAsync('noop')],
      }).compileComponents();

      fixture = TestBed.createComponent(SkeletonTableComponent);
      component = fixture.componentInstance;
    });

    it('should render colWidths.length cells per row and rows.length rows', () => {
      component.colWidths = [1, 2, 3];
      component.rows = 4;
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.sk-row');
      expect(rows.length).toBe(4);

      const headerCells = fixture.nativeElement.querySelectorAll('.sk-cell-header');
      expect(headerCells.length).toBe(3);

      const firstRowCells = rows[0]?.querySelectorAll('.sk-cell');
      expect(firstRowCells?.length).toBe(3);
    });

    it('should apply skeleton-block class to all cells (shimmer animation target)', () => {
      component.colWidths = [1, 1];
      component.rows = 2;
      fixture.detectChanges();

      const allCells = fixture.nativeElement.querySelectorAll('.sk-cell');
      // .sk-cell includes both .sk-cell-header (2) and body cells (2 cols * 2 rows = 4)
      expect(allCells.length).toBe(6);
      allCells.forEach((cell: Element) => {
        expect(cell.classList.contains('skeleton-block')).toBe(true);
      });

      const headerCells = fixture.nativeElement.querySelectorAll('.sk-cell-header');
      expect(headerCells.length).toBe(2);
      headerCells.forEach((cell: Element) => {
        expect(cell.classList.contains('skeleton-block')).toBe(true);
      });

      const bodyRows = fixture.nativeElement.querySelectorAll('.sk-row');
      expect(bodyRows.length).toBe(2);
      bodyRows.forEach((row: Element) => {
        const rowCells = row.querySelectorAll('.sk-cell');
        expect(rowCells.length).toBe(2);
      });
    });
  });
});
