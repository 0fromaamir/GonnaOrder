import { Observable, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../+state/stores.reducer';
import { getSelectedStore, getSelectedStoreRelation, getSelectedStoreState } from '../+state/stores.selectors';
import { UpdateStoreRelation } from '../+state/stores.actions';
import { takeUntil } from 'rxjs/operators';
import { LoggedInUser } from 'src/app/auth/auth';
import { ClientStore, Relation, StoreRelationRequest } from '../stores';
// import * as createTree from 'src/assets/tree-structure/treeview.js';
declare var createTree: any;
// declare var createTree; src\assets\tree-structure\treeview.js

@Component({
  selector: 'app-stores-relation-tree',
  templateUrl: './store-relation-tree.component.html'
})
export class StoreRelationTreeComponent implements OnInit, OnDestroy {

  storeRelation$: Observable<any>;
  stores: any;
  locale: string;
  timezone: string;
  private destroy$ = new Subject();

  tagVisible$: Observable<boolean>;
  aliasName: string;
  loggedInUser: LoggedInUser;
  selectedStoreRelation: Relation;
  stores$: Observable<any>;
  selectedStore: ClientStore;
  independentFlag = false;

  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    // storeRelation$: Observable<any>;
    // selectedStoreRelation: Relation;

    this.storeRelation$ = this.store.pipe(
      select(getSelectedStoreRelation),
      takeUntil(this.destroy$)
    );
    this.storeRelation$.subscribe((relation) => {
      this.selectedStoreRelation = relation;
      console.log('tree - Selectedstore Relation', this.selectedStoreRelation);
    });
    this.stores$ = this.store.pipe(
      select(getSelectedStoreState),
      takeUntil(this.destroy$));
    this.stores$.subscribe((selectedStoreState) => {
      this.selectedStore = selectedStoreState.store;
      // console.log('tree - selected store ', this.selectedStore);
      if ( selectedStoreState.status && selectedStoreState.status !== 'LOADING' ){
        this.loadtree();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

loadtree = function() {
    // Creating the tree
    const tree = createTree('divtree', 'white', null);


    // Setting custom events
    tree.nodeBeforeOpenEvent = (node) => {
    //   console.log(node.text + ': Before expand event<br/>');
    };

    tree.nodeAfterOpenEvent = (node) => {
    //   console.log(node.text + ': After expand event<br/>');
    };

    tree.nodeBeforeCloseEvent = (node) => {// console.log(node.text + ': Before collapse event<br/>');
    };

// Loop to create nodes
// parent node and chidnodes
    if (this.selectedStore.relation && this.selectedStore.relation.parentStore){
    const PaentName = (this.selectedStore.relation.parentStore.storeName ? this.selectedStore.relation.parentStore.storeName : '')
    + (this.selectedStore.relation.parentStore.storeAlias ? ' ( ' + this.selectedStore.relation.parentStore.storeAlias + ' )' : '') ;
    const node1 = tree.createNode(PaentName ? PaentName : '', false, null, null, null, null);
    const childCurrentSelectedStoreName = this.selectedStore.name + (this.selectedStore.aliasName ? ' ( ' + this.selectedStore.aliasName + ' ) ' : '');
    const storeLogo = null;
    const node2 = node1.createChildNode(childCurrentSelectedStoreName, false, storeLogo , null, null);
    if (this.selectedStore.relation && this.selectedStore.relation.childStores && this.selectedStore.relation.childStores.length > 0) {
      for (const childStore of this.selectedStore.relation.childStores) {
        const name = childStore.storeName +
' ( ' + childStore.storeAlias + ' )';
        node2.createChildNode(name, false, null, null, null);
      }
    }
    if (this.selectedStore.relation && this.selectedStore.relation.siblingStores && this.selectedStore.relation.siblingStores.length > 0) {
      for (const siblingStore of this.selectedStore.relation.siblingStores) {
        const name = siblingStore.storeName +
        ' ( ' + siblingStore.storeAlias + ' )';
        node1.createChildNode(name, false, null, null, null); }
    }
}
else{
// if no parent store
const CurrentSelectedStoreParent = this.selectedStore.name + (this.selectedStore.aliasName ? ' ( ' + this.selectedStore.aliasName + ' ) ' : '');
const storeLogo = null;
const node1 = tree.createNode(CurrentSelectedStoreParent, false, storeLogo, null, null, null);
if (this.selectedStore.relation.childStores) {
for (const childStore of this.selectedStore.relation.childStores) {
const name = childStore.storeName +
' ( ' + childStore.storeAlias + ' ) ';
// tslint:disable-next-line: prefer-const
node1.createChildNode(name, false, null, null, null);
}}}


    // for (var i=0; i<this.selectedStoreRelation.childStores.length; i++) {
//  let name = this.selectedStoreRelation.childStores[i].storeName + '('+this.selectedStoreRelation.childStores[i].storeAlias+')';
    //  var node1 = tree.createNode(name,false,'/assets/tree-structure/images/star.png',null,null,null);
    //   for (var j=1; j<5; j++) {
    //    var node2 = node1.createChildNode('Level 1 - Node ' + j, false, '/assets/tree-structure/images/blue_key.png',null,'context1');
    //     for (var k=1; k<5; k++) {
    //      var node3 = node2.createChildNode('Level 2 - Node ' + k, false, '/assets/tree-structure/images/monitor.png',null,'context1');
    //       /*for (var l=1; l<5; l++) {
    //         node4 = node3.createChildNode('Level 3 - Node ' + l, false, 'images/key_green.png',null,'context1');
    //         for (var m=1; m<5; m++) {
    //           node4.createChildNode('Level 4 - Node ' + m, false, 'images/file.png',null,'context1');
    //         }
    //       }*/
    //     }
    //   }
    // }

    // Rendering the tree
    tree.drawTree();

    // Adding node after tree is already rendered
    // tree.createNode('<a href='link/'>Link to page</a',false,'images/leaf.png',null,null,'context1');

    // default expand all after rendering tree
    tree.expandTree();

  };
}
