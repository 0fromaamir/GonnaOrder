import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RuleOptionGroupComponent } from './rule-option-group/rule-option-group.component';
import { RuleOptionGroupGuard } from './rule-option-group/rule-option-group.guard';
import { RuleOptionComponent } from './rule-option/rule-option.component';
import { RuleOptionGuard } from './rule-option/rule-option.guard';
import { StoreOrderingRuleGuard } from './store-ordering-rule.guard';
import { StoreOrderingRulesViewComponent } from './store-ordering-rules-view/store-ordering-rules-view.component';
import { StoreOrderingRulesComponent } from './store-ordering-rules.component';
import { StoreOrderingRulesGuard } from './store-ordering-rules.guard';
import { mapToCanActivate } from 'src/app/functional-guards';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreOrderingRulesViewComponent, canActivate: mapToCanActivate([StoreOrderingRulesGuard]) },
  { path: ':ruleid', component: StoreOrderingRulesComponent, canActivate: mapToCanActivate([StoreOrderingRuleGuard]) },
  { path: ':ruleid/option-group/:rogid', component: RuleOptionGroupComponent, canActivate: mapToCanActivate([RuleOptionGroupGuard]) },
  { path: ':ruleid/option-group/:rogid/option/:optid', component: RuleOptionComponent, canActivate: mapToCanActivate([RuleOptionGuard]) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreOrderingRulesRoutingModule { }
