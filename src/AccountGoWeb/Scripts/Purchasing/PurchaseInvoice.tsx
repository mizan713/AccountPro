﻿import * as React from "react";
import * as ReactDOM from "react-dom";
import {observer} from "mobx-react";

import Config = require("Config");

import SelectVendor from "../Shared/Components/SelectVendor";
import SelectPaymentTerm from "../Shared/Components/SelectPaymentTerm";
import SelectLineItem from "../Shared/Components/SelectLineItem";
import SelectLineMeasurement from "../Shared/Components/SelectLineMeasurement";

import PurchaseInvoiceStore from "../Shared/Stores/Purchasing/PurchaseInvoiceStore";

let purchId = window.location.search.split("?purchId=")[1];
let invoiceId = window.location.search.split("?invoiceId=")[1];

let store = new PurchaseInvoiceStore(purchId, invoiceId);

let baseUrl = location.protocol
    + "//" + location.hostname
    + (location.port && ":" + location.port)
    + "/";

@observer
class ValidationErrors extends React.Component<any, {}>{
    render() {
        if (store.validationErrors !== undefined && store.validationErrors.length > 0) {
            var errors = [];
            store.validationErrors.map(function (item, index) {
                errors.push(<li key={index}>{item}</li>);
            });
            return (
                <div>
                    <ul>
                        {errors}
                    </ul>
                </div>

            );
        }
        return null;
    }
}

class SavePurchaseInvoiceButton extends React.Component<any, {}>{
    saveNewPurchaseInvoice(e) {
        store.savePurchaseInvoice();
    }

    render() {
        return (
            <input type="button" className="btn btn-sm btn-primary btn-flat pull-left" value="Save" onClick={this.saveNewPurchaseInvoice.bind(this)} />
            );
    }
}

class CancelPurchaseInvoiceButton extends React.Component<any, {}>{
    cancelOnClick() {
        let baseUrl = location.protocol
            + "//" + location.hostname
            + (location.port && ":" + location.port)
            + "/";

        window.location.href = baseUrl + 'purchasing/purchaseorders';
    }

    render() {
        return (
            <button type="button" className="btn btn-sm btn-default btn-flat pull-left" onClick={ this.cancelOnClick.bind(this) }>
                Close
            </button>
        );
    }
}

@observer
class PostButton extends React.Component<any, {}>{
    postOnClick(e) {
        store.postInvoice();
    }

    render() {
        return (
            <input type="button" value="Post" onClick={ this.postOnClick.bind(this) } className="btn btn-sm btn-danger btn-flat pull-right disabled" />
        );
    }
}

