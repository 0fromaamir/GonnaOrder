import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-panel',
  templateUrl: './loading-panel.component.html',
  styleUrls: ['./loading-panel.component.scss'],
})
export class LoadingPanelComponent {
  @Input() showLoading = false;
  @Input() overlay = false;
  @Input() hideText = false;
}
