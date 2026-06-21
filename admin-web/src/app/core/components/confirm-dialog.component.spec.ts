import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent (UX-08)', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const baseData: ConfirmDialogData = {
    title: '删除确认',
    message: '此操作不可恢复，是否继续？',
  };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: baseData },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render default cancel/confirm text when not customized', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent?.trim()).toBe('取消');
    expect(buttons[1].textContent?.trim()).toBe('确认');
    expect(compiled.textContent).toContain(baseData.title);
    expect(compiled.textContent).toContain(baseData.message);
  });

  it('should render custom confirmText/cancelText/color and the icon', () => {
    TestBed.resetTestingModule();
    const customData: ConfirmDialogData = {
      title: '导出 CSV',
      message: '确认导出当前列表？',
      confirmText: '立即导出',
      cancelText: '稍后',
      color: 'primary',
      icon: 'download',
    };
    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: customData },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    const f = TestBed.createComponent(ConfirmDialogComponent);
    f.detectChanges();

    const compiled: HTMLElement = f.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons[0].textContent?.trim()).toBe('稍后');
    expect(buttons[1].textContent?.trim()).toBe('立即导出');

    const icon = compiled.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon?.textContent?.trim()).toBe('download');
  });

  it('should close dialog with `false` when cancel button is clicked', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const cancelBtn: HTMLButtonElement | undefined = compiled.querySelector(
      'button[mat-button]'
    ) as HTMLButtonElement | undefined;
    expect(cancelBtn).toBeTruthy();
    cancelBtn?.click();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with `true` when confirm button is clicked', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const confirmBtn: HTMLButtonElement | undefined = compiled.querySelector(
      'button[mat-flat-button]'
    ) as HTMLButtonElement | undefined;
    expect(confirmBtn).toBeTruthy();
    confirmBtn?.click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should expose injected dialog data on the component instance', () => {
    expect(component.data).toEqual(baseData);
    expect(component.data.title).toBe('删除确认');
    expect(component.data.color).toBeUndefined();
  });
});