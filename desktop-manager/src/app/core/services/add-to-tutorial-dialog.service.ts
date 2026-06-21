import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import {
  AddToTutorialDialogComponent,
  AddToTutorialDialogData,
} from '../../shared/components/add-to-tutorial-dialog/add-to-tutorial-dialog.component';
import { LinkableResource } from './tutorial-resource.service';

@Injectable({ providedIn: 'root' })
export class AddToTutorialDialogService {
  constructor(private dialog: MatDialog) {}

  open(
    resource: LinkableResource,
    options?: { preferredCourseId?: number }
  ): Observable<boolean | undefined> {
    return this.dialog
      .open(AddToTutorialDialogComponent, {
        width: '460px',
        data: {
          resource,
          preferredCourseId: options?.preferredCourseId,
        } satisfies AddToTutorialDialogData,
      })
      .afterClosed();
  }
}
