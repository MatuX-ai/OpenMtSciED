import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserPreferenceProfile, RecommendationReason } from '../../../models/material-recommendation.models';

@Component({
  selector: 'app-material-preference-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatChipsModule,
    ReactiveFormsModule
  ],
  templateUrl: './material-preference-dialog.component.html',
  styleUrls: ['./material-preference-dialog.component.scss']
})
export class MaterialPreferenceDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<MaterialPreferenceDialogComponent>);
  readonly data = inject<UserPreferenceProfile | null>(MAT_DIALOG_DATA, { optional: true });
  
  private fb = inject(FormBuilder);
  
  readonly form: FormGroup = this.fb.group({
    preferredSubjects: [[], Validators.required],
    preferredGrades: [[], Validators.required],
    difficultyPreference: ['medium', Validators.required],
    contentTypePreference: [[], Validators.required],
    tagsOfInterest: [[]],
    excludedTags: [[]],
    enablePersonalizedRecommendations: [true],
    minRatingThreshold: [3],
    learningGoals: [[]],
    preferredDurations: [[], Validators.required]
  });
  
  readonly subjects = [
    '语文', '数学', '英语', '物理', '化学', '生物', '地理', '历史', '政治',
    '信息技术', '艺术', '音乐', '体育'
  ];
  
  readonly grades = [
    '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
    '初中一年级', '初中二年级', '初中三年级',
    '高中一年级', '高中二年级', '高中三年级'
  ];
  
  readonly contentTypes = ['课件', '教案', '练习', '视频', '互动', 'AR/VR'];
  
  readonly allTags = [
    '动画', '游戏化', '互动', '实验', '演示', '案例', '练习', '测试',
    '小组活动', '探究', '拓展', '复习', '预习', '重点', '难点'
  ];
  
  readonly learningGoals = [
    '知识巩固', '能力提升', '兴趣培养', '应试准备', '拓展视野', '实践应用'
  ];
  
  readonly durations = [
    { label: '5分钟以内', value: 'short' },
    { label: '5-15分钟', value: 'medium' },
    { label: '15-30分钟', value: 'long' },
    { label: '30分钟以上', value: 'extended' }
  ];
  
  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        preferredSubjects: this.data.preferredSubjects,
        preferredGrades: this.data.preferredGrades,
        difficultyPreference: this.data.difficultyPreference,
        contentTypePreference: this.data.contentTypePreference,
        tagsOfInterest: this.data.tagsOfInterest,
        excludedTags: this.data.excludedTags,
        enablePersonalizedRecommendations: this.data.enablePersonalizedRecommendations,
        minRatingThreshold: this.data.minRatingThreshold,
        learningGoals: this.data.learningGoals,
        preferredDurations: this.data.preferredDurations
      });
    }
  }
  
  onSave(): void {
    if (this.form.valid) {
      const profile: UserPreferenceProfile = {
        preferredSubjects: this.form.value.preferredSubjects,
        preferredGrades: this.form.value.preferredGrades,
        difficultyPreference: this.form.value.difficultyPreference,
        contentTypePreference: this.form.value.contentTypePreference,
        tagsOfInterest: this.form.value.tagsOfInterest,
        excludedTags: this.form.value.excludedTags,
        enablePersonalizedRecommendations: this.form.value.enablePersonalizedRecommendations,
        minRatingThreshold: this.form.value.minRatingThreshold,
        learningGoals: this.form.value.learningGoals,
        preferredDurations: this.form.value.preferredDurations,
        lastUpdated: new Date()
      };
      
      this.dialogRef.close(profile);
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}