@observer
class PurchaseInvoiceHeader extends React.Component<any, {}>{
    onChangeInvoiceDate(e) {
        store.changedInvoiceDate(e.target.value);
    }
    onChangeVendor(e) {
        store.changedVendor(e.target.value);
    }
    render() {        
        return (
            <div className="box">
                <div className="box-header with-border">
                    <h3 className="box-title">Vendor Information</h3>
                    <div className="box-tools pull-right">
                        <button type="button" className="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="Collapse">
                            <i className="fa fa-minus"></i>
                        </button>
                    </div>
                </div>
                <div className="box-body">
                    <div className="col-sm-6">
                        <div className="row">
                            <div className="col-sm-2">Vendor</div>
                            <div className="col-sm-10"><SelectVendor store={store} selected={store.purchaseInvoice.vendorId} /></div>
                        </div>
                        <div className="row">
                            <div className="col-sm-2">Payment Term</div>
                            <div className="col-sm-10"><SelectPaymentTerm store={store} selected={store.purchaseInvoice.paymentTermId} /></div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="row">
                            <div className="col-sm-2">Date</div>
                            <div className="col-sm-10"><input type="date" className="form-control pull-right" onChange={this.onChangeInvoiceDate.bind(this) }
                                value={store.purchaseInvoice.invoiceDate !== undefined ? store.purchaseInvoice.invoiceDate.substring(0, 10) : new Date(Date.now()).toISOString().substring(0, 10) } /></div>
                        </div>
                        <div className="row">
                            <div className="col-sm-2">Reference no.</div>
                            <div className="col-sm-10"><input type="text" className="form-control" /></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

@observer
class PurchaseInvoiceLines extends React.Component<any, {}>{
    addLineItem() {
        var itemId, measurementId, quantity, amount, discount;
        itemId = (document.getElementById("optNewItemId") as HTMLInputElement).value;
        measurementId = (document.getElementById("optNewMeasurementId") as HTMLInputElement).value;
        quantity = (document.getElementById("txtNewQuantity") as HTMLInputElement).value;
        amount = (document.getElementById("txtNewAmount") as HTMLInputElement).value;
        discount = (document.getElementById("txtNewDiscount") as HTMLInputElement).value;

        console.log(`itemId: ${itemId} | measurementId: ${measurementId} | quantity: ${quantity} | amount: ${amount} | discount: ${discount}`);
        store.addLineItem(0, itemId, measurementId, quantity, amount, discount);

        (document.getElementById("txtNewQuantity") as HTMLInputElement).value = "1";
        (document.getElementById("txtNewAmount") as HTMLInputElement).value = "0";
        (document.getElementById("txtNewDiscount") as HTMLInputElement).value = "";
    }

    onClickRemoveLineItem(e) {
        store.removeLineItem(e.target.name);
    }

    onChangeQuantity(e) {
        store.updateLineItem(e.target.name, "quantity", e.target.value);
    }

    onChangeAmount(e) {
        store.updateLineItem(e.target.name, "amount", e.target.value);
    }

    onChangeDiscount(e) {
        store.updateLineItem(e.target.name, "discount", e.target.value);
    }

    onChangeItem(e) {
        store.updateLineItem(e.target.name, "itemId", e.target.value);
    }

    render() {        
        var lineItems = [];
        for (var i = 0; i < store.purchaseInvoice.purchaseInvoiceLines.length; i++) {
            lineItems.push(
                <tr key={i}>
                    <td><SelectLineItem store={store} row={i} selected={store.purchaseInvoice.purchaseInvoiceLines[i].itemId} /></td>
                    <td><input type="text" className="form-control" name={i} value={store.purchaseInvoice.purchaseInvoiceLines[i].itemId} onChange={this.onChangeItem.bind(this) } /></td>
                    <td><SelectLineMeasurement row={i} store={store} selected={store.purchaseInvoice.purchaseInvoiceLines[i].measurementId} /></td>
                    <td><input type="text" className="form-control" name={i} value={store.purchaseInvoice.purchaseInvoiceLines[i].quantity} onChange={this.onChangeQuantity.bind(this)} /></td>
                    <td><input type="text" className="form-control" name={i} value={store.purchaseInvoice.purchaseInvoiceLines[i].amount} onChange={this.onChangeAmount.bind(this) } /></td>
                    <td><input type="text" className="form-control" name={i} value={store.purchaseInvoice.purchaseInvoiceLines[i].discount} onChange={this.onChangeDiscount.bind(this) } /></td>
                    <td>{store.getLineTotal(i)}</td>
                    <td>
                        <button type="button" className="btn btn-box-tool">
                            <i className="fa fa-fw fa-times" name={i} onClick={this.onClickRemoveLineItem.bind(this) }></i>
                        </button>
                    </td>
                </tr>
            );
        }
        return (
            <div className="box">
                <div className="box-header with-border">
                    <h3 className="box-title">Line Items</h3>
                    <div className="box-tools pull-right">
                        <button type="button" className="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="Collapse">
                            <i className="fa fa-minus"></i>
                        </button>
                    </div>
                </div>
                <div className="box-body table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <td>Item Id</td>
                                <td>Item Name</td>
                                <td>Measurement</td>
                                <td>Quantity</td>
                                <td>Amount</td>
                                <td>Discount</td>
                                <td>Line Total</td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems}
                            <tr>
                                <td><SelectLineItem store={store} controlId="optNewItemId" /></td>
                                <td>Item Name</td>
                                <td><SelectLineMeasurement store={store} controlId="optNewMeasurementId" /></td>
                                <td><input type="text" className="form-control" id="txtNewQuantity" /></td>
                                <td><input type="text" className="form-control" id="txtNewAmount" /></td>
                                <td><input type="text" className="form-control" id="txtNewDiscount" /></td>
                                <td></td>
                                <td>
                                    <button type="button" className="btn btn-box-tool">
                                        <i className="fa fa-fw fa-check" name={i} onClick={this.addLineItem}></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

@observer
class PurchaseInvoiceTotals extends React.Component<any, {}>{
    render() {
        return (
            <div className="box">
                <div className="box-body">
                    <div className="row">
                        <div className="col-md-2"><label>Running Total: </label></div>
                        <div className="col-md-2">{store.RTotal}</div>
                        <div className="col-md-2"><label>Tax Total: </label></div>
                        <div className="col-md-2">{store.TTotal}</div>
                        <div className="col-md-2"><label>Grand Total: </label></div>
                        <div className="col-md-2">{store.GTotal}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default class AddPurchaseInvoice extends React.Component<any, {}> {
    render() {
        return (
            <div>
                <ValidationErrors />
                <PurchaseInvoiceHeader />
                <PurchaseInvoiceLines />
                <PurchaseInvoiceTotals />
                <div>
                    <SavePurchaseInvoiceButton />
                    <CancelPurchaseInvoiceButton />
                    <PostButton />
                </div>
            </div>
            );
    }
}

ReactDOM.render(<AddPurchaseInvoice />, document.getElementById("divPurchaseInvoice"));